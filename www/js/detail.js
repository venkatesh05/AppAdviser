var ratingValue = 0;
var commentsPagination;
var appId;
var appName;
var androidDownloadUrl;
var androidPlaystoreUrl;
var iosPlaystoreUrl;
var androidBundleId;
var iosBundleId;

//This page before create event for app detail page
$(document).on('pagebeforecreate', '#detail', function (event, data) {
    $('a.backArrow').removeClass("ui-btn-left ui-link ui-btn ui-shadow ui-corner-all");
    
    $('#reviews').css("display","none");
    
    $('#rate').raty({
        size   : 24,
        path      : 'img/big',
        half      : false,
        readOnly  : false,
        click: function(score, evt) {
            ratingValue = score;
        }
    });
    $('#rate').css("width","100%");
    $('#summaryText').attr("placeholder",L['summaryHint']);
    $('#commentText').val(L['commantHint']);
    $('#commentText').css("color","#E9E9E9");
});

//This method is used to open gallery for app screenshoots
function openGallery(e){
    $(document).off('click', '.item', openGallery);
    window.localStorage.setItem("screenIndex",$(this).find('img').attr("screenIndex"));
    $.mobile.pageContainer.pagecontainer("change", 'gallery.html',{reloadPage : true});
}

//This page create event for app detail page
$(document).on('pagecreate', "#detail", function (event, data) {
    $('#download').css("display","none");
    $('#view').css("display","none");
    $('#open').css("display","none");
    $('#progressbar').css("display","none");
    window.localStorage.setItem('siginin',"");
    
    androidDownloadUrl = "";
    androidPlaystoreUrl = "";
    iosPlaystoreUrl = "";
    androidBundleId = "";
    iosBundleId ="";
    
    var obj = window.localStorage.getItem("detailObj");
    obj = $.parseJSON(decodeURI(obj.replace(/\"/g, "'")));
    appId = obj.nid;
    appName = obj.title;
    $('.detailName').html(obj.title);
    var detailPageView = 'appDetails/'+appName;
    ga_storage._trackPageview(detailPageView);
               
    if(obj.icon){
        if(isConnectionAvailable()){
            $('.thampnailContainer img').attr("src",obj.icon);
        }else{
            get_file(obj.nid,"icon",function(path){
                $('.thampnailContainer img').attr("src",path);
            });
        }
    }else{
        $('.thampnailContainer img').attr("src","img/noimage.png");
    }
        
    if(obj.appdetails){
        if($.mobile.platform == $.mobile.android){
            if(obj.appdetails.android_pricing.toUpperCase() == "FREE" || obj.appdetails.android_pricing.toUpperCase() == ""){
               $('#detailAmount').html(obj.appdetails.android_pricing);
            }else{
               $('#detailAmount').html(obj.appdetails.android_currencytype+''+obj.appdetails.android_price);
            }
        }else if($.mobile.platform == $.mobile.iOS){
            if(obj.appdetails.iphone_pricing.toUpperCase() == "FREE" || obj.appdetails.iphone_pricing.toUpperCase() == ""){
               $('#detailAmount').html(obj.appdetails.iphone_pricing);
            }else{
               $('#detailAmount').html(obj.appdetails.iphone_currencytype+''+obj.appdetails.iphone_price);
            }
        }
        $('.hint').html(obj.appdetails.app_category);
        $('.descriptionContent').html(obj.appdetails.description);
        if(obj.appdetails.whatisnew){
            $('#whatsNew').css('display','block');
            $('.whatsNewContent').html(obj.appdetails.whatisnew);
        }
        if(obj.appdetails.version_num){
            $('#version').css('display','block');
            $('.versionContent').html(obj.appdetails.version_num);
        }
    }
               
    if(obj.screenshots){
        $('#splash').html('');
        //if(isConnectionAvailable()){
            var screenArray=[];
            for(var i=0;i<obj.screenshots.length;i++){
               var screenName = obj.nid+"screen"+i;
               screenArray.push({'image':obj.screenshots[i],'name':screenName});
            }
            if(screenArray.length>0){
               filedownloadScreens(screenArray);
            }
            var splash = '';
            for(var i=0;i<obj.screenshots.length;i++){
               splash +='<a class="item"><img src="'+obj.screenshots[i]+'" alt="No image" screenIndex="'+i+'"></a>';
            }
            $('#splash').append(splash);
            $('#splash').owlCarousel({
                itemsCustom : [[0, 1.7]],
                pagination  : false,
                singleItem  : false
            });
        /*}else{
            var check = obj.nid+"screen";
            getScreenImages(check,function(result){
                $('#splash').append(result);
                $('#splash').owlCarousel({
                    itemsCustom : [[0, 1.7]],
                    pagination  : false,
                    singleItem  : false
                });
            });
        }*/
    }
    
    if($.mobile.platform == $.mobile.android){
        if(obj.appdetails.android_bundle_id){
            androidBundleId = obj.appdetails.android_bundle_id;
            
            appAvailability.check(
                obj.appdetails.android_bundle_id, // URI Scheme
                function() {
                    window.localStorage.setItem('app'+appId+'downlaoding',"");
                    $('#open').css("display","block");
                    $('#view').css("display","none");
                    $('#download').css("display","none");
                },
                function() { // Error callback
                    if(obj.appdetails.android_playstoreurl){
                        window.localStorage.setItem('app'+appId+'downlaoding',"");
                        $('#view').css("display","block");
                        androidPlaystoreUrl = obj.appdetails.android_playstoreurl;
                    }else if(obj.appdetails.android_build_url){
                        window.localStorage.setItem('app'+appId+'downlaoding',"");
                        $('#download').css("display","block");
                        androidDownloadUrl = obj.appdetails.android_build_url;
                    }
                }
            );
            
        }
        if(window.localStorage.getItem('app'+appId+'downlaoding')){
            $('#download').css("display","none");
            $('#view').css("display","none");
            $('#open').css("display","none");
            $('#progressbar').css("display","block");
            jQMProgressBar('progressbar')
               .setOuterTheme('b')
               .isIndefinite(true)
               .isMini(true)
               .showCounter(false)
               .build();
        }
    }else if($.mobile.platform == $.mobile.iOS){
        $('#view').css("display","block");
        if(obj.appdetails.iphone_playstoreurl){
            $('#view').css("display","block");
            iosPlaystoreUrl = obj.appdetails.iphone_playstoreurl;
        }
    }
    $('#loadmoreButton').css("display","none");
    if(isConnectionAvailable()){
        $('#commentContaintainer').html('');
        $('#loadmoreButton').css('display','block');
        var commentsURL = $.mobile.getComments+"categoryID="+$.mobile.CATEGORYID+"&streamID="+appId+"&format=json&apikey="+$.mobile.GIGYAAPIKEY+"&includeStreamInfo=true&sort=dateDesc&threadLimit="+$.mobile.COMMENTSLIMIT;
        gigyaRequest(commentsURL,"get",fetchComments);
    }
    $('a.backArrow').removeClass("ui-btn-left ui-link ui-btn ui-shadow ui-corner-all");
    
});

//This method is used to Fetch and show comments from GIGYA
function fetchComments(responseData){
    if(responseData.streamInfo.avgRatings._overall){
        $('.starHome'+appId).raty({
            path      : 'img',
            half      : true,
            readOnly  : true,
            score     : responseData.streamInfo.avgRatings._overall
        });
        $('#avgRatingCount').html(responseData.streamInfo.avgRatings._overall);
        $('#avgRatingStar').raty({
            path      : 'img',
            half      : true,
            readOnly  : true,
            score     : responseData.streamInfo.avgRatings._overall
        });
        $('#rating').raty({
            path      : 'img',
            half      : true,
            readOnly  : true,
            score     : responseData.streamInfo.avgRatings._overall
        });
    }
    if(responseData.streamInfo.commentCount == 0){
        $('#avgRatingCount').html("0");
        $('#avgRatingStar').raty({
            path      : 'img',
            half      : true,
            readOnly  : true,
            score     : 0
        });
        $('#rating').raty({
            path      : 'img',
            half      : true,
            readOnly  : true,
            score     : 0
        });
    }
    var commentsobj = responseData.comments;
    var content = '';
    if(responseData.next){
        commentsPagination = responseData.next;
    }
    if(commentsobj.length<$.mobile.COMMENTSLIMIT){
        $('#loadmoreButton').css('display','none');
    }else{
        $(document).on('click', '#loadmoreButton', loadMoreComments);
        $('#loadmoreButton').css('display','block');
    }
    if(commentsobj.length>0){
        for(var i=0,j=commentsobj.length; i<j;i++){
            content='<div class="commentsList"><div class="comments"><div id="commenttitle" class="status">'+commentsobj[i].commentTitle+'</div><div id="commenttext" class="commentContent">'+commentsobj[i].commentText+'</div><div><span class="commentedName">'+commentsobj[i].sender.name+'</span><span id='+commentsobj[i].ID+'></span></div></div>';
            $('#commentContaintainer').append(content);
            $('#'+commentsobj[i].ID).raty({
                path      : 'img',
                half      : true,
                readOnly  : true,
                score     : commentsobj[i].ratings._overall
            });
        }
    }else{
        $('#loadmoreButton').css('display','none');
    }
}

//This method is used to Post comments to GIGYA
function postComments(responseData){
    var content = '';
    if(responseData.statusCode == 200){
        if(isConnectionAvailable()){
            $('#commentContaintainer').html('');
            var commentsURL = $.mobile.getComments+"categoryID="+$.mobile.CATEGORYID+"&streamID="+appId+"&format=json&apikey="+$.mobile.GIGYAAPIKEY+"&includeStreamInfo=true&sort=dateDesc&threadLimit="+$.mobile.COMMENTSLIMIT;
            gigyaRequest(commentsURL,"get",fetchComments);
        }
    }else if(responseData.statusCode == 403){
        nativeAlert(L['commentsError'],L['ok'],function(){});
    }
}

//This method is used to Open Post comments popup
function openPopup(e){
    if(isConnectionAvailable()){
        $(document).off('click', '#postComments', openPopup);
        if(window.localStorage.getItem('USERID')){
            $('#popupLogin').popup("open");
            $('#popupLogin').popup( "reposition", {positionTo: 'origin'} );
        }else{
            $.mobile.pageContainer.pagecontainer("change", 'signin.html',{reloadPage : true});
        }
    }else{
        nativeAlert(L['noInternet'],L['ok'],function(){});
    }
}

//This method is used to Download apk only for android
function openDownload(e){
    if($.mobile.platform == $.mobile.android){
        ga_storage._trackEvent('App', 'download', appName);
        window.localStorage.setItem('app'+appId+'downlaoding',"started");
        $('#download').css("display","none");
        $('#progressbar').css("display","block");
        jQMProgressBar('progressbar')
        .setOuterTheme('b')
        .isIndefinite(true)
        .isMini(true)
        .showCounter(false)
        .build();
        window.cordova.plugins.FileOpener.openFile(androidDownloadUrl, function(data){
            window.localStorage.setItem('app'+appId+'downlaoding',"");
            $('#progressbar').css("display","none");
            refresh();
            },function(){
            window.localStorage.setItem('app'+appId+'downlaoding',"");
                $('#progressbar').css("display","none");
                $('#download').css("display","block");
        });
    }
}

//This method is used to Open application if already avaliable in device only for android
function openApplication(e){
    if($.mobile.platform == $.mobile.android){
        ga_storage._trackEvent('App', 'open', appName);
        openApp(androidBundleId);
    }
}

//This method is used to View application in app store
function viewApp(e){
    ga_storage._trackEvent('App', 'view', appName);
    if($.mobile.platform == $.mobile.android){
        if(androidPlaystoreUrl){
            if(androidPlaystoreUrl.indexOf("https://play.google.com") != -1 || androidPlaystoreUrl.indexOf("http://play.google.com") != -1){
                window.open(androidPlaystoreUrl, '_system', 'location=yes');
            }else{
                nativeAlert("Play store url is incorrect. Please, Check it in admin",L['ok'],function(){});
            }
        }else{
            nativeAlert("Play store url not found. Please, Update in admin",L['ok'],function(){});
        }
    }else if($.mobile.platform == $.mobile.iOS){
        if(iosPlaystoreUrl){
            if(iosPlaystoreUrl.indexOf("https://itunes.apple.com") != -1 || iosPlaystoreUrl.indexOf("http://itunes.apple.com") != -1){
                window.open(iosPlaystoreUrl, '_system', 'location=yes');
            }else{
                nativeAlert("App store url is incorrect. Please, Check it in admin",L['ok'],function(){});
            }
        }else{
            nativeAlert("App store url not found. Please, Update in admin",L['ok'],function(){});
        }
    }
}

//This method is used to Submit comments in GIGYA
function submitComments(e){
    var commentTitle = $('#summaryText').val();
    var commentText = $('#commentText').val();
    if(ratingValue == 0){
        nativeAlert(L['fillRating'],L['ok'],function(){});
        return false;
    }
    if(commentTitle.length == 0){
        nativeAlert(L['fillPostComments'],L['ok'],function(){});
        return false;
    }
    if(commentText.length == 0 || commentText == L['commantHint']){
        nativeAlert(L['fillPostComments'],L['ok'],function(){});
        return false;
    }
    $(this).attr("data-rel","back");
    ga_storage._trackEvent('Comments', 'post', appName);
    var ratingJson = "{'_overall':"+ratingValue+"}";
    var postCommentsUrl = $.mobile.postComment+"categoryID="+$.mobile.CATEGORYID+"&streamID="+appId+"&commentTitle="+commentTitle+"&commentText="+commentText+"&ratings="+ratingJson+"&guestName="+window.localStorage.getItem('USERNAME')+"&guestEmail="+window.localStorage.getItem('USERMAIL')+"&UID="+window.localStorage.getItem('USERID')+"&oauth_token="+window.localStorage.getItem('oauth_token')+"&apikey="+$.mobile.GIGYAAPIKEY+"&format=json";
    gigyaRequest(postCommentsUrl,"get",postComments);
    $(document).off('click', '#submit', submitComments);
    $(document).on('click', '#postComments', openPopup);
    $('#popupLogin').popup("close");
}

//This method is used to closing popup
function cancelComments(e){
    $(document).off('click', '#cancel', cancelComments);
    $('#popupLogin').popup("close");
}

//This method is used to call load more comments webserice
function loadMoreComments(e){
    if(isConnectionAvailable()){
        ga_storage._trackEvent('Comments', 'loadmore', appName);
        $(document).off('click', '#loadmoreButton', loadMoreComments);
        var commentsURL = $.mobile.getComments+"categoryID="+$.mobile.CATEGORYID+"&streamID="+appId+"&format=json&apikey="+$.mobile.GIGYAAPIKEY+"&includeStreamInfo=true&sort=dateDesc&threadLimit="+$.mobile.COMMENTSLIMIT+"&start="+commentsPagination;
        gigyaRequest(commentsURL,"get",fetchComments);
    }
}

//This Description click event for <a> tag to open in browser
$(document).on('click', '.descriptionContent a', function(e){
    if($(this).attr("href").indexOf("http") != -1){
    var ref = window.open($(this).attr("href"), '_blank', 'location=yes,clearcache=yes');
    return false;
    }
});

//This page show event for app detail page
$(document).on('pageshow', "#detail", function (event, data) {
    if(window.localStorage.getItem('siginin')){
        window.localStorage.setItem('siginin',"");
        $('#reviews').css("display","block");
        $('#reviewTab').attr('class','lang ui-btn-active ui-link ui-btn');
        if(window.localStorage.getItem('USERID')){
            $("#popupLogin").popup('open');
        }
    }else{
        $('#reviews').css("display","none");
        $('#descTab').attr('class','lang ui-btn-active ui-link ui-btn');
    }
               
    $('#descTab').on("click",function(e){
        $('#description').css("display","block");
        $('#reviews').css("display","none");
    });
               
    $('#reviewTab').on("click",function(e){
        $('#reviews').css("display","block");
        $('#description').css("display","none");
    });
               
    $('#commentText').on("focus",function(e){
        $('#commentText').css("color","#000");
        if($(this).val()==L['commantHint']){
            $(this).val("");
        }
    });
               
    $('#commentText').on("blur",function(e){
        $('#commentText').css("color","#E9E9E9");
        if($(this).val()==""){
            $(this).val(L['commantHint']);
        }
    });
               
    $('#popupLogin').on( "popupafterclose", function( event, ui ) {
        $('#rate').raty({
            path      : 'img/big',
            half      : false,
            readOnly  : false,
            click: function(score, evt) {
                ratingValue = score;
            }
        });
        ratingValue = 0;
        $('#rate').css("width","100%");
        $('#summaryText').val("");
        $('#summaryText').attr("placeholder",L['summaryHint']);
        $('#commentText').val(L['commantHint']);
        $('#commentText').css("color","#E9E9E9");
        $(document).on('click', '#postComments', openPopup);
    });
    $('#loadmoreButton').css("display","none");
         
    $(document).on('click', '.item', openGallery);
    $(document).on('click', '#postComments', openPopup);
    $(document).on('click', '#download', openDownload);
    $(document).on('click', '#open', openApplication);
    $(document).on('click', '#view', viewApp);
    $(document).on('click', '#submit', submitComments);
    $(document).on('click', '#cancel', cancelComments);
    $(document).on('click', '#loadmoreButton', loadMoreComments);
});
                                
//This page hide event for app detail page disabling all click events
$(document).on('pagehide', "#detail", function (event, data) {
    $(document).off('click', '.item', openGallery);
    $(document).off('click', '#postComments', openPopup);
    $(document).off('click', '#download', openDownload);
    $(document).off('click', '#open', openApplication);
    $(document).off('click', '#view', viewApp);
    $(document).off('click', '#submit', submitComments);
    $(document).off('click', '#cancel', cancelComments);
    $(document).off('click', '#loadmoreButton', loadMoreComments);
});

//This page before show event for category landing page disabling all click events
$(document).on('pagebeforeshow', '#home', function (event, data) {
    $(document).off('click', '.item', openGallery);
    $(document).off('click', '#postComments', openPopup);
    $(document).off('click', '#download', openDownload);
    $(document).off('click', '#open', openApplication);
    $(document).off('click', '#view', viewApp);
    $(document).off('click', '#submit', submitComments);
    $(document).off('click', '#cancel', cancelComments);
    $(document).off('click', '#loadmoreButton', loadMoreComments);
    $("#detail").remove();
});

//This page before show event for category landing page disabling all click events
$(document).on('pagebeforeshow', '#categoryHome', function (event, data) {
    $(document).off('click', '.item', openGallery);
    $(document).off('click', '#postComments', openPopup);
    $(document).off('click', '#download', openDownload);
    $(document).off('click', '#open', openApplication);
    $(document).off('click', '#view', viewApp);
    $(document).off('click', '#submit', submitComments);
    $(document).off('click', '#cancel', cancelComments);
    $(document).off('click', '#loadmoreButton', loadMoreComments);
    $("#detail").remove();
});

//This page before show event for search page disabling all click events
$(document).on('pagebeforeshow', '#search', function (event, data) {
    $(document).off('click', '.item', openGallery);
    $(document).off('click', '#postComments', openPopup);
    $(document).off('click', '#download', openDownload);
    $(document).off('click', '#open', openApplication);
    $(document).off('click', '#view', viewApp);
    $(document).off('click', '#submit', submitComments);
    $(document).off('click', '#cancel', cancelComments);
    $(document).off('click', '#loadmoreButton', loadMoreComments);
    $("#detail").remove();
});

function refresh(){
    if($.mobile.platform == $.mobile.android){
        appAvailability.check(
            androidBundleId, // URI Scheme
            function() {
                $('#open').css("display","block");
                $('#view').css("display","none");
                $('#download').css("display","none");
            },
            function() { // Error callback
                $('#open').css("display","none");
                if(androidPlaystoreUrl){
                    $('#view').css("display","block");
                }else if(androidDownloadUrl){
                   $('#download').css("display","block");
                }
            }
        );
    }
}