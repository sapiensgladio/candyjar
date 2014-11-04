
jQuery(document).ready(function() {
    sharePage.init();
});

var sharePage = {
    DEV_ENV : true
    ,   cookie : null
    ,   email : ""
    ,   emailCipher : ""
    ,   refLink : ""
    ,   bitlyURL : ""
    ,   init : function(){
        if(this.DEV_ENV) console.log("init");
        if(utils.hasLocalStorage())
        {
            this.email= localStorage.getItem("email");
            this.emailCipher= localStorage.getItem("emailCipher");
            this.refLink= localStorage.getItem("refLink");
        }
        else
        {
            this.email= utils.getCookie("email");
            this.emailCipher= utils.getCookie("emailCipher");
            this.refLink= utils.getCookie("refLink");
        }


        bitlyAPI.shortenURL(encodeURIComponent(this.refLink));
        //console.log(bitlyAPI.lengthenURL(this.bitlyURL));

        if(this.DEV_ENV)
        {
            console.log(document.cookie);
            console.log(this.email);
            console.log(this.emailCipher);
            console.log(this.refLink);
        }

    }
    ,   bitlyURLs : function(){
        //callback in bitlyAPI obj
        jQuery(".fb-share-button").attr("data-href", this.bitlyURL);
        this.initFacebook();
        this.initTwitter(this.bitlyURL);
        this.initGooglePlus(this.bitlyURL);
        this.progressSlider();

        jQuery("#refLink").val(this.bitlyURL);
    }
    ,   fullURLs : function(){
        //legacy
        console.log(this.refLink);
        jQuery(".fb-share-button").attr("data-href", this.refLink);
        this.initFacebook();
        this.initTwitter(this.refLink);
        this.initGooglePlus(this.refLink);
        this.progressSlider();
        jQuery("#refLink").val(this.refLink);
    }
    ,   setWindowHash : function (){
        window.location.hash = 'varA=some_value;varB=some_value'
    }
    ,   initFacebook : function(){
        window.fbAsyncInit = function() {
            FB.init({
                appId      : '775277609206360',
                xfbml      : true,
                version    : 'v2.1'
            });
        };

        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }
    ,   initTwitter : function(link){
        var twitterString = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+link+'" data-count="none" data-text="help me earn candy!" data-size="large">Tweet</a>';
        var twitterScript = "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>";

        jQuery("#cj_twitter").append(twitterString);
        jQuery("#cj_twitter").append(twitterScript);
    }
    ,   initGooglePlus : function(link){
        var twitterString = '<div class="g-plus" data-action="share" data-href="'+link+'" data-annotation="none" data-height="24" ></div>';
        var twitterScript = '<script src="https://apis.google.com/js/platform.js" async defer></script>';

        jQuery("#cj_googleplus").append(twitterString);
        jQuery("#cj_googleplus").append(twitterScript);
    }
    ,   progressSlider : function() {
        //if no progress yet from API call
        //init slider that's interactive
        this.initjQuerySlider();
        //else init slider and set it to current level

       // bindClickEvents();
    }
    ,   initjQuerySlider : function(){

        jQuery("#slider_handle").slider({
            animate:"slow",
            steps:5,
            value:0,

        });
        jQuery("#blue").animate({'padding-left' : 1+'%'});
        jQuery(".ui-slider-handle").html("1");
    }
}

function bindClickEvents(){
    jQuery(".level").each(function () {
        jQuery(this).bind("click", function(){
            var step = jQuery(this).data("level-id");
            jQuery(".current").removeClass("current");
            jQuery(this).addClass("current");
            if(step > 1) goToStep((step-1));

        });
    });
}
function goToStep(numberReferrals){
    jQuery(".ui-slider-handle").animate({'left' : numberReferrals+'%'}).html(numberReferrals);
    jQuery("#blue").animate({'padding-left' : numberReferrals+'%'});

    jQuery(".current").removeClass("current");
    jQuery(".level-id-" + (numberReferrals+1)).addClass("current");
    //jQuery( "#slider_handle" ).slider( "option", "value", pos );
}