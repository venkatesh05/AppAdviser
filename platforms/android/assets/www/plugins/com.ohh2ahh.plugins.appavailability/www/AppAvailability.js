cordova.define("com.ohh2ahh.plugins.appavailability.AppAvailability", function(require, exports, module) { var exec = require('cordova/exec');

var appAvailability = {
    
    check: function(urlScheme, successCallback, errorCallback) {
        exec(
            successCallback,
            errorCallback,
            "AppAvailability",
            "checkAvailability",
            [urlScheme]
        );
    },
    
    checkBool: function(urlScheme, callback) {
        exec(
            function(success) { callback(success); },
            function(error) { callback(error); },
            "AppAvailability",
            "checkAvailability",
            [urlScheme]
        );
    },
    
    open: function(urlScheme, callback) {
        exec(
            function(success) { callback(success); },
            function(error) { callback(error); },
            "AppAvailability",
            "open",
            [urlScheme]
        );
    },
    
    install: function(filePath, callback) {
        exec(
            function(success) { callback(success); },
            function(error) { callback(error); },
            "AppAvailability",
            "install",
            [filePath]
        );
    },
    
    uninstall: function(urlScheme, callback) {
        exec(
            function(success) { callback(success); },
            function(error) { callback(error); },
            "AppAvailability",
            "uninstall",
            [urlScheme]
        );
    }
    
};

module.exports = appAvailability;
});
