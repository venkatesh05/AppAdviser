/**
 * This is custom plugin for Android parse push notification
 * AppComm.prototype.showAlert is calling from java class 
 *
 */

 (function(cordova){
    var AppComm = function() {
    	 window.plugins = window.plugins || {};
    	 window.plugins.AppComm = window.AppComm;
    };
    
    AppComm.prototype.showAlert = function(json) {
    var obj = json.split("#");
  
    function onConfirm(buttonIndex) {
        if(buttonIndex == 1){
            pushNotificationNavigation(obj[0],obj[1],obj[2]);
        }
    }
    navigator.notification.confirm(
        obj[0], // message
        onConfirm,            // callback to invoke with index of button pressed
        'Push Notification',           // title
        ['Launch','Close']     // buttonLabels
    );
    };
    
    window.AppComm = new AppComm();
   
})(window.PhoneGap || window.Cordova || window.cordova);
