var tagId;
var tagName;
var tagCount = 0;
var href = '#homeTab';
var bannerId = 0;

//This method is used to navigate home tab from menu click 
function navigateHome(){
    $.mobile.silentScroll(0);
    href = "#homeTab";
    switchTab(href);
    var owl = $('#tab').data('owlCarousel');
    owl.jumpTo(1); // Go to x slide
}

//This page create event for all pages to get langauge specific content
$(document).on('pagebeforecreate',function(){
    changeLanguageConent();
});

//This page init event for all pages
$(document).on('pageinit',function(){
    $('body').removeClass("ui-panel-page-container-b");
    $('a.menuIcon').removeClass("ui-link ui-btn-left ui-btn ui-shadow ui-corner-all");
    $('a.searchIcon').removeClass("ui-link ui-btn-right ui-btn ui-shadow ui-corner-all");
    $('a.tickIcon').removeClass("ui-link ui-btn-right ui-btn ui-shadow ui-corner-all");
    $('a.backArrow').removeClass("ui-btn-left ui-link ui-btn ui-shadow ui-corner-all");
    $('.ui-fixed-hidden').css("position","fixed");
    if($.mobile.platform == $.mobile.android){
        $('img.imgHeader').css('margin','7px auto');
    }
});

//This page show event for all pages
$(document).on('pageshow',function(){
    $(document).on('click', '.inicioClick', navigateHome);
});

//This method is used to switch tab and highlight tabs
function activeTab(href){
    $('#tab li a').each(function( index ) {
        $(this).removeClass("lang ui-btn-active");
        if($(this).attr("href") == href){
            $(this).addClass("lang ui-btn-active");
        }
    });
}

//This method is used to switch tab
function switchTab(href){
    activeTab(href);
    var $content = $(href);
    $content.siblings().hide();
    $content.show();
}

//This method is used to switch tab based content
function tabNavigation(event, data){
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
}

//This method is used to Fetch tag based apps from local database
function fetchAppDataLocal(){
    $('#'+tagId).html('');
    $.mobile.db.transaction(function(exec) {
        var likeQuery = tagId+"%";
        exec.executeSql("SELECT categoryName FROM categoryDisplay WHERE whereToShow LIKE ? AND countryCode = ?" , [likeQuery,window.localStorage.getItem("selectedCountry")], function(tx, res) {
            if(res.rows.length==0){
                $('#'+tagId).append('<div id="sections'+tagId+'"></div>');
                $('#sections'+tagId).html('<div class="noRecords">Registros no encontrados</div>');
            }else{
                for(var i=0,j=res.rows.length; i<j;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                    var sectionId = localData.categoryName.replace(/[^a-zA-Z0-9]/g, '');
                    $('#'+tagId).append('<div id="sections'+tagId+''+sectionId+'"></div>');
                    $('#sections'+tagId+''+sectionId).html('');
                    $('#sections'+tagId+''+sectionId).append('<label class="sectionHeader">'+localData.categoryName+'</label><label class="separtor"></label><div id="scroll'+tagId+''+sectionId+'" class="owl-carousel">');
                    exec.executeSql("SELECT * FROM apps INNER JOIN displayApps ON apps.appId=displayApps.appId where displayApps.pageId LIKE ? AND displayApps.categoryId = ? AND displayApps.countryCode = ?",[likeQuery,localData.categoryName,window.localStorage.getItem("selectedCountry")], function(appx, appResult) {
                        var content = '';
                        for(var i=0,j=appResult.rows.length; i<j;i++){
                            var appData = JSON.parse(JSON.stringify(appResult.rows.item(i)));
                            var detailObj = $.parseJSON(decodeURI(appData.appDetailObj));
                            var id = appData.categoryId.replace(/[^a-zA-Z0-9]/g, '');
                            content = '<div class="sectionItems homeAppItem" id="appId'+appData.appId+'" appId="'+appData.appId+'" detailObj ="'+appData.appDetailObj+'" categoryName ="'+appData.categoryId+'">';
                            content +='<img class="image'+appData.appId+' sectionImg" src="img/noimage.png"/>'+
                            '<div class="name">'+appData.appName+'</div>'+
                            '<div class="categoryName">'+appData.categoryId+'</div>'+
                            '<div class="starHome'+appData.appId+'"></div>';
                            if(isConnectionAvailable()){
                            var streamUrl = $.mobile.getStreamInfo+"categoryID="+$.mobile.CATEGORYID+"&streamID="+appData.appId+"&apikey="+$.mobile.GIGYAAPIKEY+"&format=json";
                            showStarRating(streamUrl,"starHome"+appData.appId);
                            }
                            if($.mobile.platform == $.mobile.android){
                                if(detailObj.appdetails.android_pricing.toUpperCase() == "FREE" || detailObj.appdetails.android_pricing.toUpperCase() == ""){
                                    content += '<div class="amount">'+detailObj.appdetails.android_pricing+'</div>';
                                }else{
                                    content += '<div class="amount">'+detailObj.appdetails.android_currencytype+''+detailObj.appdetails.android_price+'</div>';
                                }
                            }else if($.mobile.platform == $.mobile.iOS){
                                if(detailObj.appdetails.iphone_pricing.toUpperCase() == "FREE" || detailObj.appdetails.iphone_pricing.toUpperCase() == ""){
                                    content += '<div class="amount">'+detailObj.appdetails.iphone_pricing+'</div>';
                                }else{
                                    content += '<div class="amount">'+detailObj.appdetails.iphone_currencytype+''+detailObj.appdetails.iphone_price+'</div>';
                                }
                            }
                            content += '</div>';
                            $('#scroll'+tagId+''+id).append(content);
                            if(appData.appImage){
                                if(isConnectionAvailable()){
                                    $('.image'+appData.appId).attr('src',appData.appImage);
                                }else{
                                    get_file(appData.appId,"icon");
                                }
                            }else{
                                $('.image'+appData.appId).attr('src','img/noimage.png');
                            }
                        }
                        if(appResult.rows.length>2){
                            $('#scroll'+tagId+''+id).owlCarousel({
                                itemsCustom : [[0, 2.5]],
                                pagination : false,
                                singleItem : false
                            });
                        }else{
                            $('#scroll'+tagId+''+id).owlCarousel({
                                itemsCustom : [[0, appResult.rows.length]],
                                pagination : false,
                                singleItem : false
                            });
                        }
                        $('#scroll'+tagId+''+id+' div.owl-item').addClass('appColumn');
                        $('div.owl-item.appColumn').css('width','140px');
                    });
                }
            }
        });
    });
}

