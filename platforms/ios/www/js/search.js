//This method is used to search from webservice to local database
function fetchSearchFromWebservice(responseData){
    $('#searchList').html('');
    var content="";
    if(responseData.response.length>0){
        for(var i=0;i<responseData.response.length;i++){
            var srcImage = responseData.response[i].icon?responseData.response[i].icon:"img/noimage.png";
            var detailObj = encodeURI(JSON.stringify(responseData.response[i]));
            content += '<li class="ui-li-has-thumb searchAppItem" detailObj ="'+detailObj+'" categoryName =""><a class="ui-btn" href="#">'+
            '<img class = "allListImage roundedCorner" src="'+srcImage+'">'+
            '<div style="width: 100%;margin: 10px;"><div style="width: 80%;float: left;margin-top:5%">'+
            '<h2>'+responseData.response[i].title+'</h2>'+
            '<div class="categoryName">'+responseData.response[i].appdetails.app_category+'</div>'+
            '<div class="starHome'+responseData.response[i].nid+'"></div>'+
            '</div><div style="width: 20%;float:left;margin-top:15%;">';
            if(isConnectionAvailable()){
                var streamUrl = $.mobile.getStreamInfo+"categoryID="+$.mobile.CATEGORYID+"&streamID="+responseData.response[i].nid+"&apikey="+$.mobile.GIGYAAPIKEY+"&format=json";
                showStarRating(streamUrl,"starHome"+responseData.response[i].nid);
            }
            if($.mobile.platform == $.mobile.android){
                if(responseData.response[i].appdetails.android_pricing.toUpperCase() == "FREE" || responseData.response[i].appdetails.android_pricing.toUpperCase() == ""){
                    content += '<h3>'+responseData.response[i].appdetails.android_pricing+'</h3>';
                }else{
                    content += '<h3>'+responseData.response[i].appdetails.android_currencytype+''+responseData.response[i].appdetails.android_price+'</h3>';
                }
            }else if($.mobile.platform == $.mobile.iOS){
                if(responseData.response[i].appdetails.iphone_pricing.toUpperCase() == "FREE" || responseData.response[i].appdetails.iphone_pricing.toUpperCase() == ""){
                    content += '<h3>'+responseData.response[i].appdetails.iphone_pricing+'</h3>';
                }else{
                    content += '<h3>'+responseData.response[i].appdetails.iphone_currencytype+''+responseData.response[i].appdetails.iphone_price+'</h3>';
                }
            }
            content += '</div></div>'+
            '</a>'+
            '</li>';
        }
        
        $('#searchList').append(content);
        $('#searchList').listview("refresh");
        
    }else{
        $('#searchList').html('<div class="noRecords">No se encontraron registros</div>');
    }
    $('#searchText').blur();
}

