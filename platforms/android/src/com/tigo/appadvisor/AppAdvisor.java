/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.tigo.appadvisor;

import android.os.Bundle;
import org.apache.cordova.*;
import org.json.JSONException;
import org.json.JSONObject;

import com.tigo.appadvisor.R;

import android.content.Intent;

public class AppAdvisor extends CordovaActivity {
	@SuppressWarnings("deprecation")
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		super.init();
		super.setIntegerProperty("splashscreen", R.drawable.splashscreen);
		super.loadUrl(Config.getStartUrl());
	}
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode,
                                    Intent intent) {
    	// TODO Auto-generated method stub
    	super.onActivityResult(requestCode, resultCode, intent);
    	this.sendJavascript("refresh();");
    }
}