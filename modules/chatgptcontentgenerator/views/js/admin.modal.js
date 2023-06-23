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

var ChatGptModalAction = (function () {
    function ChatGptModalAction(options, callbackFunction) {
        var settings = Object.assign({}, {
            title: 'action',
            tag: 'a', // allowed "a" and "button"
            id: '',
            class: 'btn btn-primary',
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

    ChatGptModalAction.prototype.renderHtml = function() {
        var settings = this.getSettings();
        return '<' + (settings.tag.toLowerCase() != 'button' ? 'a href="#"': 'button') +
            ' id="' + settings.id + '" class="' + settings.class + '" >' + settings.title +
            '</' + (settings.tag.toLowerCase() != 'button' ? 'a': 'button') + '>';
    };

    ChatGptModalAction.prototype.renderInto = function(element, prepend) {
        if (!!element && element.length) {
            var obj = $(this.renderHtml());
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

    return ChatGptModalAction;
})();

var ChatGptModal = (function () {
    function ChatGptModal (settings) {
        var options = Object.assign({}, {
            id: 'gptmodal-' + (new Date).getTime(),
            class: '',
            header: false,
            body: false,
            actions: [],
            isRendered: false,
            closable: true,
            keyboard: true,
            backdrop: true,
        }, settings);

        this.setOption = function (optionName, optionValue) {
            options[optionName] = optionValue;
            return this;
        }

        this.getOptions = function () {
            return options;
        }

        this.addAction = function(actionOptions, callback) {
            var action = new ChatGptModalAction(actionOptions, callback);
            action.setModal(this);
            options.actions.push(action);
            return this;
        };

        this.setActions = function (actionsArray) {
            options.actions = actionsArray;
            return this;
        }
    }

    ChatGptModal.j = $;

    ChatGptModal.prototype.find = function(selector) {
        var wraper = ChatGptModal.j('#' + this.getOptions().id);

        if (selector == 'body') {
            return wraper.find('.modal-body');
        } else if (selector == 'header') {
            return wraper.find('.modal-header');
        }

        return wraper.find(selector);
    };

    ChatGptModal.prototype.setHeader = function(headerText) {
        this.setOption('header', headerText);
        return this;
    };

    ChatGptModal.prototype.setBody = function(bodyContent) {
        this.setOption('body', bodyContent);
        return this;
    };

    ChatGptModal.prototype.renderActions = function() {
        var options = this.getOptions();

        if (!!options.actions) {
            var actionsWrapper = this.find('.modal-footer');
            // clean actions
            actionsWrapper.html('');
            // render new actions
            for (var i = 0; i < options.actions.length; i++) {
                options.actions[i].renderInto(actionsWrapper);
            }
        }

        return this;
    };

    ChatGptModal.prototype.render = function() {
        var options = this.getOptions();

        if (options.isRendered) {
            return this;
        }

        var obj = ChatGptModal.j('<div class="modal fade gpt-modal ' + options.class + '" id="' + options.id + '" tabindex="-1" />');
        ChatGptModal.j('body').append(obj);
        obj.html(
            '<div class="modal-dialog "><div class="modal-content">' +
                (options.header ? '<div class="modal-header"><h4 class="modal-title">' + options.header + '</h4>' + (options.closable ? '<button type="button" class="close" data-dismiss="modal">&times;</button>' : '') + '</div>' : '') +
                (options.body ? '<div class="modal-body">' + options.body + '</div>' : '') +
                (options.actions.length ? '<div class="modal-footer"></div>' : '') +
            '</div></div>'
        );

        if (!!options.actions) {
            var actionsWrapper = ChatGptModal.j('#' + options.id + ' .modal-footer');
            for (var i = 0; i < options.actions.length; i++) {
                options.actions[i].renderInto(actionsWrapper);
            }
        }

        ChatGptModal.j('#' + options.id).modal({
            backdrop: options.backdrop,
            keyboard: options.keyboard,
            closable: options.closable,
            show: false
        });

        return this.setOption('isRendered', true);
    };

    ChatGptModal.prototype.open = function(callback) {
        if (this.getOptions().isRendered == false) {
            this.render();
        }

        var id = this.getOptions().id,
            self = this;

        ChatGptModal.j('#' + id).on('shown.bs.modal', function () {
            if (typeof callback == 'function') {
                callback(self);
            }
        });
        ChatGptModal.j('#' + this.getOptions().id).modal('show');
        return this;
    };

    ChatGptModal.prototype.close = function() {
        $('#' + this.getOptions().id).modal('hide');
        return this;
    };

    ChatGptModal.prototype.destroy = function() {
        var id = this.getOptions().id;
        $('#' + id).on('hidden.bs.modal', function () {
            $('#' + id).remove();
        });
        this.close();

        return this.setOption('id', 'gptmodal-' + (new Date).getTime())
            .setOption('isRendered', false);
    };

    ChatGptModal.prototype.setCancelButton = function(cancelCallback) {
        this
            .setActions([])
            .addAction({
                    title: gptI18n.buttonCancel,
                    class: 'btn btn-outline-secondary'
                }, function (cancelButton) {
                    if (typeof cancelCallback == 'function') {
                        cancelCallback(cancelButton)
                    }

                    cancelButton
                        .getModal()
                        .setCloseButton();
                })
            .renderActions();

        return this;
    };

    ChatGptModal.prototype.setCloseButton = function(closeCallback) {
        this
            .setActions([])
            .addAction({
                    title: gptI18n.buttonClose,
                    class: 'btn btn-outline-secondary'
                }, function (closeButton) {
                    if (typeof closeCallback == 'function') {
                        closeCallback(closeButton)
                    }

                    closeButton.getModal().destroy();
                })
            .renderActions();

        return this;
    };

    return ChatGptModal;
})();
