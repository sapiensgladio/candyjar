jQuery(document).ready(function() {
    cjReferral.init();
});
var cjReferral = {
    DEV_ENV : true
    , email : ""
    , emailFromURL : ""
    , emailCipherObj : ""
    , emailCipher : ""
    , referralLink : ""
    , referringLink : ""
    , init : function (){
        if ((window.location.href).indexOf("preview_key") > -1 || jQuery(".kickstarter-wrapper").length > 0)
        {
            kickstarter.init();
        }
//homepage
//jQuery("#email").focus();
        if(this.DEV_ENV) console.log("cjReferral init");
//capture any parameters in URL
        this.getEmailFromURL();
        this.checkIfFirstTimeVisitor();
        this.vanityURL();
//bind click event to sign up button
        jQuery("#signup_form").submit(function (evt){
//checks to see if email input form is valid for email address
            if(!cjReferral.validateForm()) {
                return false;
            }
            cjReferral.setReferralLinkFromURL()
            cjReferral.emailFromURL = utils.decipher(decodeURIComponent(cjReferral.referringLink));
            cjReferral.email = cjReferral.getEmail();
            if(!cjReferral.validateNewEmail()) {
                return false;
            }
            else{
                if(cjReferral.setReferralLinkFromURL()){
                    utils.sendGAEvent(cjReferral.emailFromURL);
                }
//set email to user entered value
                cjReferral.emailCipherObj = cjReferral.setEmailCipher();
                cjReferral.emailCipher = encodeURIComponent(cjReferral.emailCipherObj);
                if(cjReferral.DEV_ENV) console.log(cjReferral.emailCipher);
                cjReferral.referralLink = cjReferral.setRefLink();
                utils.sendGAEvent(cjReferral.email);
                cjReferral.setHiddenInputs(); //sets hidden field values for emailCipher & refLink for db submission
                cjReferral.setReferralCookies(); //sets email, emailCipher & refLink into HTML5 local storage and cookie for state management
            }
        });
      $('#cj_kickstarter_link').click( function(event)
	{
		ga('send', 'event', 'visit', 'kickstarter', email, {'page': window.location.pathname}, 1);
	}
);
    }
    , checkIfFirstTimeVisitor : function(){
        var localEmail;
        var localEmailCipher;
        var localRefLink;
        if(utils.hasLocalStorage()){
            localEmail = localStorage.getItem("email");
            localEmailCipher = localStorage.getItem("emailCipher");
            localRefLink = localStorage.getItem("refLink");
        }
        else{
            localEmail = utils.getCookie("email");
            localEmailCipher = utils.getCookie("emailCipher");
            localRefLink = utils.getCookie("refLink");
        }
//removing for Kickstarter
        /**
         if((localEmail != null || localEmailCipher != null || localRefLink != null)
         && (localEmail.length > 0 || localEmailCipher.length > 0 || localRefLink.length > 0)
         && (window.location.href).indexOf("share") < 0){
//show toast - you've been here before - want to check you progress
this.setToastPersist("<h6>You look familiar.</h6><p>Looks like you've already signed up! <a href='/share'>Want to track your progress?</a></p>");
return false;
} **/
    }
    , validateNewEmail : function(){
        console.log(this.email);
        console.log(this.emailFromURL);
        if(this.email == this.emailFromURL){
            this.setToastPersist("<h6>We know you!</h6><p>Thanks for being a part of our launch! You can track your progress on <a href='/share'>your referral page</a></p>");
            return false;
        }
        else
            return true;
    }
    , setEmailCipher : function() {
//using customer submitted email, create emailCipher
        var encrypted = CryptoJS.AES.encrypt(this.email, "referral");
        if(utils.decipher(encrypted) !== this.email){
            console.log("Error: Cipher failed to match naked email.");
            return false;
        }
        else{
            console.log("Success: Decipher matched naked email.");
            return encrypted;
        }
    }
    , setRefLink : function() {
//using emailCipher, create refLink
        return "http://www.candyjar.com?ref=" + this.emailCipher;
    }
    , setHiddenInputs : function() {
        document.getElementById("00NG000000EUBxo").value = this.emailCipher;
        document.getElementById("00NG000000EUBxt").value = this.referralLink;
    }
    , setReferralLinkFromURL : function(){
//get "ref" querystring, decode it and trim it; save as referringLink variable.
        if(utils.getParameterByName("ref")) {
            cjReferral.referringLink = decodeURIComponent(utils.getParameterByName("ref")).trim();
            document.getElementById("00NG000000EUEKG").value = cjReferral.referringLink;
            return true
        }
        return false;
    }
    , getEmailFromURL : function(){
//get "ref" querystring, decode it and trim it; save as referringLink variable.
        if(utils.getParameterByName("e")) {
//get "e" querystring, decode it and trim it; save as email variable.
            cjReferral.emailFromURL = decodeURIComponent(utils.getParameterByName("e")).trim();
            document.getElementById("email").value = cjReferral.emailFromURL;
            return true
        }
        return false;
    }
    , validateForm : function() { //standard text input validation for "email"
        var x = document.getElementById("email").value;
        var atpos = x.indexOf("@");
        var dotpos = x.lastIndexOf(".");
        if (atpos< 1 || dotpos<atpos+2 || dotpos+2>=x.length) {
//todo: add toast
// also use browser support here
            this.setToast("Not a valid e-mail address");
            return false;
        }
        else {
            return true;
        }
    }
    , getEmail : function (){
        var localEmail = document.getElementById("email").value;
        return localEmail.trim();
    }
    , setReferralCookies : function() {
//takes customer input, as "email", and calculated variables, as "emailCipher" and "refLink", and persists in local memory for use in next page
        utils.setCookie("email",this.email,365); //sets "email" cookie
        utils.setCookie("emailCipher",this.emailCipher,365); //sets "emailCipher" cookie
        utils.setCookie("refLink",this.referralLink,365); //sets "refLink" cookie
        if(utils.hasLocalStorage())
        {
            localStorage.setItem("email",this.email);
            localStorage.setItem("emailCipher",this.emailCipher);
            localStorage.setItem("refLink",this.referralLink);
        }
    }
    , vanityURL : function() {
        if(document.location.href=="http://www.candyjar.com/pages/share") {
            window.history.pushState("object or string", "Page URL", "/share");
        }
    }
    , setToast : function(message){
        setTimeout(function() {
            jQuery("#toast_persist").slideUp();
            jQuery("#toast").html(message).slideDown();
            setTimeout(function(){jQuery("#toast").slideUp()}, 5000);
        }, 100);
    }
    , setToastPersist : function(message){
        jQuery("#toast_inner").html(message);
        setTimeout(function(){
            jQuery("#toast").html(message).slideUp();
            jQuery("#toast_persist").slideDown("slow");
            jQuery("#close_toast").click(function () {
                jQuery("#toast_persist").slideUp()
            });
        }, 1000);
    }
}
var bitlyAPI = {
    login : "candyjar"
    , apiKey : "R_e2caeb127e824c9e910a10ac65dec0b9"
    , shortenURL : function(long_url){
        if(typeof long_url === "undefined") return false;
        jQuery.getJSON("https://api-ssl.bitly.com/v3/shorten?access_token=cdfb6b1d913189749b905421be881b4e39610473&longUrl="+long_url,
            {
                "format": "json",
                "apiKey": bitlyAPI.apiKey,
                "login": bitlyAPI.login,
                "longUrl": long_url
            },
            function(response)
            {
                sharePage.bitlyURL = response.data.url;
                sharePage.bitlyURLs();
                return true;
//return(response.data.url);
            }
        );
    }
    , lengthenURL : function(short_url){
        jQuery.getJSON("https://api-ssl.bitly.com/v3/expand?access_token=cdfb6b1d913189749b905421be881b4e39610473&shortUrl="+short_url,
            {
                "format": "json",
                "apiKey": bitlyAPI.apiKey,
                "login": bitlyAPI.login,
                "longUrl": short_url
            },
            function(response)
            {
                return(response.data.url);
            }
        );
    }
}
var utils = {
    getCookie : function (c_name){
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start,c_end));
        }
        return c_value;
    }
    , setCookie: function (cname, cvalue, exdays) {
//standard function to create cookie
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    , sendGAEvent : function(labelValue){
        ga('send', 'event', 'button', 'click', labelValue, {'page': '/'}, 1);
        /**
         * Utility to wrap the different behaviors between W3C-compliant browsers
         * and IE when adding event handlers.
         *
         * @param {Object} element Object on which to attach the event listener.
         * @param {string} type A string representing the event type to listen for
         * (e.g. load, click, etc.).
         * @param {function()} callback The function that receives the notification.
         */
    }
    , addEventListener : function (element, type, callback){
        if (element.addEventListener) element.addEventListener(type, callback);
        else if (element.attachEvent) element.attachEvent('on' + type, callback);
    }
    , getParameterByName: function (name) { //function to get querystring variables by name
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    , decipher : function(cipher) { //function created to decipher emailCipher to ensure fidelity of cipher function
        return CryptoJS.AES.decrypt(cipher, "referral").toString(CryptoJS.enc.Utf8);
    }
    , decrypt : function(encrypted){
        return CryptoJS.AES.decrypt(encrypted, "referral");
    }
    , hasLocalStorage:function () { //checks to see if user has HTML5 local storage
        if(typeof(Storage) !== "undefined")
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    , parallax : function(){
        var $window = jQuery(window);
        jQuery(window).scroll(function() {
            console.log($window.scrollTop());
            if($window.scrollTop() >= 100 && jQuery(".logo.scrolled").length < 1){
                jQuery(".logo, #toast, #toast_persist").addClass("scrolled");
            }
            else if($window.scrollTop() < 100) {
                jQuery(".logo, #toast, #toast_persist").removeClass("scrolled");
                jQuery("").removeClass("scrolled");
            }
        });
    }
}
var kickstarter = {
    kickstartLink : 'https://www.kickstarter.com/projects/1959011117/1362663345?token=4537dfb0'
    , init : function(){
        this.initFacebook();
        this.initTwitter();
        this.initKickstarter();
    }
    , initFacebook : function(){
        jQuery("#cj_facebook").attr("data-href", this.kickstartLink)
        window.fbAsyncInit = function() {
            FB.init({
                appId : '775277609206360',
                xfbml : true,
                version : 'v2.1'
            });
        };
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        console.log(jQuery(".pluginButtonLabel").length);
        if(jQuery(".pluginButtonLabel").length > 0)
        {
            kickstarter.deferFBClickEvent();
        }
        else
        {
            window.setTimeout(kickstarter.deferFBClickEvent, 5000);
        }
    }
    , deferFBClickEvent : function(){
        console.log(jQuery(".pluginButtonLabel").length);
        jQuery(".circle-inner.facebook").click(function(){
            console.log("click");
            jQuery(".pluginButtonLabel").click();
        });
    }
    , initTwitter : function(){
        var twitterString = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+this.kickstartLink+'" data-count="none" data-text="Candy Jar, a Kickstarter project to create the best place to discover and buy candy online" data-size="large">Tweet</a>';
        var twitterScript = "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";
        jQuery("#cj_twitter").append(twitterString);
        jQuery("#cj_twitter").append(twitterScript);
    }
    , initKickstarter : function(){
        jQuery("#cj_kickstarter a").attr("href", this.kickstartLink);
    }
}