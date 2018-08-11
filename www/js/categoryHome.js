var categoryHomeId;
var categoryTagId;
var categoryId;
var categoryName;
var categoryHref;
var catTagCount = 0;
var zoneId;

//This method is used to show tab is highlighted
function activeCatergoryTab(href){
    $('#categoryHomeUL li a').each(function( index ) {
        $(this).removeClass("lang ui-btn-active");
        if($(this).attr("href") == href){
            $(this).addClass("lang ui-btn-active");
        }
    });
}

//This method is used to switch from one tab to another tab
function switchCatergoryTab(href){
    activeCatergoryTab(href);
    var $content = $(href);
    $content.siblings().hide();
    $content.show();
}

//This method is used to switch from one tab to another tab whithout highlight tabs
function switchCatergoryTabOnly(href){
    $('#categoryHomeUL li a').each(function( index ) {
        $(this).removeClass("lang ui-btn-active");
    });
    var $content = $(href);
    $content.siblings().hide();
    $content.show();
}

//This method is used to switch tab contents
$(document).bind('pagebeforechange', '#categoryHome', function(event, data){
    if (typeof data.toPage !== "string"){
        return;
    }
    var url = $.mobile.path.parseUrl(data.toPage);
    var $a = $("div[data-role='navbar'] a[href='" + url.hash + "']");
    if ($a.length){
        event.preventDefault();
    }
    else{
        $a = $(url.hash + " div[data-role='navbar']").find("a.ui-btn-active");
    }
    var $content = $($a.attr("href"));
    $content.siblings().hide();
    $content.show();
});

//This method is used to navigate to detail page
function categoryAppsNavigateToDetailPage(e){
    $(document).off('click', '.categoryAppItem', categoryAppsNavigateToDetailPage);
    window.localStorage.setItem("categoryName",$(this).attr("categoryName"));
    window.localStorage.setItem("detailObj",$(this).attr("detailObj"));
    $.mobile.pageContainer.pagecontainer("change", 'detail.html',{reloadPage : true});
}