//This method is used to delete category from local database
function deleteCategoryDisplayFromTag(tagCatId,appId,code){
    $.mobile.db.transaction(function(tx) {
        var deleteLikeQuery = "DELETE FROM displayApps WHERE pageId like '"+tagId+"%"+appId+"' AND tagId="+tagCatId+" AND countryCode = '"+code+"'";
        tx.executeSql(deleteLikeQuery,[],function(tx, res) {});
        var selectLikeQuery = "SELECT * FROM displayApps WHERE pageId like '"+tagId+"%' AND tagId="+tagCatId+" AND countryCode = '"+code+"'";
        tx.executeSql(selectLikeQuery,[], function(tx, res) {
            if(res.rows.length == 0){
                var likeQuery = tagId+"%";
                tx.executeSql("DELETE FROM categoryDisplay WHERE whereToShow like "+likeQuery+" AND tagId=? AND countryCode=?",[tagCatId,code],function(tx, res) {});
            }
        });
        var deleteLikeQuery = "DELETE FROM displayApps WHERE pageId like '%"+appId+"' AND tagId="+tagCatId+" AND countryCode = '"+code+"'";
        tx.executeSql(deleteLikeQuery,[],function(tx, res) {});
        var selectLikeQuery = "SELECT * FROM displayApps WHERE pageId like '%"+appId+"' AND tagId="+tagCatId+" AND countryCode = '"+code+"'";
        tx.executeSql(selectLikeQuery,[], function(tx, res) {
            if(res.rows.length == 0){
                var likeQuery = tagId+"%";
                tx.executeSql("DELETE FROM categoryDisplay WHERE tagId=? AND countryCode=?",[tagCatId,code],function(tx, res) {});
            }
        });
    });
}

//This method is used to delete tag based apps data from local database
function deleteTagApps(tagCatId,appId,code){
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("DELETE FROM displayApps WHERE appId=? AND countryCode=?",[appId, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM apps WHERE appId=?",[appId],function(tx, res) {});
        remove_file(appId+"_icon");
    });
}

