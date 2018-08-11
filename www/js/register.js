//This page show event for register page
$(document).on('pageshow', '#register', function (event, data) {
    $('#registerButton').on("click",function(e){
        var registerMail = $('#registerMail').val();
        var registerName = $('#registerName').val();
        var registerPassword = $('#registerPassword').val();
        var registerRePassword = $('#registerRePassword').val();
        
        if(registerMail.length == 0){
            nativeAlert("Please fill all fields","Ok",function(){});
            return false;
        }
        if (!validateEmail(registerMail)) {
            nativeAlert("Invalid email address","Ok",function(){});
            return false;
        }
        if(registerName.length == 0){
            nativeAlert("Please fill all fields","Ok",function(){});
            return false;
        }
        if(registerPassword.length == 0){
            nativeAlert("Please fill all fields","Ok",function(){});
            return false;
        }
        if(registerPassword.length <=6){
            nativeAlert("Password length should be greater than 6","Ok",function(){});
            return false;
        }
        if(registerRePassword.length == 0){
            nativeAlert("Please fill all fields","Ok",function(){});
            return false;
        }
        if(registerPassword != registerRePassword){
            nativeAlert("Password doesn't match","Ok",function(){});
            return false;
        }      
    });
});