//This method is used to fetch individual category app from local database and construct html view to show it in category landing page
function fetchCategoryHomeAppDataLocal(){
    $('.categoryAppContent').html('');
    $('.categoryAppContent').append('<div id="categoryNewSection" class="catHomeSection"></div>');
    $('.categoryAppContent').append('<div id="categoryAllSection"></div>');
    $('#categoryAllSection').html('');
    $('#categoryNewSection').html('');
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM apps INNER JOIN categoryHomepage ON apps.appId=categoryHomepage.appId where categoryHomepage.categoryId = ? AND countryCode = ? AND newApps=?" , [categoryId,window.localStorage.getItem("selectedCountry"),true], function(tx, res) {
            $('#categoryNewSection').html('');
            $('#categoryNewSection').append('<label class="sectionHeader">Nuevas</label><label class="separtor"></label><div id="catScrollHome'+categoryId+'" class="owl-carousel">');
            if(res.rows.length==0){
                $('#categoryNewSection').html('<div class="noRecords">Registros no encontrados</div>');
            }else{
                var newAppscontent = '';
                for(var i=0,j=res.rows.length; i<j;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
 
                    var detailObj = $.parseJSON(decodeURI(localData.appDetailObj));
                    newAppscontent = '<div class="sectionItems categoryAppItem" id="categoryAppId'+localData.appId+'" appId="'+localData.appId+'" detailObj ="'+localData.appDetailObj+'" categoryName ="'+categoryName+'">';
                    newAppscontent +='<img class="image'+localData.appId+' sectionImg" src="img/noimage.png"/>'+
                    '<div class="name">'+localData.appName+'</div>'+
                    '<div class="categoryName">'+categoryName+'</div>'+
                    '<div class="starHome'+localData.appId+'"></div>';
                    if(isConnectionAvailable()){
                      var streamUrl = $.mobile.getStreamInfo+"categoryID="+$.mobile.CATEGORYID+"&streamID="+localData.appId+"&apikey="+$.mobile.GIGYAAPIKEY+"&format=json";
                      showStarRating(streamUrl,"starHome"+localData.appId);
                    }
                    if($.mobile.platform == $.mobile.android){
                        if(detailObj.appdetails.android_pricing.toUpperCase() == "FREE" || detailObj.appdetails.android_pricing.toUpperCase() == ""){
                            newAppscontent += '<div class="amount">'+detailObj.appdetails.android_pricing+'</div>';
                        }else{
                            newAppscontent += '<div class="amount">'+detailObj.appdetails.android_currencytype+''+detailObj.appdetails.android_price+'</div>';
                        }
                    }else if($.mobile.platform == $.mobile.iOS){
                        if(detailObj.appdetails.iphone_pricing.toUpperCase() == "FREE" || detailObj.appdetails.iphone_pricing.toUpperCase() == ""){
                            newAppscontent += '<div class="amount">'+detailObj.appdetails.iphone_pricing+'</div>';
                        }else{
                            newAppscontent += '<div class="amount">'+detailObj.appdetails.iphone_currencytype+''+detailObj.appdetails.iphone_price+'</div>';
                        }
                    }
                    newAppscontent += '</div>';
                    $('#catScrollHome'+categoryId).append(newAppscontent);
                    if(localData.appImage){
                      if(isConnectionAvailable()){
                        $('.image'+localData.appId).attr('src',localData.appImage);
                      }else{
                        get_file(localData.appId,"icon");
                      }
                    }else{
                      $('.image'+localData.appId).attr('src','img/noimage.png');
                    }
                }
                if(res.rows.length>2){
                    $('#catScrollHome'+categoryId).owlCarousel({
                        itemsCustom : [[0, 2.5]],
                        pagination : false,
                        singleItem : false
                    });
                }else{
                    $('#catScrollHome'+categoryId).owlCarousel({
                        itemsCustom : [[0, res.rows.length]],
                        pagination : false,
                        singleItem : false
                    });
                }
                $('#catScrollHome'+categoryId+' .owl-item').addClass('appColumn');
                $('div.owl-item.appColumn').css('width','140px');
            }
        });
    });
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM apps INNER JOIN categoryHomepage ON apps.appId=categoryHomepage.appId where categoryHomepage.categoryId = ? AND countryCode = ? AND allApps=?" , [categoryId,window.localStorage.getItem("selectedCountry"),true], function(tx, res) {
            $('#categoryAllSection').html('');
            $('#categoryAllSection').append('<label class="sectionHeader" id="allApps">Todas</label><span class="allsepartor"></span><ul class="listUI ui-listview" data-role="listview" id="allList"></ul>');
            
            if(res.rows.length == 0){
                $('#allApps').css('display','none');
            }else{
                var content = '';
                for(var i=0;i<res.rows.length;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                    var detailObj = $.parseJSON(decodeURI(localData.appDetailObj));
                    content = '<li class="ui-li-has-thumb categoryAppItem" detailObj ="'+localData.appDetailObj+'" categoryName ="'+categoryName+'"><a class="ui-btn" href="#">'+
                    '<img class="image'+localData.appId+' allListImage roundedCorner" src="img/noimage.png">'+
                    '<div style="width: 100%;margin: 10px;"><div style="width: 80%;float: left;margin-top:5%">'+
                    '<h2>'+localData.appName+'</h2>'+
                    '<div class="categoryName">'+categoryName+'</div>'+
                    '<div class="starHome'+localData.appId+'"></div>'+
                    '</div><div style="width: 20%;float:left;margin-top:15%;">';
                    if(isConnectionAvailable()){
                      var streamUrl = $.mobile.getStreamInfo+"categoryID="+$.mobile.CATEGORYID+"&streamID="+localData.appId+"&apikey="+$.mobile.GIGYAAPIKEY+"&format=json";
                      showStarRating(streamUrl,"starHome"+localData.appId);
                    }
                    if($.mobile.platform == $.mobile.android){
                        if(detailObj.appdetails.android_pricing.toUpperCase() == "FREE" || detailObj.appdetails.android_pricing.toUpperCase() == ""){
                            content += '<h3>'+detailObj.appdetails.android_pricing+'</h3>';
                        }else{
                            content += '<h3>'+detailObj.appdetails.android_currencytype+''+detailObj.appdetails.android_price+'</h3>';
                        }
                    }else if($.mobile.platform == $.mobile.iOS){
                        if(detailObj.appdetails.iphone_pricing.toUpperCase() == "FREE" || detailObj.appdetails.iphone_pricing.toUpperCase() == ""){
                            content += '<h3>'+detailObj.appdetails.iphone_pricing+'</h3>';
                        }else{
                            content += '<h3>'+detailObj.appdetails.iphone_currencytype+''+detailObj.appdetails.iphone_price+'</h3>';
                        }
                    }
                    content += '</div></div>'+
                    '</a>'+
                    '</li>';
                    $('#allList').append(content);
                    if(localData.appImage){
                      if(isConnectionAvailable()){
                        $('.image'+localData.appId).attr('src',localData.appImage);
                      }else{
                        get_file(localData.appId,"icon");
                      }
                    }else{
                      $('.image'+localData.appId).attr('src','img/noimage.png');
                    }
                }
            }
        });
    });
}

