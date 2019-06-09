﻿
var isProVersion = false;

function onResize() {
    try {
        /* 
         *  I couldn't fix the width of the new track list for Edge (Works fine in Chrome but not in Edge),
         *  so I use a javascript workaround for that.
         */
        var contentDiv = document.querySelectorAll(".main-view-container__content");
        if (contentDiv.length === 0) {
            contentDiv = document.querySelectorAll(".main-view-container__scroll-node");
        }

        // 230px is added because it's added in css as well, for acrylic behind artist page.
        contentDiv[0].style.width = 230 + (window.innerWidth - document.querySelectorAll(".Root__nav-bar")[0].offsetWidth) + "px";


        var adContainerDiv = document.querySelectorAll(".AdsContainer");
        if (adContainerDiv.length > 0)
            adContainerDiv[0].style.width = (window.innerWidth - document.querySelectorAll(".Root__nav-bar")[0].offsetWidth) + "px";
    }
    catch (ex) {
        console.log("resize event failed");
    }
}

function canGoBack() {
    return window.location.hash !== "#xpotifyInitialPage";
}

function goBack() {
    if (canGoBack()) {
        window.history.go(-1);
    }
}

function injectBackButton(backButtonDiv) {
    var navbarHeader = document.getElementsByClassName('navBar-header');
    if (navbarHeader.length === 0) {
        setTimeout(function () {
            injectBackButton(backButtonDiv);
        }, 500);
    } else {
        navbarHeader[0].prepend(backButtonDiv);
    }
}

function injectNavbarDownButton(button) {
    var navbar = document.querySelectorAll(".NavBarFooter");
    var sessionInfo = document.querySelectorAll(".sessionInfo");
    if (navbar.length === 0 || sessionInfo.length === 0) {
        setTimeout(function () {
            injectNavbarDownButton(button);
        }, 500);
    } else {
        navbar[0].insertBefore(button, sessionInfo[0]);
    }
}

function injectNowPlayingRightButton(button) {
    var extraControlsBar = document.querySelectorAll('.Root__now-playing-bar .now-playing-bar__right__inner .ExtraControls');
    if (extraControlsBar.length === 0) {
        setTimeout(function () {
            injectNowPlayingRightButton(button);
        }, 500);
    } else {
        extraControlsBar[0].prepend(button);
    }
}

