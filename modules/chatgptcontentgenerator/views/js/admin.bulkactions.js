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

var ChatGptModalBulkAction = (function () {
    function ChatGptModalBulkAction(options, callbackFunction) {
        var settings = Object.assign({}, {
            title: 'action',
            tag: 'a', // allowed "a" and "button"
            id: '',
            class: 'btn btn-primary'
        }, options);
        var callback = callbackFunction;
        var modal = false;

        this.getSettings = function () {
            return Object.assign({}, settings);
        }

        this.getCallback = function () {
            var emptyFunction = function () {};
            return typeof callback == 'function'
                ? callback
                : emptyFunction;
        }

        this.setModal = function (modalInstance) {
            modal = modalInstance;
            return this;
        }

        this.getModal = function () {
            return modal;
        }
    }

    ChatGptModalBulkAction.j = $;

    ChatGptModalBulkAction.prototype.renderHtml = function() {
        var settings = this.getSettings();
        return '<' + (settings.tag.toLowerCase() != 'button' ? 'a href="#"': 'button') +
            ' id="' + settings.id + '" class="' + settings.class + '" >' + settings.title +
            '</' + (settings.tag.toLowerCase() != 'button' ? 'a': 'button') + '>';
    };

    ChatGptModalBulkAction.prototype.renderInto = function(element, prepend) {
        if (!!element && element.length) {
            var obj = ChatGptModalBulkAction.j(this.renderHtml());
            if (typeof prepend != 'undefined' && prepend) {
                element.prepend(obj);
            } else {
                element.append(obj);
            }
            var self = this;
            obj.on('click', function (e) {
                e.preventDefault();

                self.getCallback()(self);
            });
        }
    };

    return ChatGptModalBulkAction;
})();
