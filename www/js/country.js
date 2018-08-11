var countryId;
var countryCount;

//This method is used to fetch country list from local database
function fetchCountryFromLocal(){
    $('#countryList').html('');
    var countryListHtml="";
	$.mobile.db.transaction(function(tx) {
        tx.executeSql("select * from country", [], function(tx, res) {
            for(var i=0,j=res.rows.length; i<j;i++){
                var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                if(countryId == localData.countryCode){
                    countryCount++;
                    window.localStorage.setItem("selectedCountry",localData.countryCode);
                    window.localStorage.setItem("selectedCountryName",localData.countryName);
                    countryListHtml += '<li id="'+localData.countryCode+'" countryName="'+localData.countryName+'"><img class="countryImage" src="'+localData.countryImage+'"/><label href="#">'+localData.countryName+'</label><span class="tick"></span></li>';
                }else{
                    countryListHtml += '<li id="'+localData.countryCode+'" countryName="'+localData.countryName+'"><img class="countryImage" src="'+localData.countryImage+'"/><label href="#">'+localData.countryName+'</label><span class="untick"></span></li>';
                }
            }
            $('#countryList').append(countryListHtml);
            $('#countryList').listview("refresh");
        });
    });
}

//This method is used to fetch country list from webservice to local database
function fetchCountryFromWebservice(responseData){
    if(!window.localStorage.getItem("initialAppLoad")){
        window.localStorage.setItem("refreshTimestamp",responseData.timestamp);
    }
    var deleteObj = responseData.delete_at;
    if(deleteObj){
        $.mobile.db.transaction(function(tx) {
            for(var i=0,j=deleteObj.length; i<j;i++){
                if(deleteObj[i].section == "country"){
                    tx.executeSql("DELETE FROM country WHERE countryId=? AND countryCode=?",[deleteObj[i].cat_id, window.localStorage.getItem("selectedCountry")],function(tx, res) {});
                }
            }
        });
    }
    if(responseData.response != false){
        $.mobile.db.transaction(function(tx) {
            for(var i=0,j=responseData.response.length; i<j;i++){
                tx.executeSql("INSERT OR REPLACE INTO country (countryId, countryName, countryCode, countryImage) VALUES (?,?,?,?)", [responseData.response[i].tid, responseData.response[i].name, responseData.response[i].iso2,responseData.response[i].image], function(tx, res) {});
            }
        });
        fetchCountryFromLocal();
    }else{
        fetchCountryFromLocal();
    }
}

//This method is used to for country selection click event
function countrySelctedClickEvent(e){
    $('#countryList li').find("span").removeClass("tick");
    $('#countryList li').find("span").addClass("untick");
    countryCount = 0;
    if($(this).find("span").attr("class") == "tick"){
        $(this).find("span").removeClass("tick");
        $(this).find("span").addClass("untick");
    }else{
        window.localStorage.setItem("selectedCountry",$(this).attr("id"));
        window.localStorage.setItem("selectedCountryName",$(this).attr("countryName"));
        $(this).find("span").removeClass("untick");
        $(this).find("span").addClass("tick");
        countryCount++;
    }
}

//This method is used to call country webservice in onResume application
function continueButtonClickEvent(e){
    if(countryCount == 0){
        nativeAlert(L['selectCountry'],L['ok'],function(){});
    }else{
        ga_storage._trackEvent('Country', 'Selection', window.localStorage.getItem("selectedCountryName"));
        window.localStorage.setItem("configurationTimeStamp",0);
        $.mobile.pageContainer.pagecontainer("change", 'configuration.html',{reloadPage : true});
    }
}

//This method is used to call country webservice in onResume application
function onResumeCountry(){
    if(window.location.href.indexOf("country.html") != -1){
        if(!window.localStorage.getItem("initialAppLoad")){
            if(isConnectionAvailable()){
                requestApi($.mobile.baseUrl +"category/termlist?catid=2","get",fetchCountryFromWebservice,false);
            }else{
                fetchCountryFromLocal();
            }
        }
    }
}

//This page create event for country page
$(document).on('pagecreate', '#country', function (event, data) {
    ga_storage._trackPageview('countryList');
    document.addEventListener("resume", onResumeCountry, false);
    countryId = window.localStorage.getItem('countryCodeFromMap');
    countryCount = 0;
    $(document).on('click','#countryList li',countrySelctedClickEvent);
    $(document).on('click','#countryNext',continueButtonClickEvent);               
    if(isConnectionAvailable()){
        requestApi($.mobile.baseUrl +"category/termlist?catid=2","get",fetchCountryFromWebservice,false);
    }else{
        fetchCountryFromLocal();
    }
});

//This page hide event for country page
$(document).on('pagehide', '#country', function (event, data) {
    document.removeEventListener("resume", onResumeCountry, false);
    $(document).off('click', '#countryNext', continueButtonClickEvent);
});