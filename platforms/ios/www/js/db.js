//Opening database from application directory if not present copying db from resource to Application directory
function loadLocalDB(){
    var db = window.sqlitePlugin.openDatabase({name: "Appadvisor"});
    $.mobile.db = db;
}

function refreshContent(callback){    
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("DELETE FROM displayApps WHERE countryCode=?",[window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM categoryDisplay WHERE countryCode=?",[window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM categoryHomepage WHERE countryCode=?",[window.localStorage.getItem("selectedCountry")],function(tx, res) {});
        tx.executeSql("DELETE FROM apps",[],function(tx, res) {});
    });
    $.mobile.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM configuration WHERE countryCode=?", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                window.localStorage.setItem("categoryApps"+localData.configurationId+"TimeStamp",0);
            }
        });
    });
    window.localStorage.setItem("homeAppsTimeStamp",0);
    window.localStorage.setItem("tagsTimeStamp",0);
    callback();
}

function checkMobileRefresh(callback){
		requestApi($.mobile.baseUrl +"apps/refreshapp?lastaccess="+window.localStorage.getItem("refreshTimestamp")+"&countrycode="+window.localStorage.getItem("selectedCountry"),"get",function(responseData){
	        if(responseData){
	            window.localStorage.setItem("refreshTimestamp",responseData.timestamp);
	            if(responseData.refreshapp){
	               refreshContent(function(){
	            	   callback();
	               });
	            }else{
	            	callback();
	            }
	        }
	    },false,true);
}