//This method is used to fetch tag based apps data from webservice
function fetchAppData(responseData){
    var tagAppsTimeStamp = parseInt(new Date().getTime()/1000);
    //window.localStorage.setItem("tagItem'"+tagId+"'",tagAppsTimeStamp);
    
    $.mobile.db.transaction(function(tx) {
    	tx.executeSql("DELETE FROM categoryDisplay WHERE whereToShow LIKE '"+tagId+"%'" ,[],function(tx, res) {});
        tx.executeSql("DELETE FROM displayApps WHERE pageId LIKE '"+tagId+"%'",[],function(tx, res) {});
        if(responseData.response != false){            
            var obj = responseData.response;
            for(var key in obj) {
                var innerObj = obj[key];
                if(key == "delete_at"){
                    for(var i=0;i<innerObj.length;i++){
                        if(innerObj[i].section == "tagandcat"){
                            deleteCategoryDisplayFromTag(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                        }
                        if(innerObj[i].section == "apps"){
                            deleteTagApps(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                        }
                        if(innerObj[i].section == "categoryuncheck"){
                            deleteCategoryDisplayFromTag(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                        }
                        if(innerObj[i].section == "taguncheck"){
                            deleteTagUncheckApps(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                        }
                    }
                }
                if(innerObj){
                    var idsArray = key.split('|');
                    var sectionId = idsArray[0].replace(/[^a-zA-Z0-9]/g, '');
                    var whereToShow = tagId+''+sectionId;
                    if(key != "delete_at"){
                        tx.executeSql("INSERT OR REPLACE INTO categoryDisplay (whereToShow,categoryName,countryCode,tagId) VALUES (?,?,?,?)",[whereToShow,idsArray[0],window.localStorage.getItem("selectedCountry"),tagId],function(tx, res) {});
                        for(var i=0;i<innerObj.length;i++){
                            var pageId = tagId+""+sectionId+""+innerObj[i].nid;
                            tx.executeSql("INSERT OR REPLACE INTO displayApps (pageId, appId, categoryId, countryCode, tagId) VALUES (?,?,?,?,?)",[pageId,innerObj[i].nid,idsArray[0],window.localStorage.getItem("selectedCountry"),idsArray[1]],
                                        function(tx, res) {});
                            var detailObj = encodeURI(JSON.stringify(innerObj[i]));
                             tx.executeSql("INSERT OR REPLACE INTO apps (appId, appName, appImage, appDetailObj) VALUES (?,?,?,?)",[innerObj[i].nid, innerObj[i].title, innerObj[i].icon, detailObj],function(tx, res) {});
                            if(innerObj[i].icon){
                                filedownloadurl(innerObj[i].icon,innerObj[i].nid,"icon");
                            }
                        }
                    }
                }
            }
        }
    });
    fetchAppDataLocal();
}

//This method is used to fetch home data from local database
function fetchHomeAppLocal(){
    $('.appContent').html('');
    $.mobile.db.transaction(function(tx) {
        var categoryFetchQuery;
        if($.mobile.sorting.length > 0){
            categoryFetchQuery = "SELECT categoryName,tagId FROM categoryDisplay WHERE whereToShow LIKE 'HomePage%' AND countryCode = ? ORDER BY ";
            for(var i=0;i<$.mobile.sorting.length;i++){
                if(i == $.mobile.sorting.length-1){
                    categoryFetchQuery += "categoryName='"+$.mobile.sorting[i]+"' Desc";
                }else{
                    categoryFetchQuery += "categoryName='"+$.mobile.sorting[i]+"' Desc,";
                }
            }
        }else{
            categoryFetchQuery = "SELECT categoryName,tagId FROM categoryDisplay WHERE whereToShow LIKE 'HomePage%' AND countryCode = ?";
        }
                            
        tx.executeSql(categoryFetchQuery , [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            if(res.rows.length==0){
                $('.appContent').html('');
                $('.appContent').append('<div id="sectionshomeTab"></div>');
                $('#sectionshomeTab').html('<div class="noRecords">Registros no encontrados</div>');
            }else{
                for(var i=0,j=res.rows.length; i<j;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                    var sectionId = localData.categoryName.replace(/[^a-zA-Z0-9]/g, '');
                    $('.appContent').append('<div id="sections'+sectionId+'"></div>');
                    $('#sections'+sectionId).html('');
                    $('#sections'+sectionId).append('<label class="sectionHeader">'+localData.categoryName+'</label><div class="moreButton" tagId="'+localData.tagId+'" ><label class="lang" data-lang="more">Todas</label></div><label class="separtor"></label><div id="scroll'+sectionId+'" class="owl-carousel">');
                    tx.executeSql("SELECT * FROM apps INNER JOIN displayApps ON apps.appId=displayApps.appId where displayApps.categoryId = ? AND countryCode = ?",[localData.categoryName,window.localStorage.getItem("selectedCountry")], function(appx, appResult) {
                        var content = '';
                        
                        for(var i=0,j=appResult.rows.length; i<j;i++){
                            var appData = JSON.parse(JSON.stringify(appResult.rows.item(i)));
                            var detailObj = $.parseJSON(decodeURI(appData.appDetailObj));
                            var id = appData.categoryId.replace(/[^a-zA-Z0-9]/g, '');
                            content = '<div class="sectionItems homeAppItem" id="appId'+appData.appId+'" appId="'+appData.appId+'" detailObj ="'+appData.appDetailObj+'" categoryName ="">';
                            content += '<img class="image'+appData.appId+' sectionImg" src="img/noimage.png"/>'+
                            '<div class="name">'+appData.appName+'</div>'+
                            '<div class="categoryName">'+detailObj.appdetails.app_category+'</div>'+
                            '<div class="starHome'+appData.appId+'"></div>';
                                  
                            if(isConnectionAvailable()){
                            var streamUrl = $.mobile.getStreamInfo+"categoryID="+$.mobile.CATEGORYID+"&streamID="+appData.appId+"&apikey="+$.mobile.GIGYAAPIKEY+"&format=json";
                            showStarRating(streamUrl,"starHome"+appData.appId);
                            }
                            
                            if($.mobile.platform == $.mobile.android){
                                if(detailObj.appdetails.android_pricing.toUpperCase() == "FREE" || detailObj.appdetails.android_pricing.toUpperCase() == ""){
                                  content += '<div class="amount">'+detailObj.appdetails.android_pricing+'</div>';
                                }else{
                                  content += '<div class="amount">'+detailObj.appdetails.android_currencytype+''+detailObj.appdetails.android_price+'</div>';
                                }
                            }else if($.mobile.platform == $.mobile.iOS){
                                if(detailObj.appdetails.iphone_pricing.toUpperCase() == "FREE" || detailObj.appdetails.iphone_pricing.toUpperCase() == ""){
                                  content += '<div class="amount">'+detailObj.appdetails.iphone_pricing+'</div>';
                                }else{
                                  content += '<div class="amount">'+detailObj.appdetails.iphone_currencytype+''+detailObj.appdetails.iphone_price+'</div>';
                                }
                            }
                            content += '</div>';
                            $('#scroll'+id).append(content);
                                  
                            if(appData.appImage){
                                if(isConnectionAvailable()){
                                  $('.image'+appData.appId).attr('src',appData.appImage);
                                }else{
                                  get_file(appData.appId,"icon");
                                }
                            }else{
                                $('.image'+appData.appId).attr('src','img/noimage.png');
                            }
                        }
                        if(appResult.rows.length>2){
                            $('#scroll'+id).owlCarousel({
                                itemsCustom : [[0, 2.5]],
                                pagination : false,
                                singleItem : false
                            });
                        }else{
                            $('#scroll'+id).owlCarousel({
                                itemsCustom : [[0, appResult.rows.length]],
                                pagination : false,
                                singleItem : false
                            });
                        }
                        $('#scroll'+id+' div.owl-item').addClass('appColumn');
                        $('div.owl-item.appColumn').css('width','140px');
                  });
              }
           }
        });
    });    
}

//This method is used to delete Tag info in INCIO page from local database
function deleteTagDisplay(sortList,code){
    $.mobile.db.transaction(function(tx) {
    	for(var i=0;i<sortList.length;i++){
    		alert(sortList[i]);
    		tx.executeSql("DELETE FROM displayApps WHERE tagId=? AND countryCode=?",[sortList[i], code],function(tx, res) {});
    		tx.executeSql("SELECT * FROM categoryDisplay INNER JOIN displayApps WHERE categoryDisplay.tagId=displayApps.tagId AND categoryDisplay.whereToShow LIKE 'HomePage%' AND displayApps.tagId=? AND categoryDisplay.countryCode=?" , [sortList[i],code], function(tx, res) {
    			if(res.rows.length == 0){
    				tx.executeSql("DELETE FROM categoryDisplay WHERE whereToShow LIKE 'HomePage%' AND tagId=? AND countryCode=?",[sortList[i],code],function(tx, res) {});
    			}
    		});
    	}
    });
}

//This method is used to delete Tag info in INCIO page from local database
function deleteCategoryDisplay(tagCatId,appId,code){
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("DELETE FROM displayApps WHERE tagId=? AND appId=? AND countryCode=?",[tagCatId, appId, code],function(tx, res) {});
        tx.executeSql("SELECT * FROM categoryDisplay INNER JOIN displayApps WHERE categoryDisplay.tagId=displayApps.tagId AND categoryDisplay.whereToShow LIKE 'HomePage%' AND displayApps.tagId=? AND categoryDisplay.countryCode=?" , [tagCatId,code], function(tx, res) {
            if(res.rows.length == 0){
                tx.executeSql("DELETE FROM categoryDisplay WHERE whereToShow LIKE 'HomePage%' AND tagId=? AND countryCode=?",[tagCatId,code],function(tx, res) {});
            }
        });
    });
}

//This method is used to delete apps from local database
function deleteApps(tagCatId,appId,code){
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("DELETE FROM displayApps WHERE appId=? AND countryCode=?",[appId, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM categoryHomepage WHERE appId=? AND countryCode=?",[appId, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM apps WHERE appId=?",[appId],function(tx, res) {});
        remove_file(appId+"_icon");
    });
}

//This method is used to delete tags from local database
function deleteHomeTag(tagCatId,appId,code){
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("DELETE FROM displayApps WHERE tagId=? AND countryCode=?",[tagCatId, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM categoryDisplay WHERE whereToShow like 'HomePage%' AND tagId=? AND countryCode=?",[tagCatId,code],function(tx, res) {});
    });
}

//This method is used to fetch home page data from webservice and store in local database
function fetchHomeAppData(responseData){
    window.localStorage.setItem("homeAppsTimeStamp",responseData.timestamp);
    bannerId = responseData.homebannerid?responseData.homebannerid:0;
    clearTimeout("bannerData()");
    bannerData();
    $.mobile.db.transaction(function(tx) {
    if(responseData.sorted_order.length>0){
       	deleteTagDisplay(responseData.sorted_order, window.localStorage.getItem("selectedCountry"));
    }
    if(responseData.response != false){
        var obj = responseData.response;
        for(var key in obj) {
            var innerObj = obj[key];            
            if(key == "delete_at"){
                for(var i=0;i<innerObj.length;i++){
                    if(innerObj[i].section == "tagandcat"){
                        deleteCategoryDisplay(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                    }
                    if(innerObj[i].section == "apps"){
                        deleteApps(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                    }
                    if(innerObj[i].section == "showonhometag"){
                        deleteHomeTag(innerObj[i].cat_id, innerObj[i].ref_id, window.localStorage.getItem("selectedCountry"));
                    }
                }
            }
            if(innerObj){
                var idsArray = key.split('|');
                var sectionId = idsArray[0].replace(/[^a-zA-Z0-9]/g, '');
                var whereToShow = 'HomePage'+sectionId;
                if(key != "delete_at"){
                    tx.executeSql("INSERT OR REPLACE INTO categoryDisplay (whereToShow,categoryName,countryCode,tagId) VALUES (?,?,?,?)",[whereToShow,idsArray[0],window.localStorage.getItem("selectedCountry"),idsArray[1]],function(tx, res) {});
                    for(var i=0;i<innerObj.length;i++){
                        var pageId = 'HomePage'+sectionId+""+innerObj[i].nid;
                        tx.executeSql("INSERT OR REPLACE INTO displayApps (pageId, appId, categoryId, countryCode, tagId) VALUES (?,?,?,?,?)",[pageId, innerObj[i].nid, idsArray[0], window.localStorage.getItem("selectedCountry"),idsArray[1]],
                        function(tx, res) {});
                        var srcImage = innerObj[i].icon?innerObj[i].icon:"";
                        var detailObj = encodeURI(JSON.stringify(innerObj[i]));
                        tx.executeSql("INSERT OR REPLACE INTO apps (appId, appName, appImage, appDetailObj) VALUES (?,?,?,?)",[innerObj[i].nid, innerObj[i].title, srcImage, detailObj],
                        function(tx, res) {});
                        if(innerObj[i].icon){
                            filedownloadurl(innerObj[i].icon,innerObj[i].nid,"icon");
                        }
                    }
                }
                sectionId = idsArray[0];
                $.mobile.sorting.push(sectionId);
            }else{
                var idsArray = key.split('|');
                var sectionId = idsArray[0];
                $.mobile.sorting.push(sectionId);
            }
        }
    }
    });
    fetchHomeAppLocal();
}

//This method is used to show banners in home page
function bannerData()
{
    if(bannerId == 0){
        $('#banner').css('display','none');
    }else{
        $('#banner').css('display','block');
        var m3_u = (location.protocol=='https:'?'https://ads.tigocloud.net/www/delivery/ajs.php':'http://ads.tigocloud.net/www/delivery/ajs.php');        
        if (!document.MAX_used) document.MAX_used = ',';
        $.ajax({
            url: m3_u + '?zoneid='+bannerId,
            type: 'GET',
            contentType: 'text/plain',
            dataType: 'text',
            error: function(a,b,c){
            },
            success: function( responseData ){
               responseData=responseData.replace('document.write','$(\'#banner\').html');
               $('#banner').html('<script>'+responseData+'<\/script>');
               $('#banner a').click(function(){
                    var full = $(this).attr('href').split('oadest=')[1];
                    var id = full.split('%40%40%40');
                    pushNotificationNavigation("",id[0],id[1]);
                    return false;
               });
            }
        });        
        setTimeout("bannerData()",5000);
    }
}

//This method is used to fetch Category list from local database
function fetchCategoriesFromLocal(){    
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, configurationId, configurationName, configurationImage, configurationDesc, countryCode, selectConfiguration, appCount, zoneId FROM configuration WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            $('#categoryTab').html('');
            $('#categoryTab').html('<ul data-role="listview" id="categoryList" class="ui-listview">');
            $('#categoryList').html('');
            var content = '';
            if(res.rows.length>0){
                for(var i=0,j=res.rows.length; i<j;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                    content = '<li catId='+localData.configurationId+' catName='+localData.configurationName+' zoneId='+localData.zoneId+'  class="ui-li-has-thumb"><a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r">'+
                    '<img class="image'+localData.configurationId+' roundedCorner" src="img/noimage.png">'+
                    '<h2>'+localData.configurationName+' ('+localData.appCount+')</h2>'+
                    '</a>'+
                    '</li>';
                    $('#categoryList').append(content);
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
                $('#categoryList li').on("click",function(e){
                    window.localStorage.setItem("categoryId",$(this).attr("catId"));
                    window.localStorage.setItem("categoryName",$(this).attr("catName"));
                    window.localStorage.setItem("zoneId",$(this).attr("zoneId"));
                    $.mobile.pageContainer.pagecontainer("change", 'categoryHome.html',{reloadPage : true});
                    switchTab('#homeTab');
                    href = '#homeTab';
                });
            }else{
                content = '<li><div class="noRecords">Registros no encontrados</div></li>';
                $('#categoryList').append(content);
            }
        });
    });
}

