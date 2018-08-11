/**
 * cordova Parse Plugin
 * Copyright (c) Boris Smus 2010
 *
 */
 (function(cordova){
    var ParsePlugin = function() {
    	 window.plugins = window.plugins || {};
    	 window.plugins.parsePlugin = window.parsePlugin;
    };
    
    ParsePlugin.prototype.initialize =  function(appId, clientKey, successCallback, errorCallback) {
    	return cordova.exec(successCallback, errorCallback, 'ParsePlugin', 'initialize', [appId, clientKey]);
    };
    
    ParsePlugin.prototype.getInstallationId =  function(successCallback, errorCallback) {
    	return cordova.exec(successCallback, errorCallback, 'ParsePlugin', 'getInstallationId', []);
    };
    
    ParsePlugin.prototype.getInstallationObjectId =  function(successCallback, errorCallback) {
    	return cordova.exec(successCallback, errorCallback, 'ParsePlugin', 'getInstallationObjectId', []);
    };

    ParsePlugin.prototype.getSubscriptions =  function(successCallback, errorCallback) {
    	return cordova.exec(successCallback, errorCallback, 'ParsePlugin', 'getSubscriptions', []);
    };
    
    ParsePlugin.prototype.subscribe =  function(channel, successCallback, errorCallback) {
    	return cordova.exec(successCallback, errorCallback, 'ParsePlugin', 'subscribe', [channel]);
    };
    
    ParsePlugin.prototype.unsubscribe =  function(channel, successCallback, errorCallback) {
    	return cordova.exec(successCallback, errorCallback, 'ParsePlugin', 'unsubscribe', [channel]);
    };
    
    window.parsePlugin = new ParsePlugin();
   
})(window.PhoneGap || window.Cordova || window.cordova);

