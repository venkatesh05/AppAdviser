package com.tigo.appadvisor;

import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.parse.ParseBroadcastReceiver;
import com.tigo.remote.AppComm;

public class MyBroadcastReceiver extends ParseBroadcastReceiver {
	private static final String TAG = "MyBroadcastReceiver";

	@Override
	public void onReceive(Context context, Intent intent) {
		try {
			Log.d(TAG, "Notification received");
			//Toast.makeText(context, "Recived", Toast.LENGTH_LONG).show();
			JSONObject json = new JSONObject(intent.getExtras().getString(
					"com.parse.Data"));
			String title = "";
			if (json.has("alert"))
				title = json.getString("alert");
            if (json.has("id"))
				title += "#"+json.getString("id");
            if (json.has("type"))
				title += "#"+json.getString("type");
			AppComm.getInstance().sendValue(title);
		} catch (Exception e) {
			Log.d(TAG, "JSONException: " + e.getMessage());
			e.printStackTrace();
		}
	}
}