//This method is used to fetch individual category app datas from webservice and store in local database
function fetchCategoryHomeAppData(responseData){
    window.localStorage.setItem("categoryApps"+categoryId+"TimeStamp",responseData.timestamp);
    if(responseData.response != false){
        var obj = responseData.response.latest;
        var allObj = responseData.response.All;
        var deleteObj = responseData.response.delete_at;
        if(deleteObj){
            $.mobile.db.transaction(function(tx) {
                for(var i=0;i<deleteObj.length;i++){
                    if(deleteObj[i].section == "categoryuncheck"){
                        tx.executeSql("DELETE FROM categoryHomepage WHERE categoryId=? AND appId=? AND countryCode=?",[deleteObj[i].cat_id, deleteObj[i].ref_id, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
                    }
                    if(deleteObj[i].section == "apps"){
                        tx.executeSql("DELETE FROM categoryHomepage WHERE appId=? AND countryCode=?",[deleteObj[i].ref_id, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
                        tx.executeSql("DELETE FROM apps WHERE appId=?",[deleteObj[i].ref_id],function(tx, res) {});
                        remove_file(deleteObj[i].ref_id+"_icon");
                    }
                }
            });
        }
        if(obj.response != false){
            $.mobile.db.transaction(function(tx) {
                for(var i=0;i<obj.response.length;i++){
                    var id = categoryId +""+obj.response[i].nid+"newApps";
                    tx.executeSql("INSERT OR REPLACE INTO categoryHomepage (id,categoryId,countryCode,appId,newApps,allApps) VALUES (?,?,?,?,?,?)",[id,categoryId,window.localStorage.getItem("selectedCountry"),obj.response[i].nid,true,false],function(tx, res) {});
                    var srcImage = obj.response[i].icon?obj.response[i].icon:"";
                    var detailObj = encodeURI(JSON.stringify(obj.response[i]));
                    tx.executeSql("INSERT OR REPLACE INTO apps (appId, appName, appImage, appDetailObj) VALUES (?,?,?,?)",[obj.response[i].nid, obj.response[i].title, srcImage, detailObj],
                    function(tx, res) {});
                    if(obj.response[i].icon){
                        filedownloadurl(obj.response[i].icon,obj.response[i].nid,"icon");
                    }
                }
            });
        }
        if(allObj.response != false){
            $.mobile.db.transaction(function(tx) {
                for(var i=0;i<allObj.response.length;i++){
                    var id = categoryId +""+allObj.response[i].nid+"moreApps";
                    tx.executeSql("INSERT OR REPLACE INTO categoryHomepage (id,categoryId,countryCode,appId,newApps,allApps) VALUES (?,?,?,?,?,?)",[id,categoryId,window.localStorage.getItem("selectedCountry"),allObj.response[i].nid,false,true],function(tx, res) {});
                    var srcImage = allObj.response[i].icon?allObj.response[i].icon:"";
                    var detailObj = encodeURI(JSON.stringify(allObj.response[i]));
                    tx.executeSql("INSERT OR REPLACE INTO apps (appId, appName, appImage, appDetailObj) VALUES (?,?,?,?)",[allObj.response[i].nid, allObj.response[i].title, srcImage, detailObj],
                    function(tx, res) {});
                    if(allObj.response[i].icon){
                        filedownloadurl(allObj.response[i].icon,allObj.response[i].nid,"icon");
                    }
                }
            });
        }
        fetchCategoryHomeAppDataLocal();
    }else{
        fetchCategoryHomeAppDataLocal();
    }
}

//This method is used to fetch category list from local database
function fetchCategoryHomeListLocal(){
    $('#categoryHomeList').html('');
    var content = '';
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, configurationId, configurationName, configurationImage, configurationDesc, countryCode, selectConfiguration, appCount, zoneId FROM configuration WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            if(res.rows.length>0){
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                
                content = '<li catId='+localData.configurationId+' zoneId='+localData.zoneId+' catName='+localData.configurationName+'><a href="#">'+
                '<img class="image'+localData.configurationId+' roundedCorner" src="img/noimage.png">'+
                '<h2>'+localData.configurationName+' ('+localData.appCount+')</h2>'+
                '</a>'+
                '</li>';
                $('#categoryHomeList').append(content);
                if(localData.configurationImage){
                    if(isConnectionAvailable()){
                      $('.image'+localData.configurationId).attr('src',localData.configurationImage);
                    }else{
                      get_file(localData.configurationId,"categoryIcon");
                    }
                }else{
                    $('.image'+localData.configurationId).attr('src','img/noimage.png');
                }
            }
            
            $('#categoryHomeList').listview("refresh");
            $('#categoryHomeList li').on("click",function(e){
                switchCatergoryTabOnly('#categoryHomeTab');
                categoryId = $(this).attr("catId");
                categoryTagId = categoryHomeId;
                categoryName = $(this).attr("catName");
                zoneId = $(this).attr("zoneId");
                $('#categoryHeadText').html($(this).attr("catName"));
                if(isConnectionAvailable()){
                	checkMobileRefresh(function(){
                		requestApi($.mobile.baseUrl +"apps/category/front?tid="+categoryId+"&lastaccess="+window.localStorage.getItem("categoryApps"+categoryId+"TimeStamp"),"get",fetchCategoryHomeAppData);
                	});
                	clearTimeout("categoryBannerData()");
                    categoryBannerData();
                }else{
                    fetchCategoryHomeAppDataLocal();
                }
                ga_storage._trackEvent('Category - '+$(this).attr("catName"), 'Click', $(this).attr("catName"), $(this).attr("catName"));
            });
            }
            else{
                content = '<li><div class="noRecords lang" data-lang="noRecords"></div></li>';
                $('#categoryList').append(content);
            }
        });
    });
}

