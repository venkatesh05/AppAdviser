//This page show event for signin page
$(document).on('pageshow', '#signin', function (event, data) {
    window.localStorage.setItem('siginin',"came");
    $(document).on('click', '.socialImages', openSignin);
});

//This page hide event for signin page
$(document).on('pagehide', '#signin', function (event, data) {
     $(document).off('click', '.socialImages', openSignin);
});

//This method is used to fetch user info from webservice
function fetchUserInfoSignin(responseData){
    if(responseData.UID){
        var name = responseData.firstName+" "+responseData.lastName;
        window.localStorage.setItem('USERID',responseData.UID);
        window.localStorage.setItem('USERNAME',name);
        window.localStorage.setItem('USERMAIL',responseData.email);
        window.history.back();
    }
}

//This method is used to open sigin page 
function openSignin(e){
    if(isConnectionAvailable()){
        var loginURL = $.mobile.socialLogin+"client_id="+$.mobile.GIGYAAPIKEY+"&redirect_uri="+$.mobile.redirectURI+"&x_provider="+$(this).attr("provider")+"&response_type=token"
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
                    gigyaRequest(userUrl,"get",fetchUserInfoSignin);
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
                    gigyaRequest(userUrl,"get",fetchUserInfoSignin);
                }
            });
        }
    }else{
        nativeAlert(L['noInternet'],L['ok'],function(){});
    }
}