//This method is used to fetch Category list from webservice to local database
function fetchCategoryList(responseData){
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
        fetchCategoriesFromLocal();
    }else{
        fetchCategoriesFromLocal();
    }
}

//This method is used to load and show tab contents
function loadTabContent(href,loadTagId,catTagCount){
    $('#tab li a').each(function( index ) {
        $(this).removeClass("lang ui-btn-active");
        if($(this).attr("href") == href){
            $(this).addClass("lang ui-btn-active");
        }
    });
    tagId = loadTagId;
    var $content = $(href);
    $content.siblings().hide();
    $content.show();
    if(catTagCount){
        var owl = $('#tab').data('owlCarousel');
        var tagIndex = parseInt(catTagCount) + 2;
        owl.jumpTo(tagIndex);
    }
    if(isConnectionAvailable()){
        requestApi($.mobile.baseUrl +"apps/tag/front?tid="+tagId,"get",fetchAppData);
    }else{
        fetchAppDataLocal();
    }
    window.localStorage.setItem('tagHref',"");
}

//This method is used to switch tabs using click events
function tabClickEvent(){
    tagId = $(this).attr("tagId");
    tagCount = parseInt($(this).attr("tagCount"));
    switchTab('#'+tagId);
    var owl = $('#tab').data('owlCarousel');
    tagCount = tagCount + 2;
    owl.jumpTo(tagCount);
    if(isConnectionAvailable()){
        $('#banner').css('display','block');
        clearTimeout("bannerData()");
        bannerData();
        if(tagId=="categoryTab"){
            href = "#categoryTab";
            var tabPageView = 'categoryList';
            ga_storage._trackPageview(tabPageView);
            checkMobileRefresh(function(){
            	requestApi($.mobile.baseUrl +"category/termlist?catid=3&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("configurationTimeStamp"),"get",fetchCategoryList);
            });
        }else if(tagId=="homeTab"){
            href = "#homeTab";
            var tabPageView = 'appslist/Inicio';
            ga_storage._trackPageview(tabPageView);
            checkMobileRefresh(function(){
            	$.mobile.sorting = [];
            	requestApi($.mobile.baseUrl +"apps/front/section?countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("homeAppsTimeStamp"),"get",fetchHomeAppData);
            	requestApi($.mobile.baseUrl +"category/termlist?catid=4&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("tagsTimeStamp"),"get",tagDataFetchAndStore);
            });            
        }else{
            href = "#"+tagId+"";
            var tabPageView = 'appslist/tags/'+$(this).attr("tagName");
            ga_storage._trackPageview(tabPageView);
            checkMobileRefresh(function(){
            	requestApi($.mobile.baseUrl +"apps/tag/front?tid="+tagId+"&countrycode="+window.localStorage.getItem("selectedCountry"),"get",fetchAppData);
            });
        }
    }else{
        bannerId = 0;
        $('#banner').css('display','none');
        if(tagId=="categoryTab"){
            href = "#categoryTab";
            var tabPageView = 'categoryList';
            ga_storage._trackPageview(tabPageView);
            fetchCategoriesFromLocal();
        }else if(tagId=="homeTab"){
            href = "#homeTab";
            var tabPageView = 'appslist/Inicio';
            ga_storage._trackPageview(tabPageView);
            fetchHomeAppLocal();
        }else{
            href = "#"+tagId+"";
            var tabPageView = 'appslist/tags/'+$(this).attr("tagName");
            ga_storage._trackPageview(tabPageView);
            fetchAppDataLocal();
        }
    }
}

//This method is used to fetch tag data from webservice to local database
function tagDataFromLocal(){
    var content = '';
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, tagId, tagName, countryCode FROM tags WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            tagCount = 0;
            if(res.rows.length == 0){
                $('#tab').owlCarousel({
                    itemsCustom : [[0, 3]],
                    pagination : false,
                    singleItem : false
                });
                $('#tab li').removeClass();
                $(document).on('click', '#tab li', tabClickEvent);
            }else{
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                content += '<li tagCount='+tagCount+' tagId="'+localData.tagId+'" tagName="'+localData.tagName+'"><a class="tabLabel ui-link ui-btn" data-inline="true" href="#'+localData.tagId+'">'+localData.tagName+'</a></li>'
                $('#homeContent').append('<div id="'+localData.tagId+'"></div>');
                window.localStorage.setItem("tagItem'"+localData.tagId+"'",window.localStorage.getItem("tagsTimeStamp"));
                tagCount++;
            }
            $('#tab').append(content);
            if(res.rows.length>=3){
                $('#tab').owlCarousel({
                    itemsCustom : [[0, 3]],
                    pagination : false,
                    singleItem : false
                });
            }else{
                $('#tab').owlCarousel({
                    itemsCustom : [[0, res.rows.length+2]],
                    pagination : false,
                    singleItem : false
                });
            }
            $('#tab').addClass('tabColumn');
            $('div.owl-item.tabColumn').css('width','auto');
            $('#tab li').removeClass();
            $(document).on('click', '#tab li', tabClickEvent);
            }
        });
    });
}

