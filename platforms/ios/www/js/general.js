//This method is used to get Network state for device
function isConnectionAvailable() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
   
    if(states[networkState] == 'No network connection'){
        return false;
    }

    return true;
}

//This method is used to fetch device information
function deviceInfo() {
    $.mobile.platform = device.platform;
    $.mobile.width = $(window).width();
    $.mobile.height = $(window).height();
}

//This method is used to location success and navigate to country page
var onLocationSuccess = function(position) {
    if(isConnectionAvailable()){
        requestApi("http://maps.googleapis.com/maps/api/geocode/json?sensor=true&latlng="+position.coords.latitude+","+position.coords.longitude,"get",function(responseData){
            var countryName,countryCode;
            if(responseData && responseData.status == "OK"){
                var resLen = responseData.results[0].address_components.length;
                for(var i=0, i1 = resLen; i<i1; i++ ){
                    switch (responseData.results[0].address_components[i].types[0])
                    {
                        case "country":
                            countryName = responseData.results[0].address_components[i].long_name;
                            countryCode = responseData.results[0].address_components[i].short_name;
                            break;
                    }
                }
            }else{
                countryName = null;
                countryCode = null;
            }
            $.mobile.loading( "hide" );
            window.localStorage.setItem('countryCodeFromMap',countryCode);
            $.mobile.pageContainer.pagecontainer("change", 'country.html',{reloadPage : true});
        });   
    }else{
        $.mobile.loading( "hide" );
        window.localStorage.setItem('countryCodeFromMap',null);
        $.mobile.pageContainer.pagecontainer("change", 'country.html',{reloadPage : true});
    }
};

//This method is used to handle location error
function onLocationError(error) {
    if($.mobile.platform == $.mobile.android){
        $.mobile.loading( "hide" );
        window.localStorage.setItem('countryCodeFromMap',null);
        $.mobile.pageContainer.pagecontainer("change", 'country.html',{reloadPage : true});
    }else if($.mobile.platform == $.mobile.iOS){
        if(error.code == 1 || error.code == 2){
            $.mobile.loading( "hide" );
            window.localStorage.setItem('countryCodeFromMap',null);
            $.mobile.pageContainer.pagecontainer("change", 'country.html',{reloadPage : true});
        }
    }
}

//This method is used to call for fetching current location
function fetchLocation() {
    $.mobile.loading( "show", {
        text: L['loading'],
        textVisible: true,
        textonly: false,
        html: ""
    });
    if($.mobile.platform == $.mobile.android){
        navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError,{enableHighAccuracy: true,timeout: 10000,maximumAge: 3000});
    }else if($.mobile.platform == $.mobile.iOS){
        navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError,{enableHighAccuracy: true});
    }
}

//This method is used to show native alert as generic
function nativeAlert(message,buttonName,callback){
    navigator.notification.alert(message,callback,$.mobile.appName,buttonName);
}

//This method is used to show language specific contents
function changeLanguageConent(){
    /* For Static content we need to use class as '.lang' and pass attribute in the name 'data-lang' to change static content as per selected language */
    $('.lang').each(function( index ) {
        if($(this).attr("data-lang"))
        $( this ).text(L[$(this).attr("data-lang").trim()]);
    });
}

//This method is used to validate email
function validateEmail(sEmail) {
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (filter.test(sEmail)) {
        return true;
    }
    else {
        return false;
    }
}

//This method is used to handling android hardware back button
function exitFromApp() {
    window.localStorage.setItem('tagHref',"");                             
    if(window.location.href.indexOf("home.html") != -1 || window.location.href.indexOf("country.html") != -1 || window.location.href.indexOf("index.html") != -1){
        navigator.app.exitApp();
    }else{
        window.history.back();
    }
}                             

//This method is used to call plugin to open application
function openApp(appId){
    appAvailability.open(
        appId, // URI Scheme
        function() { // Success callback
            console.log('app is opened');
        }
    );
}

//This method is used to remove item from an array
function removeItem(arr, item) {
    for(var i = arr.length-1; i--;) {
        if(arr[i] === item) {
            arr.splice(i, 1);
        }
    }
    return arr;
}

