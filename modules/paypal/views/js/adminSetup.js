/*! For license information please see adminSetup.js.LICENSE.txt */
(()=>{"use strict";var t,n,e={1469:(t,n,e)=>{e.d(n,{OS:()=>a,ao:()=>o});var a=function(t){$(".defaultForm").removeClass("pp-settings-link-on"),$(".page-head-tabs a").removeClass("pp-settings-link-on pp__border-b-primary"),t.addClass("pp-settings-link-on"),$("html, body").animate({scrollTop:t.offset().top-200+"px"},900)},o=function(){var t=document.querySelectorAll(".page-head-tabs a"),n=$(".page-head-tabs a.current");t.forEach((function(t){var e=$(t).attr("href").includes("AdminPayPalCustomizeCheckout"),a=$(t).attr("href").includes("AdminPayPalSetup");(n.attr("href").includes("AdminPayPalCustomizeCheckout")&&a||n.attr("href").includes("AdminPayPalSetup")&&e)&&$(t).addClass("pp-settings-link-on pp__border-b-primary")})),$("html, body").animate({scrollTop:$(".page-head-tabs").offset().top-200+"px"},900)}}},a={};function o(t){var n=a[t];if(void 0!==n)return n.exports;var r=a[t]={exports:{}};return e[t](r,r.exports,o),r.exports}o.d=(t,n)=>{for(var e in n)o.o(n,e)&&!o.o(t,e)&&Object.defineProperty(t,e,{enumerable:!0,get:n[e]})},o.o=(t,n)=>Object.prototype.hasOwnProperty.call(t,n),t=o(1469),n={init:function(){$("#logoutAccount").on("click",(function(t){n.logoutAccount()})),$("#confirmCredentials").click((function(t){$(t.currentTarget).closest("form").submit()})),$(document).on("click","#btn-check-requirements",(function(){n.checkRequirements()})),$("[data-pp-link-settings]").on("click",(function(n){n.preventDefault();var e=$(n.target.attributes.href.value);e.length?(0,t.OS)(e):(0,t.ao)()})),$(".defaultForm").on("mouseleave",(function(t){$(t.currentTarget).removeClass("pp-settings-link-on")})),$(".ps-checkout-info").on("click",(function(t){var e=t.target.getAttribute("data-action");n.psCheckoutHandleAction(e)})),$(document).on("contextmenu","[data-paypal-button]",(function(t){t.preventDefault()})),window.onboardCallback=function(t,n){$.ajax({url:controllerUrl,type:"POST",data:{ajax:!0,action:"handleOnboardingResponse",authCode:t,sharedId:n},success:function(t){}})},$("[data-update-rounding-settings]").on("click",(function(t){n.updateRoundingSettings(t)})),$("[data-show-rounding-alert]").on("click",(function(t){var n=$("[data-rounding-alert]");n.removeClass("hidden");var e=n.offset().top-$(".page-head").height()-45;$("html, body").animate({scrollTop:e},500)}))},logoutAccount:function(){$.ajax({url:controllerUrl,type:"POST",data:{ajax:!0,action:"logOutAccount"},success:function(t){t.status&&(document.location=t.redirectUrl)}})},checkRequirements:function(){$.ajax({url:controllerUrl,type:"POST",data:{ajax:!0,action:"CheckCredentials"},success:function(t){$("#btn-check-requirements").closest(".status-block-container").html(t)}})},psCheckoutHandleAction:function(t){null!=t&&$.ajax({url:controllerUrl,type:"POST",data:{ajax:!0,action:"HandlePsCheckoutAction",actionHandled:t},success:function(t){t.redirect&&window.open(t.url,"_blank")}})},updateRoundingSettings:function(t){$.ajax({url:controllerUrl,type:"POST",data:{ajax:!0,action:"UpdateRoundingSettings"},success:function(n){var e=$(t.currentTarget).closest("[data-rounding-alert]");e.length>0&&(e.removeClass("alert-warning").addClass("alert-success"),e.html(n),setTimeout((function(){return e.remove()}),5e3))}})}},window.addEventListener("load",(function(){return n.init()})),$(window).on("load",(function(){return $("[data-paypal-button]").removeClass("spinner-button")}))})();
//# sourceMappingURL=adminSetup.js.map