//This method is used to fetch tag data from webservice
function tagDataFromWebservice(responseData){
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
                tx.executeSql("INSERT OR REPLACE INTO tags (id, tagId, tagName, countryCode,weight) VALUES (?,?,?,?,?)",
                [uniqueId, responseData.response[i].tid, responseData.response[i].name, window.localStorage.getItem("selectedCountry"),responseData.response[i].weight],
                function(tx, res) {});
            }
        });
        tagDataFromLocal();
    }else{
        tagDataFromLocal();
    }
    tagDataFetchAndStore(responseData);
}

//This method is used to fetch tag data from webservice
function tagDataFetchAndStore(responseData){
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
                tx.executeSql("INSERT OR REPLACE INTO tags (id, tagId, tagName, countryCode,weight) VALUES (?,?,?,?,?)",
                [uniqueId, responseData.response[i].tid, responseData.response[i].name, window.localStorage.getItem("selectedCountry"),responseData.response[i].weight],
                function(tx, res) {});
            }
        });
    }
}

$(document).bind('pagebeforechange', '#home', tabNavigation);

//This method is used to open application detail page
function appsNavigateToDetailPage(e){
    $(document).off('click', '.homeAppItem', appsNavigateToDetailPage);
    window.localStorage.setItem("categoryName",$(this).attr("categoryName"));
    window.localStorage.setItem("detailObj",$(this).attr("detailObj"));
    $.mobile.pageContainer.pagecontainer("change", 'detail.html',{reloadPage : true});
}

