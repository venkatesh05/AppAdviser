IOS
//http://stackoverflow.com/questions/14968578/calling-didreceiveremotenotification-when-app-is-launching-for-the-first-time

/*
While application in Open state parsePlugin.receiveRemoteNotification is handling
*/

- (void)swizzled_application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
    // Call existing method
    [self swizzled_application:application didReceiveRemoteNotification:userInfo];
    //[PFPush handlePush:userInfo];
    NSString* jsString = [NSString stringWithFormat:@"parsePlugin.receiveRemoteNotification(\"%@\");", [NSString stringWithFormat:@"%@",[[userInfo objectForKey:@"aps"] objectForKey:@"alert"]]];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];
    [[UIApplication sharedApplication] setApplicationIconBadgeNumber:1];
    [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
}


/*
Initailly launching notification navigate to notification center
*/

NSDictionary* userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
    if(userInfo) {
        self.viewController.startPage = @"notification.html";
        [[UIApplication sharedApplication] setApplicationIconBadgeNumber:1];
        [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
    }
    
    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];
    return YES;

/*
If Existing Db not available copy to application directory
*/

-(id) getDBPath:(id)dbFile {
    if (dbFile == NULL) {
        return NULL;
    }
    NSString *dbPath = [NSString stringWithFormat:@"%@/%@", appDocsPath, dbFile];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    /* If file is not exists, copy the file from resources*/
    if(![fileManager fileExistsAtPath:dbPath]){
        NSString *FileDB = [[[NSBundle mainBundle]resourcePath]stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.db", dbFile]];
        [fileManager copyItemAtPath:FileDB toPath:dbPath error:nil];
    }
    return dbPath;
}

Android


