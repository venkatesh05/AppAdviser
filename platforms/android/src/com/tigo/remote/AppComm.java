package com.tigo.remote;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;
import android.widget.Toast;

public class AppComm extends CordovaPlugin {

	private static AppComm instance;

	public AppComm() {
		instance = this;
	}

	public static AppComm getInstance() {
		return instance;
	}

	public PluginResult execute(String arg0, JSONArray arg1, String arg2) {
		return null;
	}

	public void sendValue(String message) {
		String js = String.format(
				"window.AppComm.showAlert('%s');", message);
		this.webView.sendJavascript(js);
	}
}