//This method is used to open search page
function openSearch(e){
    $.mobile.pageContainer.pagecontainer("change", 'search.html',{reloadPage : true});
}

//This method is used to open tab from Home page Todas button click
function openTab(e){    
    var moveTagId = $(this).attr("tagId");    
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, tagId, tagName, countryCode FROM tags WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                if(localData.tagId == moveTagId){
                    loadTabContent('#'+moveTagId,moveTagId,i);
                    return false;
                }
            }
        });
    });    
}

//This method is used to show home page banner in onresume applicaiton
function onResumeHome(){
    if(isConnectionAvailable()){
        $('#banner').css('display','block');
        clearTimeout("bannerData()");
        bannerData();
    }else{
        bannerId = 0;
        $('#banner').css('display','none');
    }
}

//This method is used to fetch user info after logged in
function fetchUserInfo(responseData){
    if(responseData.UID){
        $('.menuLogin').css('display','none');
        $('.logoutmenu').css('display','block');
        var name = responseData.firstName+" "+responseData.lastName;
        window.localStorage.setItem('USERID',responseData.UID);
        window.localStorage.setItem('USERNAME',name);
        window.localStorage.setItem('USERMAIL',responseData.email);
    }
}

//This method is used to open browser for social log out
function openLogout(e){
    if(isConnectionAvailable()){
        ga_storage._trackEvent('Logout', 'Logout', 'Logout');
        var logoutURL = $.mobile.socialLogout+"UID="+window.localStorage.getItem('USERID')+"&oauth_token="+window.localStorage.getItem('oauth_token')+"&format=json";
        gigyaRequest(logoutURL,"get",function(responseData){
            if(responseData.statusCode == 200){
                $('.menuLogin').css('display','block');
                $('.logoutmenu').css('display','none');
                window.localStorage.setItem('USERID','');
                window.localStorage.setItem('USERNAME','');
                window.localStorage.setItem('USERMAIL','');
                window.localStorage.setItem('oauth_token','');
            }
        });
    }else{
        nativeAlert(L['noInternet'],L['ok'],function(){});
    }
}