//This method is used to fetch category list from webservice
function fetchCategoryHomeList(responseData){
    var configurationTimeStamp = parseInt(new Date().getTime()/1000);
    window.localStorage.setItem("configurationTimeStamp",responseData.timestamp);
    var deleteObj = responseData.delete_at;
    if(deleteObj){
        $.mobile.db.transaction(function(tx) {
            for(var i=0,j=deleteObj.length; i<j;i++){
                if(deleteObj[i].section == "category"){
                    tx.executeSql("DELETE FROM configuration WHERE configurationId=? AND countryCode=?",[deleteObj[i].cat_id, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
                    remove_file(deleteObj[i].cat_id+"_categoryIcon");
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
                tx.executeSql("INSERT OR REPLACE INTO configuration (id, configurationId, configurationName, configurationImage, configurationDesc, countryCode, selectConfiguration, appCount, zoneId, weight) VALUES (?,?,?,?,?,?,?,?,?,?)",[uniqueId, responseData.response[i].tid, responseData.response[i].name, imageStr, responseData.response[i].description, window.localStorage.getItem("selectedCountry"), 0,responseData.response[i].appCount,zoneId,responseData.response[i].weight],
                                              function(tx, res) {});                
            }
        });
        fetchCategoryHomeListLocal();
    }else{
        fetchCategoryHomeListLocal();
    }
}

//This method is used to navigate from category list click events
function categoryTabClickEvent(event, data){
    categoryTagId = $(this).attr("tagId");
    catTagCount = parseInt($(this).attr("catTagCount"));
    zoneId = parseInt($(this).attr("zoneId"));
    if(isConnectionAvailable()){
        $('#categoryBanner').css('display','block');
        clearTimeout("categoryBannerData()");
        categoryBannerData();
    }else{
        $('#categoryBanner').css('display','none');
    }
    if(categoryTagId=="categoryPageTab"){
        switchCatergoryTab('#'+categoryTagId);
        categoryHref = '#categoryPageTab';
        var tabPageView = 'categoryList';
        ga_storage._trackPageview(tabPageView);
        if(isConnectionAvailable()){
        	checkMobileRefresh(function(){
        		requestApi($.mobile.baseUrl +"category/termlist?catid=3&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("configurationTimeStamp"),"get",fetchCategoryHomeList);
        	});
        }else{
            fetchCategoryHomeListLocal();
        }
    }else if(categoryTagId=="categoryHomeTab"){
        var tabPageView = 'appslist/Inicio';
        ga_storage._trackPageview(tabPageView);
        window.localStorage.setItem('tagHref',"");
        window.history.back();
    }else{
        var tabPageView = 'appslist/tags/'+$(this).attr("tagName");
        ga_storage._trackPageview(tabPageView);
        categoryHref = '#'+categoryTagId;
        window.localStorage.setItem('tagHref',categoryHref);
        window.localStorage.setItem('catTagCount',catTagCount);
        window.history.back();
    }
}

//This method is used to show banners in category landing page
function categoryBannerData()
{
    if(zoneId==0){
        $('#categoryBanner').css('display','none');
    }else{
        $('#categoryBanner').css('display','block');
        var m3_u = (location.protocol=='https:'?'https://ads.tigocloud.net/www/delivery/ajs.php':'http://ads.tigocloud.net/www/delivery/ajs.php');
        if (!document.MAX_used) document.MAX_used = ',';
        $.ajax({
            url: m3_u + '?zoneid='+zoneId,
            type: 'GET',
            contentType: 'text/plain',
            dataType: 'text',
            error: function(a,b,c){
            },
            success: function( responseData ){
               responseData=responseData.replace('document.write','$(\'#categoryBanner\').html');
               $('#categoryBanner').html('<script>'+responseData+'<\/script>');
               $('#categoryBanner a img').css("width","100%");
               $('#categoryBanner a img').css("height","200px");
               $('#categoryBanner a').click(function(){
                    var full = $(this).attr('href').split('oadest=')[1];
                    var id = full.split('%40%40%40');
                    pushNotificationNavigation("",id[0],id[1]);
                    return false;
                });
            }
        });        
        setTimeout("categoryBannerData()",5000);
    }
}

//This method is used to show tags from local database
function categoryTagDataLocal(){
    var content = '';
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, tagId, tagName, countryCode FROM tags WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            catTagCount = 0;
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                content += '<li catTagCount='+catTagCount+' tagId="'+localData.tagId+'" tagName="'+localData.tagName+'"><a class="tabLabel ui-link ui-btn" data-inline="true" href="#category'+localData.tagId+'">'+localData.tagName+'</a></li>';
                catTagCount++;
            }
            $('#categoryHomeUL').append(content);
            if(res.rows.length>=3){
                $('#categoryHomeUL').owlCarousel({
                    itemsCustom : [[0, 3]],
                    pagination : false,
                    singleItem : false
                });
            }else{
                $('#categoryHomeUL').owlCarousel({
                    itemsCustom : [[0, res.rows.length+2]],
                    pagination : false,
                    singleItem : false
                });
            }
            $('#categoryHomeUL li').removeClass();
        });
    });
}

