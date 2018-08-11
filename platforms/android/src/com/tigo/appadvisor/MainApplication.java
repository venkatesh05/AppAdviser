package com.tigo.appadvisor;

import com.parse.Parse;
import com.parse.ParseBroadcastReceiver;
import com.parse.ParseInstallation;
import com.parse.PushService;

import android.app.Application;
import android.content.Context;
import android.util.Log;

public class MainApplication extends Application {
    private static MainApplication instance = new MainApplication();

    public MainApplication() {
        instance = this;
    }

    public static Context getContext() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
            //String applicationId = "4RC6gA4lQQ8dyAuzWtl9CAQCmhKBLHxnUiE0TE4P";
            //String clientKey = "s7pTyNA9GFHu6hdBkYsbBJxPgilaW8sD1s5po3BS";
            String applicationId = "ULyIi3XvbqK1zXrwY5TO8rzEoguNdyEJc0kmKjvu";//Production Url
            String clientKey = "O02jDNMk6PZxalVKzk4ExHIm5ZLwfrEj4v6SIHnI";//Production Url
	        Log.i("@@@@","Custom Application called");
	        Log.i("@@@@","Custom applicationId = "+applicationId);
	        Log.i("@@@@","Custom clientKey = "+clientKey);
	        Parse.initialize(this, applicationId, clientKey);
	        PushService.setDefaultPushCallback(this, AppAdvisor.class);
	        PushService.subscribe(this, "INITIAL", AppAdvisor.class);
	        ParseInstallation.getCurrentInstallation().saveInBackground();
	        String installationId = ParseInstallation.getCurrentInstallation().getInstallationId();
	        Log.i("@@@@","installationId ="+installationId);
    }
}