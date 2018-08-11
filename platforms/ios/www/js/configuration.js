//This method is used to fetch category list local database
function fetchConfigurationFromLocal(){
    $('#configurationList').html('');
    var categoryListHtml="";
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, configurationId, configurationName, configurationImage, configurationDesc, countryCode, selectConfiguration FROM configuration WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            if(res.rows.length > 0){
                for(var i=0,j=res.rows.length; i<j;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                    if(localData.selectConfiguration == 1){
                      categoryListHtml += '<li id="'+localData.configurationId+'"><label href="#">'+localData.configurationName+'</label><span class="switch on" configName="'+localData.configurationName+'" configId="'+localData.configurationId+'"></span></li>';
                    }else{
                      categoryListHtml += '<li id="'+localData.configurationId+'"><label href="#">'+localData.configurationName+'</label><span class="switch off" configName="'+localData.configurationName+'" configId="'+localData.configurationId+'"></span></li>';
                    }
                }
                $('#configurationList').append(categoryListHtml);
                $('#configurationList').listview("refresh");
            }else{
                categoryListHtml += '<li><label href="#">Registros no encontrados</label></li>';
                $('#configurationList').append(categoryListHtml);
                $('#configurationList').listview("refresh");
            }
        });
    });
}

//This method is used to fetch category list from webservice to local database
function fetchConfigurationFromWebservice(responseData){
    window.localStorage.setItem("configurationTimeStamp",responseData.timestamp);
    var deleteObj = responseData.delete_at;
    if(deleteObj){
        $.mobile.db.transaction(function(tx) {
            for(var i=0,j=deleteObj.length; i<j;i++){
                if(deleteObj[i].section == "category"){
                    tx.executeSql("DELETE FROM configuration WHERE configurationId=? AND countryCode=?",[deleteObj[i].cat_id, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
                }
            }
        });
    }
    if(responseData.response != false){
        $.mobile.db.transaction(function(tx) {
            for(var i=0,j=responseData.response.length; i<j;i++){
                var imageStr = responseData.response[i].icon?responseData.response[i].icon:"";
                var uniqueId = window.localStorage.getItem("selectedCountry") +""+responseData.response[i].tid;
                var zoneId = responseData.response[i].field_zone_id_value?responseData.response[i].field_zone_id_value:0;
                tx.executeSql("INSERT OR REPLACE INTO configuration (id, configurationId, configurationName, configurationImage, configurationDesc, countryCode, selectConfiguration, appCount,zoneId,weight) VALUES (?,?,?,?,?,?,?,?,?,?)",[uniqueId, responseData.response[i].tid, responseData.response[i].name, imageStr, responseData.response[i].description, window.localStorage.getItem("selectedCountry"), 0,responseData.response[i].appCount,zoneId,responseData.response[i].weight],
                    function(tx, res) {});
                window.localStorage.setItem("categoryApps"+categoryId+"TimeStamp",0);
                if(responseData.response[i].icon){
                    filedownloadurl(responseData.response[i].icon,responseData.response[i].tid,"categoryIcon");
                }
            }
            for(var i=0,j=$.mobile.channelsId.length; i<j;i++){
                tx.executeSql("UPDATE configuration SET selectConfiguration = 1 WHERE id=? AND countryCode=?",[$.mobile.channelsId[i],window.localStorage.getItem("selectedCountry")],function(tx, res) {});
            }
        });
        fetchConfigurationFromLocal();
    }else{
        fetchConfigurationFromLocal();
    }
}

//This method is used to select category is ON/OFF for push notification
function switchClickEvent(e){
    if($(this).attr("class") == "switch on"){
        $(this).removeClass("on");
        $(this).addClass("off");
        var uniqueId = window.localStorage.getItem("selectedCountry") +""+$(this).attr("configId");
        var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
        var configName = $(this).attr("configName").replace(/[^a-zA-Z0-9]/g, '');
        var configParse = countryName+""+configName;
        ga_storage._trackEvent('Configuration', 'off', configName);
        $.mobile.db.transaction(function(tx) {
            if($.mobile.platform == $.mobile.android){
                window.parsePlugin.unsubscribe(configParse,function(){},function(){});
            }else if($.mobile.platform == $.mobile.iOS){
                parsePlugin.unsubscribe(configParse, function() {}, function(e) {});
            }
            removeItem($.mobile.channels,configParse);
            removeItem($.mobile.channelsId,uniqueId);
            tx.executeSql('UPDATE configuration SET selectConfiguration=0 where id = ?', [uniqueId],  function(tx, res) {});
        });
    }else{
        $(this).removeClass("off");
        $(this).addClass("on");
        var uniqueId = window.localStorage.getItem("selectedCountry") +""+$(this).attr("configId");
        var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
        var configName = $(this).attr("configName").replace(/[^a-zA-Z0-9]/g, '');
        var configParse = countryName+""+configName;
        ga_storage._trackEvent('Configuration', 'on', configName);
        $.mobile.db.transaction(function(tx) {
            if($.mobile.platform == $.mobile.android){
                window.parsePlugin.subscribe(configParse,function(){},function(){});
            }else if($.mobile.platform == $.mobile.iOS){
                parsePlugin.subscribe(configParse, function() {}, function(e) {});
            }
            $.mobile.channels.push(configParse);
            $.mobile.channelsId.push(uniqueId);
            tx.executeSql('UPDATE configuration SET selectConfiguration=1 where id = ?', [uniqueId],  function(tx, res) {});
        });
    }
}

//This method is used to navigate from config to home page
function saveContinueClickEvent(){
    var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
    if($.mobile.platform == $.mobile.android){
        window.parsePlugin.subscribe(countryName,function(){},function(){});
    }else if($.mobile.platform == $.mobile.iOS){
        parsePlugin.subscribe(countryName, function() {}, function(e) {});
    }
    $.mobile.pageContainer.pagecontainer("change", 'home.html',{reloadPage : true});
}

//This method is used to call category list webservice in onResume application
function onResumeConfiguration(){
    if(window.location.href.indexOf("configuration.html") != -1){
        if(isConnectionAvailable()){
        	checkMobileRefresh(function(){
        		requestApi($.mobile.baseUrl +"category/termlist?catid=3&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("configurationTimeStamp"),"get",fetchConfigurationFromWebservice);
        	});
        }else{
            fetchConfigurationFromLocal();
        }
    }
}

//This page before show event for configuration page
$(document).on('pagebeforeshow', '#configuration', function (event, data) {
    if(!window.localStorage.getItem('initialAppLoad')){
        //initial load
        $(document).on('click', '#configurationNext', saveContinueClickEvent);
    }else{               
        $('#configurationHeader').append('<a href="#" data-rel="back" class="backArrow"></a>');
        $('#configurationNext').css('display','none');               
    }
    $(document).on('click', '.switch', switchClickEvent);
});

//This page create event for configuration page
$(document).on('pagecreate', '#configuration', function (event, data) {
    ga_storage._trackPageview('configurationList');
    if(isConnectionAvailable()){
    	checkMobileRefresh(function(){
    		requestApi($.mobile.baseUrl +"category/termlist?catid=3&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("configurationTimeStamp"),"get",fetchConfigurationFromWebservice);
    	});
    }else{
        fetchConfigurationFromLocal();
    }
});

//This page show event for configuration page
$(document).on('pageshow', '#configuration', function (event, data) {
    if(!window.localStorage.getItem('initialAppLoad')){
        document.addEventListener("resume", onResumeConfiguration, false);
    }
    $('#country').remove();
});

//This page hide event for configuration page
$(document).on('pagehide', '#configuration', function (event, data) {
    document.removeEventListener("resume", onResumeConfiguration, false);
    $(document).off('click', '.switch', switchClickEvent);
    $(document).off('click', '#configurationNext', saveContinueClickEvent);
});
