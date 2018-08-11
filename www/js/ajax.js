var relativeFilePath = "AppAdvisorImages/";
var relativeApkPath = "AppAdvisorApk/";

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}
//This methods used to disable scroll event
function disable_scroll() {
    $('body').bind('touchmove', function(e){e.preventDefault()});
}

//This methods used to enable scroll event
function enable_scroll() {
    $('body').unbind('touchmove');
}

//This methods used to request api using url, method type, callback will get response and show is for when to show loading indicator
function requestApi(apiUrl,methodType,callBack,show,hide){
    if(!show){
    $.mobile.loading( "show", {
        text: L['loading'],
        textVisible: true,
        textonly: false,
        html: ""
    });
        disable_scroll();
    }
    //Checking wheather token is available or not.
    if(window.localStorage.getItem("accessToken")== null && window.localStorage.getItem("timeStamp")== null){
        //Fetching accesstoken to and setting header Authorization to fetch api request
        requestApiWithoutToken(function(tokenResponse){
            $.ajax({
                url: apiUrl,
                type: methodType,
                dataType: "json",
                error: function(){
                   enable_scroll();
                   nativeAlert(L['serverError'],L['ok'],function(){});
                },
                beforeSend: function(request){
                    request.setRequestHeader("Authorization", "Bearer "+tokenResponse.access_token);
                },
                complete: function(){
                	if(!hide){
                    $.mobile.loading( "hide" );
                	}
                    enable_scroll();
                },
                success: function( responseData ){
                   enable_scroll();
                    callBack(responseData);
                }
            });
        });
    }else{
        var currentTime = new Date().getTime()/1000;
        //Checking wheather token is expired or not
        if(window.localStorage.getItem("timeStamp") > parseInt(currentTime)){
            //If not expired passing local storage acess token. Setting header Authorization to fetch api request
            $.ajax({
                url: apiUrl,
                type: methodType,
                dataType: "json",
                error: function(){
                   enable_scroll();
                   nativeAlert(L['serverError'],L['ok'],function(){});
                },
                beforeSend: function(request){
                   request.setRequestHeader("Authorization", "Bearer "+window.localStorage.getItem("accessToken"));
                },
                complete: function(){
                	if(!hide){
                        $.mobile.loading( "hide" );
                    }
                   enable_scroll();
                },
                success: function( responseData ){
                   enable_scroll();
                   callBack(responseData);
                }
            });
        }else{
            //If expired Fetching accesstoken to and setting header Authorization to fetch api request
            requestApiWithoutToken(function(tokenResponse){
                $.ajax({
                    url: apiUrl,
                    type: methodType,
                    dataType: "json",
                    error: function(){
                       enable_scroll();
                        nativeAlert(L['serverError'],L['ok'],function(){});
                    },
                    beforeSend: function(request){
                       request.setRequestHeader("Authorization", "Bearer "+tokenResponse.access_token);
                    },
                    complete: function(){
                       if(!hide){
                           $.mobile.loading( "hide" );
                       }
                       enable_scroll();
                    },
                    success: function( responseData ){
                       enable_scroll();
                        callBack(responseData);
                    }
                });
            });
        }
    }
}

//This methods used to request apiToken for security purpose.
function requestApiWithoutToken(tokenCallBack){
    $.ajax({
        url: $.mobile.authenticationUrl,
        type: 'GET',
        dataType: "json",
        error: function(){
        nativeAlert(L['serverError'],L['ok'],function(){});
        },
        beforeSend: function(){
        },
        complete: function(){
        },
        success: function( responseData ){
           var current = new Date().getTime()/1000;
           var responseTime = responseData.expires_in;
           var timestamp = parseInt(current) + parseInt(responseTime);
           window.localStorage.setItem("timeStamp",timestamp);
           window.localStorage.setItem("accessToken",responseData.access_token);
           tokenCallBack(responseData);
        }
    });
}

//This methods used to request apiToken for security purpose.
function requestApiWithoutLoading(apiUrl,methodType,callBack){
    $.ajax({
        url: apiUrl,
        type: methodType,
        dataType: "json",
        error: function(){
        },
        beforeSend: function(){
        },
        complete: function(){
        },
        success: function( responseData ){
        	callBack(responseData);
        }
    });
}

//This method is used to request GIGYA for post comments,show comments
function gigyaRequest(apiUrl,methodType,callBack){
    $.ajax({
        url: apiUrl,
        type: methodType,
        dataType: "json",
        error: function(){
           enable_scroll();
           nativeAlert(L['serverError'],L['ok'],function(){});
        },
        beforeSend: function(request){
           $.mobile.loading( "show", {
              text: L['loading'],
              textVisible: true,
              textonly: false,
              html: ""
           });
           disable_scroll();
        },
        complete: function(){
           $.mobile.loading( "hide" );
           enable_scroll();
        },
        success: function( responseData ){
           enable_scroll();
           callBack(responseData);
        }
    });
}

//This method is used to show star rating by passing URL and classname to show stars
function showStarRating(apiUrl,className){
    $.ajax({
        url: apiUrl,
        type: 'get',
        dataType: "json",
        error: function(){
        },
        beforeSend: function(request){
        },
        complete: function(){
        },
        success: function( responseData ){
           if(responseData.streamInfo.avgRatings._overall){
                $('.'+className).raty({
                    path      : 'img',
                    half      : true,
                    readOnly  : true,
                    score     : responseData.streamInfo.avgRatings._overall
                });
           }else{
                $('.'+className).raty({
                    path      : 'img',
                    half      : true,
                    readOnly  : true,
                    score     : 0
                });
           }
        }
    });
}