//This method is used to search from local database
function fetchSearchFromLocal(value){
    $('#searchList').html('');
    var content="";
    $.mobile.db.transaction(function(tx) {
        //var likeQuery = value+"%";
        tx.executeSql("SELECT * FROM apps WHERE appName like '"+value+"%' AND countrycode=?", [window.localStorage.getItem("selectedCountry")], function(tx, res) {
            if(res.rows.length == 0){
                $('#searchList').html('<div class="noRecords">No Records Found</div>');
            }else{
                for(var i=0,j=res.rows.length; i<j;i++){
                    var localData = JSON.parse(JSON.stringify(res.rows.item(i)));
                    var srcImage = localData.appImage?localData.appImage:"img/noimage.png";
                    var detailObj = $.parseJSON(decodeURI(localData.appDetailObj));
                    content += '<li class="ui-li-has-thumb searchAppItem" detailObj ="'+localData.appDetailObj+'" categoryName =""><a class="ui-btn" href="#">'+
                    '<img class="image'+localData.appId+' allListImage roundedCorner" src="img/noimage.png">'+
                    '<div style="width: 100%;margin: 10px;"><div style="width: 80%;float: left;margin-top:5%">'+
                    '<h2>'+localData.appName+'</h2>'+
                    '<div class="categoryName">'+detailObj.appdetails.app_category+'</div>'+
                    '<div class="rating"></div>'+
                    '</div><div style="width: 20%;float:left;margin-top:15%;">';
                    if($.mobile.platform == $.mobile.android){
                        if(detailObj.appdetails.android_pricing.toUpperCase() == "FREE" || detailObj.appdetails.android_pricing.toUpperCase() == ""){
                            content += '<h3>'+detailObj.appdetails.android_pricing+'</h3>';
                        }else{
                            content += '<h3>'+detailObj.appdetails.android_currencytype+''+detailObj.appdetails.android_price+'</h3>';
                        }
                    }else if($.mobile.platform == $.mobile.iOS){
                        if(detailObj.appdetails.iphone_pricing.toUpperCase() == "FREE" || detailObj.appdetails.iphone_pricing.toUpperCase() == ""){
                            content += '<h3>'+detailObj.appdetails.iphone_pricing+'</h3>';
                        }else{
                            content += '<h3>'+detailObj.appdetails.iphone_currencytype+''+detailObj.appdetails.iphone_price+'</h3>';
                        }
                    }
                    content += '</div></div>'+
                    '</a>'+
                    '</li>';
                    if(localData.appImage){
                      get_file(localData.appId,"icon");
                    }else{
                      $('.image'+localData.appId).attr('src','img/noimage.png');
                    }
                }
                $('#searchList').append(content);
                      
                $('#searchList').listview("refresh");
                
            }
            $('#searchText').blur();
        });
    });
}

//This method is used to navigate detail page
function searchNavigateToDetailPage(e){
    $(document).off('click', '.searchAppItem', searchNavigateToDetailPage);
    window.localStorage.setItem("detailObj",$(this).attr("detailObj"));
    $.mobile.pageContainer.pagecontainer("change", 'detail.html',{reloadPage : true});
}

//This method is used to search from webservice by passing search word
function OnSearch(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
        if(isConnectionAvailable()){
        	if($(this).val()!="")
            requestApi($.mobile.baseUrl +"search/appslist?action=search&searchtxt="+$(this).val()+"&countrycode="+window.localStorage.getItem("selectedCountry"),"get",fetchSearchFromWebservice);
        }else{
        	if($(this).val()!="")
            fetchSearchFromLocal($(this).val());
        }
    }
    event.stopPropagation();
}

//This method is used to clear textfield
function OnClear(){
    $('#searchText').blur();
    $('#searchList').html('');
}

//This focus event for searchtext input field
$(document).on('focus', '#searchText', function (event, data) {
    $('.ui-fixed-hidden').css("position","fixed");
});

//This page before show event for home page
$(document).on('pagebeforeshow', '#home', function (event, data) {
    $('#searchList').html('');
    $('#searchText').val('');
    $('#search').remove();
    $(document).off('click', '.searchAppItem', searchNavigateToDetailPage);
});

//This page before show event for category landing  page
$(document).on('pagebeforeshow', '#categoryHome', function (event, data) {
    $('#searchList').html('');
    $('#searchText').val('');
    $('#search').remove();
    $(document).off('click', '.searchAppItem', searchNavigateToDetailPage);
});

//This page create event for search page
$(document).on('pagecreate', '#search', function (event, data) {
    var tabPageView = 'searchList';
    ga_storage._trackPageview(tabPageView);
});

//This page hide event for search page
$(document).on('pagehide', '#search', function (event, data) {
    $('#searchText').blur();
    $(document).off('keypress', '#searchText', OnSearch);
    $(document).off('click', '.ui-input-clear', OnClear);
    $(document).off('click', '.searchAppItem', searchNavigateToDetailPage);
});

//This page show event for search page
$(document).on('pageshow', '#search', function (event, data) {
    $(document).on('keypress', '#searchText', OnSearch);
    $(document).on('click', '.ui-input-clear', OnClear);
    $(document).on('click', '.searchAppItem', searchNavigateToDetailPage);    
});