//This method is used to fetch tags from webservice to local database
function categoryTagDataWebservice(responseData){
    var tagsTimeStamp = parseInt(new Date().getTime()/1000);
    window.localStorage.setItem("tagsTimeStamp",responseData.timestamp);
    var deleteObj = responseData.delete_at;
    if(deleteObj){
        $.mobile.db.transaction(function(tx) {
            for(var i=0,j=deleteObj.length; i<j;i++){
                if(deleteObj[i].section == "tags"){
                    tx.executeSql("DELETE FROM tags WHERE tagId=? AND countryCode=?",[deleteObj[i].cat_id, window.localStorage.getItem("selectedCountry")],function(tx, res){});
                }
            }
        });
    }
    if(responseData.response != false){
        $.mobile.db.transaction(function(tx) {
            for(var i=0;i<responseData.response.length;i++){
                var uniqueId = window.localStorage.getItem("selectedCountry") +""+responseData.response[i].tid;
                tx.executeSql("INSERT OR REPLACE INTO tags (id, tagId, tagName, countryCode, weight) VALUES (?,?,?,?,?)",
                [uniqueId, responseData.response[i].tid, responseData.response[i].name, window.localStorage.getItem("selectedCountry"),responseData.response[i].weight],
                function(tx, res) {});
            }
        });
        categoryTagDataLocal();
    }else{
        categoryTagDataLocal();
    }
}

