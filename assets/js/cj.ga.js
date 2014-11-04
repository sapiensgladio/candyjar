function handleClientLoad(){
    console.log("handleClientLoad");
    window.setTimeout(gaTracking.checkAuth, 1);
}
var gaTracking = {
    DEV_ENV : true
    , clientId : '278341015494-o0oi0du5tnephpf5oka4h8gt1rk357b4.apps.googleusercontent.com'
    , apiKey : 'AIzaSyA5gu0IKTef_qOsP1Aq9xe_6LHxY6KHfLE'
    , scopes : 'https://www.googleapis.com/auth/analytics.readonly'
    , accountId : '55361416'
    , webPropertyId : 'UA-55361416-1'
    , profileId : '91935019'
    , outputArray : []
    , emailEventCount : ""
    , checkAuth : function(){
        if(this.DEV_ENV) console.log("checkAuth");
        gapi.client.setApiKey(this.apiKey);
        gapi.auth.authorize({
            client_id: gaTracking.clientId,
            scope: gaTracking.scopes,
            immediate: true
            }, gaTracking.handleAuthResult
        );
    }
    , handleAuthResult : function(authResult) {
        if(this.DEV_ENV) console.log("handleAuthResult");
        if (authResult && !authResult.error) { //Add check for error!!
            gapi.client.load('analytics', 'v3', gaTracking.handleAuthorized);
        } else {
            gaTracking.handleUnauthorized();
        }
    }
    , handleAuthorized : function() {

        if(this.DEV_ENV) console.log("handleAuthorized");
        gaTracking.makeApiCall();
        //to-do: insert value into slider

    }
    , handleUnauthorized : function () {
        if(this.DEV_ENV) console.log("handleUnauthorized");
        //to-do: degrade gracefully and set slider back to default'
        //toast!
    }
    , handleAuthClick : function(event) {
        if(this.DEV_ENV) console.log("handleAuthClick");
        gapi.auth.authorize({
            client_id: gaTracking.clientId
            , scope: gaTracking.scopes
            , immediate: false
            }, gaTracking.handleAuthResult);
        return false;
    }
    , makeApiCall : function() {
        if(this.DEV_ENV) console.log("makeApiCall");
        this.queryCoreReportingApi(this.profileId);
    }
    , queryCoreReportingApi : function(profileId) {
        if(this.DEV_ENV) console.log("queryCoreReportingApi");
        gapi.client.analytics.data.ga.get({
            'ids': 'ga:' + gaTracking.profileId,
            'start-date': gaTracking.lastNDays(365),
            'end-date': gaTracking.lastNDays(0),
            'metrics': 'ga:totalEvents',
            'dimensions': 'ga:eventLabel',
        }).execute(handleCoreReportingResults);
    }
    , lastNDays : function(n) {
        var today = new Date();
        var before = new Date();
        before.setDate(today.getDate() - n);

        var year = before.getFullYear();

        var month = before.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }

        var day = before.getDate();
        if (day < 10) {
            day = '0' + day;
        }

        return [year, month, day].join('-');
    }
    , getEmailEventCount : function(email) {
        if(this.DEV_ENV) console.log(gaTracking.outputArray);
        for (var i = 0; i < gaTracking.outputArray.length; i++)
        {
            for (var j = 0; j < gaTracking.outputArray[i].length; j++)
            {
                if(gaTracking.outputArray[i][j]==email)
                {
                    console.log(gaTracking.outputArray[i][j+1]);
                    gaTracking.emailEventCount = gaTracking.outputArray[i][j+1];

                    goToStep(gaTracking.emailEventCount);
                }
            }
        }
    }
    //updates "share" page slider with email count for stored email
    , setEmailCount : function() {
        //get email
        if(localStorage.getItem("email"))
        {
            cjReferral.email = localStorage.getItem("email"); //when live: to this.email
        }
        else if(utils.getCookie("email"))
        {
            //if cjReferral is instantiate, this should be populated
            cjReferral.email = utils.getCookie("email"); //when live: update to this.email
        }
        else
        {
            //error message?
        }

        //get email count
        gaTracking.getEmailEventCount(cjReferral.email); //when live: update to this.email

        //update slider span value
        jQuery("#slider_handle").children(0).html(gaTracking.emailEventCount);
    }

}

function handleCoreReportingResults(response) {
    if(gaTracking.DEV_ENV) console.log("handleCoreReportingResults");
    if (!response.code) {
        if (response.rows && response.rows.length) {
            for (var i = 0, row; row = response.rows[i]; ++i) {
                gaTracking.outputArray.push(row);
            }

            gaTracking.setEmailCount();
        }
        else {
            //to-do: no results
        }
    } else {
        //to-do: error handler
    }
}
