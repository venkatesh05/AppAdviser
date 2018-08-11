package com.ohh2ahh.appavailability;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;

public class AppAvailability extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if(action.equals("checkAvailability")) {
            String uri = args.getString(0);
            this.checkAvailability(uri, callbackContext);
            return true;
        }else if(action.equals("open")) {
            String uri = args.getString(0);
            this.open(uri, callbackContext);
            return true;
        }else if(action.equals("install")) {
            String uri = args.getString(0);
            this.install(uri, callbackContext);
            return true;
        }else if(action.equals("uninstall")) {
            String uri = args.getString(0);
            this.uninstall(uri, callbackContext);
            return true;
        }
        return false;
    }
    
    // Thanks to http://floresosvaldo.com/android-cordova-plugin-checking-if-an-app-exists
    public boolean appInstalled(String uri) {
        Context ctx = this.cordova.getActivity().getApplicationContext();
        final PackageManager pm = ctx.getPackageManager();
        boolean app_installed = false;
        try {
            pm.getPackageInfo(uri, PackageManager.GET_ACTIVITIES);
            app_installed = true;
        }
        catch(PackageManager.NameNotFoundException e) {
            app_installed = false;
        }
        return app_installed;
    }
    
    private void checkAvailability(String uri, CallbackContext callbackContext) {
        if(appInstalled(uri)) {
            callbackContext.success();
        }
        else {
            callbackContext.error("");
        }
    }
    
    private void open(final String uri, final CallbackContext callbackContext) {
    	final Context ctx = this.cordova.getActivity().getApplicationContext();
    	this.cordova.getActivity().runOnUiThread(new Runnable() {
    	    public void run() {
    	    	Intent i;
    	    	PackageManager manager = ctx.getPackageManager();
    	    	try {
    	    	    i = manager.getLaunchIntentForPackage(uri);
    	    	    if (i == null)
    	    	        throw new PackageManager.NameNotFoundException();
    	    	    i.addCategory(Intent.CATEGORY_LAUNCHER);
    	    	    ctx.startActivity(i);
    	    	} catch (PackageManager.NameNotFoundException e) {
    	    		callbackContext.error("");
    	    	}
    	    }
    	});
    }
    
    private void install(final String filePath, CallbackContext callbackContext) {
    	final Context ctx = this.cordova.getActivity().getApplicationContext();
    	final Activity activity =this.cordova.getActivity();
    	this.cordova.getActivity().runOnUiThread(new Runnable() {
    	    public void run() {
    	    	Intent promptInstall = new Intent(Intent.ACTION_VIEW);
    	    	promptInstall.setDataAndType(Uri.parse(filePath), 
    	                        "application/vnd.android.package-archive");
    	    	promptInstall.setFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK);                     
    	    	promptInstall.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK); 
    	    	promptInstall.putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true);
    	    	promptInstall.putExtra(Intent.EXTRA_RETURN_RESULT, true);
    	    	activity.startActivityForResult(promptInstall, 1);
    	    		//ctx.startActivity(promptInstall); 
    	    	
    	    }
    	});
    }
    
    private void uninstall(final String uri, CallbackContext callbackContext) {
    	final Context ctx = this.cordova.getActivity().getApplicationContext();
    	final Activity activity =this.cordova.getActivity();
    	this.cordova.getActivity().runOnUiThread(new Runnable() {
    	    @SuppressLint("InlinedApi")
			public void run() {
    	    	Intent intent = new Intent(Intent.ACTION_DELETE);
    	    	intent.setFlags(Intent.FLAG_ACTIVITY_MULTIPLE_TASK);                     
    	    	intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK); 
    	    	intent.setData(Uri.parse("package:"+uri));
    	    	intent.putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true);
    	    	intent.putExtra(Intent.EXTRA_RETURN_RESULT, true);
    	    	activity.startActivityForResult(intent, 1);
    	    	
    	    }
    	});
    }
}