//This method is used to show banner image
function onResumeCategoryHome(){
    if(isConnectionAvailable()){
        $('#categoryBanner').css('display','block');
        clearTimeout("categoryBannerData()");
        categoryBannerData();
    }else{
        $('#categoryBanner').css('display','none');
    }
}

//This method is used to open search page
function openCategorySearch(e){
    $.mobile.pageContainer.pagecontainer("change", 'search.html',{reloadPage : true});
}

//This page show event for category landing page
$(document).on('pageshow', '#categoryHome', function(event, data){
    document.addEventListener("resume", onResumeCategoryHome, false);
    if(isConnectionAvailable()){
        $('#categoryBanner').css('display','block');
        clearTimeout("categoryBannerData()");
        categoryBannerData();
    }else{
        $('#categoryBanner').css('display','none');
    }
    switchCatergoryTab(categoryHref);
    $(document).on('click', '.categoryAppItem', categoryAppsNavigateToDetailPage);
    $(document).on('click', '#categoryHomeUL li', categoryTabClickEvent);
    $(document).on('click', '#categorySearchIcon', openCategorySearch);
    $('a.backArrow').removeClass("ui-btn-left ui-link ui-btn ui-shadow ui-corner-all");
});

//This page create event for category landing page
$(document).on('pagecreate', '#categoryHome', function(event, data){
    categoryId = window.localStorage.getItem("categoryId");
    categoryName = window.localStorage.getItem("categoryName");
    zoneId = window.localStorage.getItem("zoneId");
    $('#categoryHeadText').html(categoryName);
    var categoryPageView = 'appslist/category/'+categoryName;
    ga_storage._trackPageview(categoryPageView);
    if(isConnectionAvailable()){
    	clearTimeout("categoryBannerData()");
        categoryBannerData();
        checkMobileRefresh(function(){
        	requestApi($.mobile.baseUrl +"apps/category/front?tid="+categoryId+"&lastaccess="+window.localStorage.getItem("categoryApps"+categoryId+"TimeStamp"),"get",fetchCategoryHomeAppData);
        	requestApi($.mobile.baseUrl +"category/termlist?catid=4&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("tagsTimeStamp"),"get",categoryTagDataWebservice);
        });
    }else{
        $('#categoryBanner').css('display','none');
        fetchCategoryHomeAppDataLocal();
        categoryTagDataLocal();
    }
});

//This page before show event for category landing page
$(document).on('pagebeforeshow', '#home', function (event, data) {
    categoryHref="";
    $(document).off('click', '.categoryAppItem', categoryAppsNavigateToDetailPage);
    $(document).off('click', '#categoryHomeUL li', categoryTabClickEvent);
    $(document).off('click', '#categorySearchIcon', openCategorySearch);
    $("#categoryHome").remove();
});

//This page hide event for category landing page
$(document).on('pagehide', '#categoryHome', function(event, data){
    $(document).off('click', '.categoryAppItem', categoryAppsNavigateToDetailPage);
    $(document).off('click', '#categoryHomeUL li', categoryTabClickEvent);
    $(document).off('click', '#categorySearchIcon', openCategorySearch);
});