function addXpotifyClassToBackground(retryCount) {
    if (retryCount < 0)
        return;

    var rootElement = document.querySelectorAll(".Root__top-container");
    if (rootElement.length === 0) {
        setTimeout(function () {
            addXpotifyClassToBackground(retryCount - 1);
        }, 250);
    } else if (rootElement[0].previousSibling.style.backgroundImage === "") {
        setTimeout(function () {
            addXpotifyClassToBackground(retryCount - 1);
        }, 250);
    } else {
        rootElement[0].previousSibling.classList.add('xpotifyBackground');
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function getPwaUri(uri) {
    if (uri === undefined || uri.trim() === "") {
        return "";
    }

    uri = uri.replace('http://', 'https://');
    var uriLowerCase = uri.toLowerCase();

    if (uriLowerCase.startsWith("https://open.spotify.com"))
        return uri;

    if (uriLowerCase.startsWith("spotify:")) {
        if (uriLowerCase.indexOf("spotify:artist:") >= 0) {
            idx = uriLowerCase.indexOf("spotify:artist:") + "spotify:artist:".length;
            return "https://open.spotify.com/artist/" + uri.substring(idx);
        }
        else if (uriLowerCase.indexOf("spotify:album:") >= 0) {
            idx = uriLowerCase.indexOf("spotify:album:") + "spotify:album:".length;
            return "https://open.spotify.com/album/" + uri.substring(idx);
        }
        else if (uriLowerCase.indexOf("spotify:playlist:") >= 0) {
            idx = uriLowerCase.indexOf("spotify:playlist:") + "spotify:playlist:".length;
            return "https://open.spotify.com/playlist/" + uri.substring(idx);
        }
        else if (uriLowerCase.indexOf("spotify:track:") >= 0) {
            idx = uriLowerCase.indexOf("spotify:track:") + "spotify:track:".length;
            return "https://open.spotify.com/track/" + uri.substring(idx);
        }
    }

    return "";
}

function setNowPlayingBarColor(url, lightTheme) {
    try {
        var img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.setAttribute('src', url);

        img.addEventListener('load', function () {
            try {
                var vibrant = new Vibrant(img);
                var swatches = vibrant.swatches();

                var opacity = 0.25;
                var rgb = swatches.Muted.getRgb();
                if (swatches.Muted.getPopulation() < swatches.Vibrant.getPopulation()) {
                    rgb = swatches.Vibrant.getRgb();
                }

                if (lightTheme) {
                    rgb[0] = 255 - rgb[0];
                    rgb[1] = 255 - rgb[1];
                    rgb[2] = 255 - rgb[2];

                    opacity = 0.3;
                }

                document.querySelectorAll(".Root__now-playing-bar .now-playing-bar")[0].style.backgroundColor = "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " + opacity + ")";
            }
            catch (ex2) {
                console.log("setNowPlayingBarColor failed (2)");
                console.log(e2);
            }
        });
    }
    catch (ex) {
        console.log("setNowPlayingBarColor failed (1)");
        console.log(ex);
    }
}

function drop(event) {
    var data = event.dataTransfer.getData("Text");
    var uri = getPwaUri(data);

    if (uri === undefined || uri.length === 0) {
        return;
    }

    event.preventDefault();

    // Navigate to page
    history.pushState({}, null, uri);
    history.pushState({}, null, uri + "#navigatingToPagePleaseIgnore");
    history.back();
}

errors = "";

// Mark page as injected
var body = document.getElementsByTagName('body')[0];
body.setAttribute('data-scriptinjection', 1);
body.ondrop = drop;
body.ondragover = allowDrop;

// Inject css
try {
    var css = '{{CSSBASE64CONTENT}}';
    var style = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(atob(css)));
}
catch (ex) {
    errors += "injectCssFailed,";
}

// Inject page title
try {
    var titleDiv = document.createElement('div');
    titleDiv.classList.add("xpotifyWindowTitle");
    titleDiv.innerText = isProVersion ? "Xpotify Pro" : "Xpotify";
    body.appendChild(titleDiv);
}
catch (ex) {
    errors += "injectTitleFailed,";
}

// Inject page overlay
try {
    var overlayDiv = document.createElement('div');
    overlayDiv.classList.add("whole-page-overlay");
    body.appendChild(overlayDiv);
}
catch (ex) {
    errors += "injectOverlayFailed,";
}

// Inject back button
try {
    var backButtonDiv = document.createElement('div');
    backButtonDiv.classList.add("backButtonContainer");
    backButtonDiv.classList.add("backButtonContainer-disabled");
    backButtonDiv.innerHTML = "<a class='backbutton'><span>&#xE72B;</span></a>";
    backButtonDiv.onclick = goBack;
    injectBackButton(backButtonDiv);
}
catch (ex) {
    errors += "injectBackFailed,";
}

// Inject navbar buttons
try {
    var pinToStartButton = document.createElement('div');
    pinToStartButton.innerHTML = '<div class="navBar-item navBar-item--with-icon-left NavBar__xpotifypintostart-item"><a class="link-subtle navBar-link ellipsis-one-line" href="#xpotifypintostart">'
        + '<div class="navBar-link-text-with-icon-wrapper"><div class="icon segoe-icon NavBar__icon"><span style="font-family:Segoe MDL2 Assets;">&#xE718;</span></div>'
        + '<span class="navbar-link__text">Pin this page to Start</span></div></a></div>';
    var settingsButton = document.createElement('div');
    settingsButton.innerHTML = '<div class="navBar-item navBar-item--with-icon-left NavBar__xpotifysettings-item"><a class="link-subtle navBar-link ellipsis-one-line" href="#xpotifysettings">'
        + '<div class="navBar-link-text-with-icon-wrapper"><div class="icon segoe-icon NavBar__icon"><span style="font-family:Segoe MDL2 Assets;">&#xE115;</span></div>'
        + '<span class="navbar-link__text">Settings</span></div></a></div>';
    var aboutButton = document.createElement('div');
    aboutButton.innerHTML = '<div class="navBar-item navBar-item--with-icon-left NavBar__xpotifysettings-item"><a class="link-subtle navBar-link ellipsis-one-line" href="#xpotifyabout">'
        + '<div class="navBar-link-text-with-icon-wrapper"><div class="icon segoe-icon NavBar__icon"><span style="font-family:Segoe MDL2 Assets;">&#xE946;</span></div>'
        + '<span class="navbar-link__text">About</span></div></a></div>';
    var donateButton = document.createElement('div');
    donateButton.innerHTML = '<div class="navBar-item navBar-item--with-icon-left NavBar__xpotifysettings-item"><a class="link-subtle navBar-link ellipsis-one-line" href="#xpotifydonate">'
        + '<div class="navBar-link-text-with-icon-wrapper"><div class="icon segoe-icon NavBar__icon"><span style="font-family:Segoe MDL2 Assets;">&#xE719;</span></div>'
        + '<span class="navbar-link__text">Donate</span></div></a></div>';
    injectNavbarDownButton(pinToStartButton);
    injectNavbarDownButton(settingsButton);
    //injectNavbarDownButton(aboutButton);
    if (!isProVersion)
        injectNavbarDownButton(donateButton);
}
catch (ex) {
    errors += "injectNavBarFooterFailed,";
}

// Inject compact overlay button to now playing
try {
    var compactOverlayButton = document.createElement('div');
    compactOverlayButton.className = "CompactOverlayButton";
    compactOverlayButton.innerHTML = '<a style="border-bottom: 0px;" href="#xpotifycompactoverlay"><button title="Mini view" class="control-button">'
        + '<div style="font-family: Segoe MDL2 Assets; position:relative; cursor: default;">'
        + '<div style="left: 6px; top: -3px; font-size: 19px; position: absolute;">&#xE7FB;</div>'
        + '<div style="left: 12px; top: -6px; font-size: 9px; position: absolute;">&#xEB9F;</div>'
        + '</div></button></a>';
    injectNowPlayingRightButton(compactOverlayButton);
}
catch (ex) {
    errors += "injectCompactOverlayFailed,";
}

// Find and add necessary class to background div
try {
    setTimeout(function () {
        addXpotifyClassToBackground(12);
    }, 250);

    // Sometimes the PWA changes the background element on loading, causing the 
    // background class to be removed. We'll do this again after a few seconds 
    // to make sure that does not happen.
    setTimeout(function () {
        addXpotifyClassToBackground(0);
    }, 4000);
}
catch (ex) {
    errors += "findBackgroundDivFailed,";
}


// Check and set now playing bar background color when now playing album art changes
try {

    // Begin Vibrant.min.js
    (function e$$0(x,z,l){function h(p,b){if(!z[p]){if(!x[p]){var a="function"==typeof require&&require;if(!b&&a)return a(p,!0);if(g)return g(p,!0);a=Error("Cannot find module '"+p+"'");throw a.code="MODULE_NOT_FOUND",a;}a=z[p]={exports:{}};x[p][0].call(a.exports,function(a){var b=x[p][1][a];return h(b?b:a)},a,a.exports,e$$0,x,z,l)}return z[p].exports}for(var g="function"==typeof require&&require,w=0;w<l.length;w++)h(l[w]);return h})({1:[function(A,x,z){if(!l)var l={map:function(h,g){var l={};return g?
    h.map(function(h,b){l.index=b;return g.call(l,h)}):h.slice()},naturalOrder:function(h,g){return h<g?-1:h>g?1:0},sum:function(h,g){var l={};return h.reduce(g?function(h,b,a){l.index=a;return h+g.call(l,b)}:function(h,b){return h+b},0)},max:function(h,g){return Math.max.apply(null,g?l.map(h,g):h)}};A=function(){function h(f,c,a){return(f<<2*d)+(c<<d)+a}function g(f){function c(){a.sort(f);b=!0}var a=[],b=!1;return{push:function(c){a.push(c);b=!1},peek:function(f){b||c();void 0===f&&(f=a.length-1);return a[f]},
    pop:function(){b||c();return a.pop()},size:function(){return a.length},map:function(c){return a.map(c)},debug:function(){b||c();return a}}}function w(f,c,a,b,m,e,q){this.r1=f;this.r2=c;this.g1=a;this.g2=b;this.b1=m;this.b2=e;this.histo=q}function p(){this.vboxes=new g(function(f,c){return l.naturalOrder(f.vbox.count()*f.vbox.volume(),c.vbox.count()*c.vbox.volume())})}function b(f){var c=Array(1<<3*d),a,b,m,r;f.forEach(function(f){b=f[0]>>e;m=f[1]>>e;r=f[2]>>e;a=h(b,m,r);c[a]=(c[a]||0)+1});return c}
    function a(f,c){var a=1E6,b=0,m=1E6,d=0,q=1E6,n=0,h,k,l;f.forEach(function(c){h=c[0]>>e;k=c[1]>>e;l=c[2]>>e;h<a?a=h:h>b&&(b=h);k<m?m=k:k>d&&(d=k);l<q?q=l:l>n&&(n=l)});return new w(a,b,m,d,q,n,c)}function n(a,c){function b(a){var f=a+"1";a+="2";var v,d,m,e;d=0;for(k=c[f];k<=c[a];k++)if(y[k]>n/2){m=c.copy();e=c.copy();v=k-c[f];d=c[a]-k;for(v=v<=d?Math.min(c[a]-1,~~(k+d/2)):Math.max(c[f],~~(k-1-v/2));!y[v];)v++;for(d=s[v];!d&&y[v-1];)d=s[--v];m[a]=v;e[f]=m[a]+1;return[m,e]}}if(c.count()){var d=c.r2-
    c.r1+1,m=c.g2-c.g1+1,e=l.max([d,m,c.b2-c.b1+1]);if(1==c.count())return[c.copy()];var n=0,y=[],s=[],k,g,t,u,p;if(e==d)for(k=c.r1;k<=c.r2;k++){u=0;for(g=c.g1;g<=c.g2;g++)for(t=c.b1;t<=c.b2;t++)p=h(k,g,t),u+=a[p]||0;n+=u;y[k]=n}else if(e==m)for(k=c.g1;k<=c.g2;k++){u=0;for(g=c.r1;g<=c.r2;g++)for(t=c.b1;t<=c.b2;t++)p=h(g,k,t),u+=a[p]||0;n+=u;y[k]=n}else for(k=c.b1;k<=c.b2;k++){u=0;for(g=c.r1;g<=c.r2;g++)for(t=c.g1;t<=c.g2;t++)p=h(g,t,k),u+=a[p]||0;n+=u;y[k]=n}y.forEach(function(a,c){s[c]=n-a});return e==
    d?b("r"):e==m?b("g"):b("b")}}var d=5,e=8-d;w.prototype={volume:function(a){if(!this._volume||a)this._volume=(this.r2-this.r1+1)*(this.g2-this.g1+1)*(this.b2-this.b1+1);return this._volume},count:function(a){var c=this.histo;if(!this._count_set||a){a=0;var b,d,n;for(b=this.r1;b<=this.r2;b++)for(d=this.g1;d<=this.g2;d++)for(n=this.b1;n<=this.b2;n++)index=h(b,d,n),a+=c[index]||0;this._count=a;this._count_set=!0}return this._count},copy:function(){return new w(this.r1,this.r2,this.g1,this.g2,this.b1,
    this.b2,this.histo)},avg:function(a){var c=this.histo;if(!this._avg||a){a=0;var b=1<<8-d,n=0,e=0,g=0,q,l,s,k;for(l=this.r1;l<=this.r2;l++)for(s=this.g1;s<=this.g2;s++)for(k=this.b1;k<=this.b2;k++)q=h(l,s,k),q=c[q]||0,a+=q,n+=q*(l+0.5)*b,e+=q*(s+0.5)*b,g+=q*(k+0.5)*b;this._avg=a?[~~(n/a),~~(e/a),~~(g/a)]:[~~(b*(this.r1+this.r2+1)/2),~~(b*(this.g1+this.g2+1)/2),~~(b*(this.b1+this.b2+1)/2)]}return this._avg},contains:function(a){var c=a[0]>>e;gval=a[1]>>e;bval=a[2]>>e;return c>=this.r1&&c<=this.r2&&
    gval>=this.g1&&gval<=this.g2&&bval>=this.b1&&bval<=this.b2}};p.prototype={push:function(a){this.vboxes.push({vbox:a,color:a.avg()})},palette:function(){return this.vboxes.map(function(a){return a.color})},size:function(){return this.vboxes.size()},map:function(a){for(var c=this.vboxes,b=0;b<c.size();b++)if(c.peek(b).vbox.contains(a))return c.peek(b).color;return this.nearest(a)},nearest:function(a){for(var c=this.vboxes,b,n,d,e=0;e<c.size();e++)if(n=Math.sqrt(Math.pow(a[0]-c.peek(e).color[0],2)+Math.pow(a[1]-
    c.peek(e).color[1],2)+Math.pow(a[2]-c.peek(e).color[2],2)),n<b||void 0===b)b=n,d=c.peek(e).color;return d},forcebw:function(){var a=this.vboxes;a.sort(function(a,b){return l.naturalOrder(l.sum(a.color),l.sum(b.color))});var b=a[0].color;5>b[0]&&5>b[1]&&5>b[2]&&(a[0].color=[0,0,0]);var b=a.length-1,n=a[b].color;251<n[0]&&251<n[1]&&251<n[2]&&(a[b].color=[255,255,255])}};return{quantize:function(d,c){function e(a,b){for(var c=1,d=0,f;1E3>d;)if(f=a.pop(),f.count()){var m=n(h,f);f=m[0];m=m[1];if(!f)break;
    a.push(f);m&&(a.push(m),c++);if(c>=b)break;if(1E3<d++)break}else a.push(f),d++}if(!d.length||2>c||256<c)return!1;var h=b(d),m=0;h.forEach(function(){m++});var r=a(d,h),q=new g(function(a,b){return l.naturalOrder(a.count(),b.count())});q.push(r);e(q,0.75*c);for(r=new g(function(a,b){return l.naturalOrder(a.count()*a.volume(),b.count()*b.volume())});q.size();)r.push(q.pop());e(r,c-r.size());for(q=new p;r.size();)q.push(r.pop());return q}}}();x.exports=A.quantize},{}],2:[function(A,x,z){(function(){var l,
    h,g,w=function(b,a){return function(){return b.apply(a,arguments)}},p=[].slice;window.Swatch=h=function(){function b(a,b){this.rgb=a;this.population=b}b.prototype.hsl=void 0;b.prototype.rgb=void 0;b.prototype.population=1;b.yiq=0;b.prototype.getHsl=function(){return this.hsl?this.hsl:this.hsl=g.rgbToHsl(this.rgb[0],this.rgb[1],this.rgb[2])};b.prototype.getPopulation=function(){return this.population};b.prototype.getRgb=function(){return this.rgb};b.prototype.getHex=function(){return"#"+(16777216+
    (this.rgb[0]<<16)+(this.rgb[1]<<8)+this.rgb[2]).toString(16).slice(1,7)};b.prototype.getTitleTextColor=function(){this._ensureTextColors();return 200>this.yiq?"#fff":"#000"};b.prototype.getBodyTextColor=function(){this._ensureTextColors();return 150>this.yiq?"#fff":"#000"};b.prototype._ensureTextColors=function(){if(!this.yiq)return this.yiq=(299*this.rgb[0]+587*this.rgb[1]+114*this.rgb[2])/1E3};return b}();window.Vibrant=g=function(){function b(a,b,d){this.swatches=w(this.swatches,this);var e,f,
    c,g,p,m,r,q;"undefined"===typeof b&&(b=64);"undefined"===typeof d&&(d=5);p=new l(a);r=p.getImageData().data;m=p.getPixelCount();a=[];for(g=0;g<m;)e=4*g,q=r[e+0],c=r[e+1],f=r[e+2],e=r[e+3],125<=e&&(250<q&&250<c&&250<f||a.push([q,c,f])),g+=d;this._swatches=this.quantize(a,b).vboxes.map(function(a){return function(a){return new h(a.color,a.vbox.count())}}(this));this.maxPopulation=this.findMaxPopulation;this.generateVarationColors();this.generateEmptySwatches();p.removeCanvas()}b.prototype.quantize=
    A("quantize");b.prototype._swatches=[];b.prototype.TARGET_DARK_LUMA=0.26;b.prototype.MAX_DARK_LUMA=0.45;b.prototype.MIN_LIGHT_LUMA=0.55;b.prototype.TARGET_LIGHT_LUMA=0.74;b.prototype.MIN_NORMAL_LUMA=0.3;b.prototype.TARGET_NORMAL_LUMA=0.5;b.prototype.MAX_NORMAL_LUMA=0.7;b.prototype.TARGET_MUTED_SATURATION=0.3;b.prototype.MAX_MUTED_SATURATION=0.4;b.prototype.TARGET_VIBRANT_SATURATION=1;b.prototype.MIN_VIBRANT_SATURATION=0.35;b.prototype.WEIGHT_SATURATION=3;b.prototype.WEIGHT_LUMA=6;b.prototype.WEIGHT_POPULATION=
    1;b.prototype.VibrantSwatch=void 0;b.prototype.MutedSwatch=void 0;b.prototype.DarkVibrantSwatch=void 0;b.prototype.DarkMutedSwatch=void 0;b.prototype.LightVibrantSwatch=void 0;b.prototype.LightMutedSwatch=void 0;b.prototype.HighestPopulation=0;b.prototype.generateVarationColors=function(){this.VibrantSwatch=this.findColorVariation(this.TARGET_NORMAL_LUMA,this.MIN_NORMAL_LUMA,this.MAX_NORMAL_LUMA,this.TARGET_VIBRANT_SATURATION,this.MIN_VIBRANT_SATURATION,1);this.LightVibrantSwatch=this.findColorVariation(this.TARGET_LIGHT_LUMA,
    this.MIN_LIGHT_LUMA,1,this.TARGET_VIBRANT_SATURATION,this.MIN_VIBRANT_SATURATION,1);this.DarkVibrantSwatch=this.findColorVariation(this.TARGET_DARK_LUMA,0,this.MAX_DARK_LUMA,this.TARGET_VIBRANT_SATURATION,this.MIN_VIBRANT_SATURATION,1);this.MutedSwatch=this.findColorVariation(this.TARGET_NORMAL_LUMA,this.MIN_NORMAL_LUMA,this.MAX_NORMAL_LUMA,this.TARGET_MUTED_SATURATION,0,this.MAX_MUTED_SATURATION);this.LightMutedSwatch=this.findColorVariation(this.TARGET_LIGHT_LUMA,this.MIN_LIGHT_LUMA,1,this.TARGET_MUTED_SATURATION,
    0,this.MAX_MUTED_SATURATION);return this.DarkMutedSwatch=this.findColorVariation(this.TARGET_DARK_LUMA,0,this.MAX_DARK_LUMA,this.TARGET_MUTED_SATURATION,0,this.MAX_MUTED_SATURATION)};b.prototype.generateEmptySwatches=function(){var a;void 0===this.VibrantSwatch&&void 0!==this.DarkVibrantSwatch&&(a=this.DarkVibrantSwatch.getHsl(),a[2]=this.TARGET_NORMAL_LUMA,this.VibrantSwatch=new h(b.hslToRgb(a[0],a[1],a[2]),0));if(void 0===this.DarkVibrantSwatch&&void 0!==this.VibrantSwatch)return a=this.VibrantSwatch.getHsl(),
    a[2]=this.TARGET_DARK_LUMA,this.DarkVibrantSwatch=new h(b.hslToRgb(a[0],a[1],a[2]),0)};b.prototype.findMaxPopulation=function(){var a,b,d,e,f;d=0;e=this._swatches;a=0;for(b=e.length;a<b;a++)f=e[a],d=Math.max(d,f.getPopulation());return d};b.prototype.findColorVariation=function(a,b,d,e,f,c){var g,h,m,l,q,p,s,k;l=void 0;q=0;p=this._swatches;g=0;for(h=p.length;g<h;g++)if(k=p[g],s=k.getHsl()[1],m=k.getHsl()[2],s>=f&&s<=c&&m>=b&&m<=d&&!this.isAlreadySelected(k)&&(m=this.createComparisonValue(s,e,m,a,
    k.getPopulation(),this.HighestPopulation),void 0===l||m>q))l=k,q=m;return l};b.prototype.createComparisonValue=function(a,b,d,e,f,c){return this.weightedMean(this.invertDiff(a,b),this.WEIGHT_SATURATION,this.invertDiff(d,e),this.WEIGHT_LUMA,f/c,this.WEIGHT_POPULATION)};b.prototype.invertDiff=function(a,b){return 1-Math.abs(a-b)};b.prototype.weightedMean=function(){var a,b,d,e,f,c;f=1<=arguments.length?p.call(arguments,0):[];for(a=d=b=0;a<f.length;)e=f[a],c=f[a+1],b+=e*c,d+=c,a+=2;return b/d};b.prototype.swatches=
    function(){return{Vibrant:this.VibrantSwatch,Muted:this.MutedSwatch,DarkVibrant:this.DarkVibrantSwatch,DarkMuted:this.DarkMutedSwatch,LightVibrant:this.LightVibrantSwatch,LightMuted:this.LightMuted}};b.prototype.isAlreadySelected=function(a){return this.VibrantSwatch===a||this.DarkVibrantSwatch===a||this.LightVibrantSwatch===a||this.MutedSwatch===a||this.DarkMutedSwatch===a||this.LightMutedSwatch===a};b.rgbToHsl=function(a,b,d){var e,f,c,g,h;a/=255;b/=255;d/=255;g=Math.max(a,b,d);h=Math.min(a,b,d);
    f=void 0;c=(g+h)/2;if(g===h)f=h=0;else{e=g-h;h=0.5<c?e/(2-g-h):e/(g+h);switch(g){case a:f=(b-d)/e+(b<d?6:0);break;case b:f=(d-a)/e+2;break;case d:f=(a-b)/e+4}f/=6}return[f,h,c]};b.hslToRgb=function(a,b,d){var e,f,c;e=f=c=void 0;e=function(a,b,c){0>c&&(c+=1);1<c&&(c-=1);return c<1/6?a+6*(b-a)*c:0.5>c?b:c<2/3?a+(b-a)*(2/3-c)*6:a};0===b?c=f=e=d:(b=0.5>d?d*(1+b):d+b-d*b,d=2*d-b,c=e(d,b,a+1/3),f=e(d,b,a),e=e(d,b,a-1/3));return[255*c,255*f,255*e]};return b}();window.CanvasImage=l=function(){function b(a){this.canvas=
    document.createElement("canvas");this.context=this.canvas.getContext("2d");document.body.appendChild(this.canvas);this.width=this.canvas.width=a.width;this.height=this.canvas.height=a.height;this.context.drawImage(a,0,0,this.width,this.height)}b.prototype.clear=function(){return this.context.clearRect(0,0,this.width,this.height)};b.prototype.update=function(a){return this.context.putImageData(a,0,0)};b.prototype.getPixelCount=function(){return this.width*this.height};b.prototype.getImageData=function(){return this.context.getImageData(0,
    0,this.width,this.height)};b.prototype.removeCanvas=function(){return this.canvas.parentNode.removeChild(this.canvas)};return b}()}).call(this)},{quantize:1}]},{},[2]);
    // End Vibrant.min.js

    setInterval(function () {
        var url = document.querySelectorAll(".Root__now-playing-bar .now-playing .cover-art-image")[0].style.backgroundImage.slice(5, -2);
        var lightTheme = (document.getElementsByTagName('body')[0].getAttribute('data-scriptinjection-lighttheme') !== null);

        if (window.xpotifyNowPlayingIconUrl !== url || window.xpotifyNowPlayingLastSetLightTheme !== lightTheme) {
            window.xpotifyNowPlayingIconUrl = url;
            window.xpotifyNowPlayingLastSetLightTheme = lightTheme;

            setNowPlayingBarColor(url, lightTheme);
        }
    }, 1000);
} catch (ex) {
    errors += "nowPlayingBarColorPollInitFailed,";
}


setTimeout(function () {
    window.location.hash = "xpotifyInitialPage";

    setInterval(function () {
        if (canGoBack()) {
            backButtonDiv.classList.remove("backButtonContainer-disabled");
        } else {
            backButtonDiv.classList.add("backButtonContainer-disabled");
        }
    }, 500);
}, 1000);

window.addEventListener("resize", onResize, true);  
setInterval(onResize, 2000); // Sometimes an OnResize is necessary when users goes to a new page.

if (errors.length > 0)
    throw errors;