//This method is used to open browser for social login
function openLogin(e){
    if(isConnectionAvailable()){
        var loginURL = $.mobile.socialLogin+"client_id="+$.mobile.GIGYAAPIKEY+"&redirect_uri="+$.mobile.redirectURI+"&x_provider="+$(this).attr("provider")+"&response_type=token";
        var ref = window.open(loginURL, '_blank', 'location=yes,clearcache=yes');
        ga_storage._trackEvent('Login', 'connect', $(this).attr("provider"));
        if($.mobile.platform == $.mobile.android){
            ref.addEventListener("loadstop", function(event){
                var newurl = event.url;
                var access=newurl.split("#");
                token=access[1].split("=");
                if(token[0]=="access_token"){
                    window.localStorage.setItem('oauth_token',token[1]);
                    ref.close();
                    var userUrl = $.mobile.getUserInfo+"oauth_token="+window.localStorage.getItem('oauth_token')+"&format=json&apikey="+$.mobile.GIGYAAPIKEY;
                    gigyaRequest(userUrl,"get",fetchUserInfo);
                }
            });
        }else if($.mobile.platform == $.mobile.iOS){
            ref.addEventListener("loaderror", function(event){
                var newurl = event.url;
                var access=newurl.split("#");
                token=access[1].split("=");
                if(token[0]=="access_token"){
                    window.localStorage.setItem('oauth_token',token[1]);
                    ref.close();
                    var userUrl = $.mobile.getUserInfo+"oauth_token="+window.localStorage.getItem('oauth_token')+"&format=json&apikey="+$.mobile.GIGYAAPIKEY;
                    gigyaRequest(userUrl,"get",fetchUserInfo);
                }
            });
        }
    }else{
        nativeAlert(L['noInternet'],L['ok'],function(){});
    }
}

