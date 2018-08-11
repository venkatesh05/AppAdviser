//This page show event for setting page
$(document).on('pageshow', '#settings', function (event, data) {
    $('.version').text("Version ("+$.mobile.version+")");
    if(window.localStorage.getItem("pushNotification") =="ON"){
        $('#notificationSetting').removeClass('off');
        $('#notificationSetting').addClass('on');
    }else{
        $('#notificationSetting').removeClass('on');
        $('#notificationSetting').addClass('off');
    }
    $.mobile.channels =[];
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT configurationName FROM configuration WHERE countryCode=? AND selectConfiguration=1", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
        for(var i=0,j=res.rows.length; i<j;i++){
            var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
            var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
            var configName = localData.configurationName.replace(/[^a-zA-Z0-9]/g, '');
            var configParse = countryName+""+configName;
            $.mobile.channels.push(configParse);
        }
        });
    });
});

//This click event for push notification ON/OFF overall application
$(document).on('click', '#notificationSetting', function (event, data) {
    if($(this).attr("class") == "on"){
        $(this).removeClass("on");
        $(this).addClass("off");
        var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
        if($.mobile.platform == $.mobile.android){
            window.parsePlugin.unsubscribe(countryName,function(){},function(){});
        }else if($.mobile.platform == $.mobile.iOS){
            parsePlugin.unsubscribe(countryName, function() {}, function(e) {});
        }
        window.localStorage.setItem("pushNotification","OFF");
        for(var i=0,j=$.mobile.channels.length; i<j;i++){
            if($.mobile.platform == $.mobile.android){
               window.parsePlugin.unsubscribe($.mobile.channels[i],function(){},function(){});
            }else if($.mobile.platform == $.mobile.iOS){
                parsePlugin.unsubscribe($.mobile.channels[i], function() {}, function(e) {});
            }
        }
        
    }else{
        $(this).removeClass("off");
        $(this).addClass("on");
        if($.mobile.channels.length == 0){
            var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
            if($.mobile.platform == $.mobile.android){
               window.parsePlugin.unsubscribe(countryName,function(){},function(){});
            }else if($.mobile.platform == $.mobile.iOS){
               parsePlugin.unsubscribe(countryName, function() {}, function(e) {});
            }
        }else{
            var countryName = window.localStorage.getItem("selectedCountryName").replace(/[^a-zA-Z0-9]/g, '');
            if($.mobile.platform == $.mobile.android){
               window.parsePlugin.subscribe(countryName,function(){},function(){});
            }else if($.mobile.platform == $.mobile.iOS){
               parsePlugin.subscribe(countryName, function() {}, function(e) {});
            }
        }
        window.localStorage.setItem("pushNotification","ON");
        for(var i=0,j=$.mobile.channels.length; i<j;i++){
            if($.mobile.platform == $.mobile.android){
                window.parsePlugin.subscribe($.mobile.channels[i],function(){},function(){});
            }else if($.mobile.platform == $.mobile.iOS){
               parsePlugin.subscribe($.mobile.channels[i], function() {}, function(e) {});
            }
        }
    }
});
