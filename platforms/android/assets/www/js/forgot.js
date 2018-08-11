//This page show event for forgot password page
$(document).on('pageshow', '#forgot', function (event, data) {
    $('#forgotButton').on("click",function(e){
        var forgotName = $('#forgotName').val();

        if(forgotName.length == 0){
            nativeAlert("Please fill all fields","Ok",function(){});
            return false;
        }
        if (!validateEmail(forgotName)) {
            nativeAlert("Invalid email address","Ok",function(){});
            return false;
        }
        $.mobile.back();
    });
});