//This page show event for home page
$(document).on('pageshow', '#home', function(event, data){    
    document.addEventListener("resume", onResumeHome, false);
    if(isConnectionAvailable()){
        $('#banner').css('display','block');
        clearTimeout("bannerData()");
        bannerData();
    }else{
        bannerId = 0;
        $('#banner').css('display','none');
    }
    if(window.localStorage.getItem('tagHref')){
        var tabIdFetching = window.localStorage.getItem('tagHref').replace('#','');
        loadTabContent(window.localStorage.getItem('tagHref'),tabIdFetching, window.localStorage.getItem('catTagCount'));
    }else{
        switchTab(href);
    }    
    $('#configuration').remove();
    if(window.localStorage.getItem('USERID')){
        $('.menuLogin').css('display','none');
        $('.logoutmenu').css('display','block');
    }else{
        $('.menuLogin').css('display','block');
        $('.logoutmenu').css('display','none');
    }
    $(document).on('click', '.homeAppItem', appsNavigateToDetailPage);
    $(document).on('click', '.moreButton', openTab);
    $(document).on('click', '.socialImages', openLogin);
    $(document).on('click', '.logoutmenu', openLogout);
    $(document).on('click', '#homeSearchIcon', openSearch);
});

//This page hide event for home page
$(document).on('pagecreate', '#home', function (event, data) {
    window.localStorage.setItem("initialAppLoad",true);
    window.localStorage.setItem('tagHref',"");
    ga_storage._trackPageview('appslist/Inicio');
    if(isConnectionAvailable()){
        $('#banner').css('display','block');        
        checkMobileRefresh(function(){
        	$.mobile.sorting  = [];
        	requestApi($.mobile.baseUrl +"apps/front/section?countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("homeAppsTimeStamp"),"get",fetchHomeAppData);
        	requestApi($.mobile.baseUrl +"category/termlist?catid=4&countrycode="+window.localStorage.getItem("selectedCountry")+"&lastaccess="+window.localStorage.getItem("tagsTimeStamp"),"get",tagDataFromWebservice);
        });
    }else{
        bannerId = 0;
        $('#banner').css('display','none');
        $.mobile.db.transaction(function(tx) {
        	tx.executeSql("SELECT id, tagId, tagName, countryCode FROM tags WHERE countryCode=? ORDER BY weight ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
        		if(res.rows.length > 0){
        			for(var i=0,j=res.rows.length; i<j;i++){
                        var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                        $.mobile.sorting.push(localData.tagName);                        
                    }
        			fetchHomeAppLocal();
        	        tagDataFromLocal();
        		}else{
        			fetchHomeAppLocal();
        	        tagDataFromLocal();
        		}                
            });
        });        
    }
});

//This page hide event for home page
$(document).on('pagehide', '#home', function(event, data){
    $(document).off('click', '.homeAppItem', appsNavigateToDetailPage);
    $(document).off('click', '.moreButton', openTab);
    $(document).off('click', '.socialImages', openLogin);
    $(document).off('click', '.logoutmenu', openLogout);
    $(document).off('click', '#homeSearchIcon', openSearch);
});

//This panelbeforeclose event for menu open event. This did some device got issue menu open
$(document).on('panelbeforeopen', '#nav-panel', function(event, ui){
    disable_scroll();
    if($.mobile.platform == $.mobile.android){
    $('div#navTab.ui-navbar').css({'left': '0','right': '0','-webkit-transform': 'translate3d(17em, 0, 0)','-moz-transform': 'translate3d(17em, 0, 0)','transform': 'translate3d(17em, 0, 0)'});
    }
});

//This panelbeforeclose event for menu close event. This did some device got issue menu open 
$(document).on('panelbeforeclose', '#nav-panel', function(event, ui){
    enable_scroll();
    if($.mobile.platform == $.mobile.android){
    $('div#navTab.ui-navbar').css({'left': '0','right': '0','-webkit-transform': 'translate3d(0, 0, 0)','-moz-transform': 'translate3d(0, 0, 0)','transform': 'translate3d(0, 0, 0)'});
    }
});

