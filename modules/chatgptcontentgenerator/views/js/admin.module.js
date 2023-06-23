/**
* 2007-2023 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author    PrestaShop SA <contact@prestashop.com>
*  @copyright 2007-2023 PrestaShop SA
*  @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*
* Don't forget to prefix your containers with your own identifier
* to avoid any conflicts with others containers.
*/

var ChatGptModule = (function() {
    function ChatGptModule (options) {
        var settings = Object.assign({}, {
            endPoint: false,
            version: '1.0.0',
        }, options);

        this.getSettings = function () {
            return Object.assign({}, settings);
        }
    }

    ChatGptModule.prototype.associateShop = function(callback) {
        var data = new FormData();
        data.append('ajax', '1');
        data.append('action', 'associateShop');

        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.getSettings().endPoint);
        xhr.send(data);

        var self = this;

        xhr.onload = function () {
            if (typeof callback == 'function') {
                callback(self, xhr);
            }
            if (xhr.status != 200) {
                window.showErrorMessage(xhr.responseText);
                return;
            }
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.success == false) {
                    window.showErrorMessage(response.error.message);
                }
            } catch (e) {
                window.showErrorMessage('Unknown response');
                return;
            }
        }
    };

    ChatGptModule.prototype.getShopInfo = function(callback) {
        var data = new FormData();
        data.append('ajax', '1');
        data.append('action', 'getShopInfo');

        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.getSettings().endPoint);
        xhr.send(data);

        var self = this;

        xhr.onload = function () {
            if (typeof callback == 'function') {
                callback(self, xhr);
            }
        }
    };

    /**
     *
     * @param string status
     *      installed - Module installed on the site
     *      associated - Module associated to the prestashop account
     *      data_shared - Consent to the Data Sharing
     *      subscribed - Subscription was created
     */
    ChatGptModule.prototype.setModuleStatus = function(status, callback) {
        console.log('setModuleStatus', status);
        var data = new FormData();
        data.append('ajax', '1');
        data.append('action', 'setModuleStatus');
        data.append('status', status);
        data.append('version', this.getSettings().version);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.getSettings().endPoint);
        xhr.send(data);

        var self = this;

        xhr.onload = function () {
            if (typeof callback == 'function') {
                callback(self, xhr);
            }
        }
    };

    ChatGptModule.prototype.displaySubscriptionUsage = function(element, callback) {
        if (!!element == false) {
            return;
        }

        this.getShopInfo(function (instance, xhr) {
            if (typeof callback == 'function') {
                callback(instance, xhr);
            }
            if (xhr.status != 200) {
                window.showErrorMessage(xhr.responseText);
                return;
            }
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.success == false) {
                    window.showErrorMessage(response.error.message);
                    return;
                }
                if (!!response.shop == false || response.shop.subscription == false || response.shop.subscription.plan == false) {
                    element.innerHTML = '<td class="list-empty" colspan="7">' +
                                '<div class="list-empty-msg">' +
                                    '<i class="icon-warning-sign list-empty-icon"></i>' + noRecordsText
                                '</div>' +
                            '</td>';
                    return;
                }
                var subscription = response.shop.subscription;
                var plan = response.shop.subscription.plan;
                element.innerHTML = '<tr class=" odd">' +
                    '<td class=" column-name">' + plan.name + '</td>' +
                    '<td class=" column-productwords text-center">' + (plan.productWords ? subscription.productWords + '/' + plan.productWords : 'N/A') + '</td>' +
                    '<td class=" column-categorywords text-center">' + (plan.categoryWords ? subscription.categoryWords + '/' + plan.categoryWords : 'N/A') + '</td>' +
                    '<td class=" column-pagewords text-center">' + (plan.pageWords ? subscription.pageWords + '/' + plan.pageWords : 'N/A') + '</td>' +
                    '<td class=" column-customrequest text-center"><span class="list-action-enable ' + (plan.customRequest ? 'action-enabled' : ' action-disabled') + '">' + (plan.customRequest ? '<i class="icon-check"></i>' : '<i class="icon-remove"></i>') + '</span></td>' +
                    // '<td class=" column-trialdays text-center">' + (plan.trialDays ? subscription.trialDays + '/' + plan.trialDays : 'N/A') + '</td>' +
                '</tr>';
            } catch (e) {
            }
        });
    };

    ChatGptModule.renderFormErrorReport = function (host, requestData, buttonName) {
        var formId = 'error-form-' + (new Date()).getTime();
        var output = '<form id="' + formId + '" action="' + host + '/module/report" method="post" target="_blank" style="display: inline-block;">';
        for (var i = 0; i < requestData.length; i++) {
            output += '<input type="hidden" name="' + requestData[i].name + '" value="' + requestData[i].value + '"/>';
        }
        output += '<a href="#" onclick="document.getElementById(\'' + formId + '\').submit(); return false;">' + buttonName + '</a>';
        return output + '</form>';
    }

    return ChatGptModule;
})();
