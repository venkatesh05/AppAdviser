//This method is used to initialize and recieve push notification for IOS
function iosNotification(){
    if(!window.localStorage.getItem("pushNotification")){
        window.localStorage.setItem("pushNotification","ON");
    }
    parsePlugin.initialize("ULyIi3XvbqK1zXrwY5TO8rzEoguNdyEJc0kmKjvu", "O02jDNMk6PZxalVKzk4ExHIm5ZLwfrEj4v6SIHnI", function() {
                           }, function(e) {
                           });
    parsePlugin.receiveRemoteNotification = function(data){
        var obj = data.split("#");
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
    }
}

//This method is used to initialize push notification for Android
function androidNotification(window){
    if(!window.localStorage.getItem("pushNotification")){
        window.localStorage.setItem("pushNotification","ON");
    }
    window.webintent.hasExtra("com.parse.Data",
    function(has) {
        if(has) {
            window.webintent.getExtra("com.parse.Data", function(d) {
                var obj = $.parseJSON(d);
                pushNotificationNavigation(obj.alert,obj.id,obj.type);
            }, function() {
            });
        }
    }, function() {
    });
}
