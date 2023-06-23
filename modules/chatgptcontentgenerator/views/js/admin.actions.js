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

var ChatGptAction = (function() {
    function ChatGptAction (options) {
        var settings = Object.assign({}, {
            title: 'action',
            type: 'group',
            tag: 'a', // allowed "a" and "button"
            id: '',
            class: 'btn btn-primary',
            additionalHtml: '',
        }, options);

        var groupId = false;

        this.getGroupId = function () {
            if (!groupId) {
                groupId = 'gpt-content-btn-group-' + (new Date).getTime();
            }

            return groupId;
        }

        this.getSettings = function () {
            return Object.assign({}, settings);
        }
    }

    ChatGptAction.j = $;

    ChatGptAction.prototype.setActions = function(actions) {
        var groupId = this.getGroupId(),
            wrapper = ChatGptAction.j("#actions-list-" + groupId);

        if (!!actions && actions.length) {
            ChatGptAction.j("#actions-wrapper-" + groupId).show();
            for (var i = 0; i < actions.length; i++) {
                if (!!actions[i].element) {
                    var obj = ChatGptAction.j(actions[i].element);
                    wrapper.append(obj);
                    if (!!actions[i].callback && typeof actions[i].callback == 'function') {
                        obj.on('click', actions[i].callback);
                    }
                }
            }
        } else {
            ChatGptAction.j("#actions-wrapper-" + groupId).hide();
            wrapper.html('');
        }

        return this;
    };

    ChatGptAction.prototype.renderHtml = function() {
        var settings = this.getSettings(),
            groupId = this.getGroupId();
            
        return '<div class="row mt-3 gpt-description-wraper">' +
            (settings.type != 'group'
                ? '<div class="pl-3 gpt-button-wraper"><' + (settings.tag.toLowerCase() != 'button' ? 'a href="#"': 'button') + '  id="' + settings.id + '" class="' + settings.class + '">' + settings.title + '</' + (settings.tag.toLowerCase() != 'button' ? 'a': 'button') + '></div>'
                : '<div class="pl-3 gpt-button-wraper">' +
                    '<div class="btn-group" role="group" aria-label="">' +
                        '<' + (settings.tag.toLowerCase() != 'button' ? 'a href="#"': 'button') + ' id="' + settings.id + '" class="' + settings.class + '">' + settings.title + '</' + (settings.tag.toLowerCase() != 'button' ? 'a': 'button') + '>' +
                        '<div id="actions-wrapper-' + groupId + '" class="btn-group" role="group" style="display: none;">' +
                            '<button id="' + groupId + '" type="button" class="' + settings.class + ' dropdown-toggle pl-1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>' +
                            '<div id="actions-list-' + groupId + '" class="dropdown-menu dropdown-menu-right" aria-labelledby="' + groupId + '">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            ) +
            settings.additionalHtml +
        '</div>'
    };

    ChatGptAction.prototype.renderInto = function(element) {
        if (!!element && element.length) {
            var obj = ChatGptAction.j(this.renderHtml());
            element.append(obj);
            var self = this;
            obj.on('click', function (e) {
                e.preventDefault();
            });
        }

        return this;
    };

    ChatGptAction.prototype.getButton = function() {
        return ChatGptAction.j('#' + this.getSettings().id);
    };

    return ChatGptAction;
})();