//This method is used to download images by passing imageurl, imagename and type
function filedownloadurl(image_url,image_name,type){
    var image_path;
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT,0,function(fileSystem) {
            fileSystem.root.getDirectory(relativeFilePath, {create: true}, function (directory) {
                var ft = new FileTransfer();
                ft.download(image_url, directory.toURL() + "/"+image_name+"_"+type,
                    function(entry) {
                        image_path = directory.toURL() + "/"+image_name+"_"+type;
                        if(type == "icon" || type == "categoryIcon"){
                            //$('.image'+image_name).attr('src',image_path);
                        }
                    }, function(err) { }
                );
            }, function(err) { });
        }, function(err) { });
    }
    catch (error) {
    }
}

//This method is used to download screenshoot images and generate html dom to show
function filedownloadScreens(screenArray){
        var image_path;
        try {
            window.requestFileSystem(LocalFileSystem.PERSISTENT,0,function(fileSystem) {
                fileSystem.root.getDirectory(relativeFilePath, {create: true}, function (directory) {
                    var ft = new FileTransfer();
                    var splash = '';
                    for(var i=0;i<screenArray.length;i++){
                    ft.download(screenArray[i].image, directory.toURL() + "/"+screenArray[i].name,
                    function(entry) {
                        image_path = directory.toURL() + "/"+screenArray[i].name;
                        splash +='<a class="item"><img src="'+image_path+'" alt="Owl Image" ></a>';
                        //$('#splash').append(splash);
                    }, function(err) { }
                    );
                    }
            }, function(err) { });
            }, function(err) { });
        }
        catch (error) {
        }
}

//This method is used to get image from local storage
function get_file(image_name,type,callBack) {
    var image_path;
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT,0,function(fileSystem) {
            fileSystem.root.getDirectory(relativeFilePath, {create: true}, function (directory) {
                image_path = directory.toURL() + "/"+image_name+"_"+type;
                if(type == "icon" || type == "categoryIcon"){
                    $('.image'+image_name).attr('src',image_path);
                }
                callBack(image_path);
            }, function(err) { });
        }, function(err) { });
    }
    catch (error) {
    }
}

//This method is used to get screenshoot images from local storage
function getScreenImages(fileName,callBack){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
        fileSystem.root.getDirectory("AppAdvisorImages", {create: true}, function(directory) {
            var directoryReader = directory.createReader();
            directoryReader.readEntries(function(entries) {
                var splash = '';
                for (var i=0; i<entries.length; i++) {
                    if (entries[i].name.indexOf(fileName) != -1) {
                        var image_path = directory.toURL() + ""+entries[i].name;
                        splash +='<a class="item"><img src="'+image_path+'" alt="Owl Image" screenIndex="'+i+'"></a>';
                    }
                }
                callBack(splash);
            }, function (error) {
                //alert(error.code);
            });
        });
    }, function(error) {
    // alert("can't even get the file system: " + error.code);
    });
}

//This method is used to delete local storage image
function remove_file(filename) {
    var removeFile = relativeFilePath+""+filename;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        fileSystem.root.getFile(removeFile, {create:false}, function(fileEntry){
            fileEntry.remove(function(file){
                console.log("File removed!");
            },function(){
                console.log("error deleting the file " + error.code);
            });
        },function(){
            console.log("file does not exist");
        });
    },function(evt){
        console.log(evt.target.error.code);
    });
}

//This method is used to fetchDetailobj data and redirect to detail page to show app information
function fetchDetailObj(responseData){
    if(responseData.response){
        if(responseData.response.length==1){
            window.localStorage.setItem("detailObj",encodeURI(JSON.stringify(responseData.response[0])));
            $.mobile.pageContainer.pagecontainer("change", 'detail.html',{reloadPage : true});
        }
    }
}

//This method is used to fetch category information and redirect to category home page
function categoryPage(id){
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM configuration WHERE configurationId = ?", [id], function(tx, res) {
            if(res.rows.length == 1){
                var localData = JSON.parse(JSON.stringify(res.rows.item(0)));
                window.localStorage.setItem("categoryId",localData.configurationId);
                window.localStorage.setItem("categoryName",localData.configurationName);
                window.localStorage.setItem("zoneId",localData.zoneId);
                $.mobile.pageContainer.pagecontainer("change", 'categoryHome.html',{reloadPage : true});
            }
            $.mobile.loading( "hide" );
        });
    });
}

//This method is used to fetch tag information and redirect to tag page
function openTabPage(id){
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT id, tagId, tagName, countryCode FROM tags WHERE countryCode=? ORDER BY UPPER(tagName) ASC", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                if(localData.tagId == id){
                    loadTabContent('#'+id,id,i);
                    return false;
                }
            }
            $.mobile.loading( "hide" );
        });
    });
}

//This method is used to navigate pages from selecting and opening notification 
function pushNotificationNavigation(message,id,type){
    if(type==$.mobile.DETAILPAGE){
        if(window.location.href.indexOf("detail.html") != -1){
            window.history.back();
        }
        requestApi($.mobile.baseUrl +"apps/details/"+id,"get",fetchDetailObj);
    }
    if(type==$.mobile.CATEGORYPAGE){
        $.mobile.loading( "show", {
            text: L['loading'],
            textVisible: true,
            textonly: false,
            html: ""
        });
        if(window.location.href.indexOf("categoryHome.html") != -1){
            window.history.back();
        }
        setTimeout(function(){
            categoryPage(id);
        }, 1000);
    }
    if(type==$.mobile.TAGPAGE){
        $.mobile.loading( "show", {
            text: L['loading'],
            textVisible: true,
            textonly: false,
            html: ""
        });
        setTimeout(function(){
            openTabPage(id);
        }, 5000);
    }
}
