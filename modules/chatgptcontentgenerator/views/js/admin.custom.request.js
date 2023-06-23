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

var ChatGptCustomRequest = (function() {
    function ChatGptCustomRequest (options, callbackFunction) {
        var settings = Object.assign({}, {
        }, options);

        var callback = callbackFunction;
        var id = 'custom-request-' + (new Date).getTime();
        var wrapper = null;

        this.getId = function () {
            return id;
        }

        this.getCallback = function () {
            var emptyFunction = function () {};
            return typeof callback == 'function'
                ? callback
                : emptyFunction;
        }

        this.getSettings = function () {
            return Object.assign({}, settings);
        }

        this.setWrapper = function (element) {
            wrapper = element;
            return;
        }

        this.getWrapper = function (element) {
            return wrapper;
        }
    }

    ChatGptCustomRequest.prototype.getText = function() {
        return ChatGptCustomRequest.j('#input-' + this.getId()).val().trim();
    };

    ChatGptCustomRequest.j = $;

    ChatGptCustomRequest.prototype.setAction = function(actions) {
        var groupId = this.getId(),
            wrapper = ChatGptCustomRequest.j("#actions-list-" + groupId);

        if (!!actions && actions.length) {
            ChatGptCustomRequest.j("#actions-wrapper-" + groupId).show();
            for (var i = 0; i < actions.length; i++) {
                if (!!actions[i].element) {
                    var obj = ChatGptCustomRequest.j(actions[i].element);
                    wrapper.append(obj);
                    if (!!actions[i].callback && typeof actions[i].callback == 'function') {
                        obj.on('click', actions[i].callback);
                    }
                }
            }
        } else {
            ChatGptCustomRequest.j("#actions-wrapper-" + groupId).hide();
            wrapper.html('');
        }

        return this;
    };

    ChatGptCustomRequest.prototype.renderHtml = function() {
        var settings = this.getSettings(),
            id = this.getId();
            
        return '<div class="row gpt-custom-request-wrapper mt-3">' +
                    '<label class="pl-3 pr-3 col-md-12 col-xs-12 form-control-label">' + gptI18n.customRequest + '</label>' +
                    '<div class="d-flex pl-3 pr-3 w-100">' +
                        '<div class="flex-basis-100">' +
                            '<input type="text" id="input-' + id + '" class="form-control" tabindex="2000">' +
                        '</div>' +
                        '<div class="ml-3">' +
                            '<a href="#" id="btn-' + id + '" class="btn btn-primary" tabindex="2001"><i class="material-icons">send</i></a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
    };

    ChatGptCustomRequest.prototype.renderInto = function(element) {
        if (!!element && element.length) {
            var id = this.getId();
            var obj = ChatGptCustomRequest.j(this.renderHtml());
            element.append(obj);
            this.setWrapper(element);
            var self = this;
            ChatGptCustomRequest.j('#btn-' + id).on('click', function (e) {
                e.preventDefault();

                self.getCallback()(self);
            });
        }

        return this;
    };

    ChatGptCustomRequest.prototype.getButton = function() {
        return ChatGptCustomRequest.j('#' + this.getSettings().id);
    };

    return ChatGptCustomRequest;
})();
