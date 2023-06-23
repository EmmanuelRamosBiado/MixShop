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

var ChatGptTranslateAction = (function () {
    var instanceCounter = 0;

    function ChatGptTranslateAction (settings) {
        instanceCounter ++;

        var context = (new ChatGptContent),
            idLang = context.getPageLanguageId();

        var options = Object.assign({}, {
            id: 'gpttranslateaction-' + instanceCounter + '-' + (new Date).getTime(),
            entity: '',
            languages: [],
            wrapperSelector: '',
            idLang: idLang,
            contentEditorPreffix: '',
            buttonClass: 'btn btn-primary',
            type: 'group',
            title: ''
        }, settings);

        var wrapper = false;

        this.setOption = function (optionName, optionValue) {
            options[optionName] = optionValue;
            return this;
        }

        this.getOptions = function () {
            return options;
        }

        this.setIdLang = function (idLang) {
            return this.setOption('idLang', idLang);
        }

        this.setWrapper = function (value) {
            wrapper = value;
        }

        this.getWrapper = function () {
            return wrapper;
        }
    }

    ChatGptTranslateAction.j = $;

    function renderActions (instance) {
        var options = instance.getOptions();
        if (options.type != 'group') {
            return;
        } 
        var wrapper = ChatGptTranslateAction.j('#list-' + options.id);

        // crear the actions list
        wrapper.html('');

        var currentLanguage = (function (langs, idLang) {
            for (var i = 0; i < langs.length; i++) {
                if (langs[i].id_lang == idLang) {
                    return langs[i];
                }
            }

            return langs[0];
        })(options.languages, options.idLang);

        for (var i = 0; i < options.languages.length; i++) {
            var language = options.languages[i];
            if (language.id_lang == currentLanguage.id_lang) {
                continue;
            }

            var action = ChatGptTranslateAction.j('<a class="dropdown-item" href="#" data-wrapper="' + options.wrapperSelector + '" data-content-editor-preffix="' + options.contentEditorPreffix + '" data-entity="' + options.entity + '" data-from="' + language.iso_code + '" data-to="' + currentLanguage.iso_code + '">' + gptI18n.buttonTranslate + ' ' + language.iso_code.charAt(0).toUpperCase() + language.iso_code.slice(1) + ' -> ' + currentLanguage.iso_code.charAt(0).toUpperCase() + currentLanguage.iso_code.slice(1) + '</a>');

            wrapper.append(action);

            action.on('click', function (e) {
                e.preventDefault();

                var contentEditorPreffix = $(this).data('content-editor-preffix');
                if (!!contentEditorPreffix == false) {
                    console.warn('The content editor is not set');
                    return;
                }

                var translate = (function (from, to, contentWrapperSelector, contentEditorPreffix, entity) {
                    return async function  () {
                        var content = new ChatGptContent();
                        var editor = document.getElementById(contentEditorPreffix + content.getLanguageByIsoCode(from).id_lang);
                        var text = content.getContentFromEditor(editor, 'html');

                        if (!!contentWrapperSelector) {
                            ChatGptContent.renderLoaderlayer(ChatGptTranslateAction.j(contentWrapperSelector));
                        } else {
                            ChatGptContent.renderLoaderlayer(instance.getWrapper());
                        }

                        var translatedContent = await content.translateText(text, {
                            fromLangauge: content.getLanguageByIsoCode(from).iso_code,
                            toLanguage: content.getLanguageByIsoCode(to).iso_code,
                            entity: entity
                        });

                        if (typeof translatedContent.inQueue != 'undefined' && translatedContent.inQueue) {
                            translatedContent = await content.awaitRequestResponse(translatedContent.requestId);

                            if (translatedContent && translatedContent.status != 'success') {
                                if (translatedContent.status == 'quota_over') {
                                    window.showErrorMessage(gptI18n.subscriptionLimitЕxceeded);
                                } else {
                                    window.showErrorMessage(translatedContent.text);
                                }
                                ChatGptContent.removeLoaderLayer();
                                return;
                            }
                        }

                        if (translatedContent && translatedContent.text) {
                            editor = document.getElementById(contentEditorPreffix + content.getLanguageByIsoCode(to).id_lang);
                            content.setContentIntoEditor(
                                (editor.tagName == 'INPUT' ? translatedContent.text : content.convertTextToHtml(translatedContent.text)),
                                {format: 'html'},
                                editor
                            );

                            window.showSuccessMessage(gptI18n.successMessage.replace(/\%words\%/g, translatedContent.nbWords));
                        }

                        ChatGptContent.removeLoaderLayer();
                    }
                })($(this).data('from'), $(this).data('to'), $(this).data('wrapper'), contentEditorPreffix, $(this).data('entity'));

                // get current text content from editor
                var currentContent = (new ChatGptContent()).getContentFromEditor(contentEditorPreffix + (new ChatGptContent()).getLanguageByIsoCode($(this).data('to')).id_lang, 'html');

                // check the content text
                if (currentContent !== '') {
                    // display confirmation window to replace the text
                    (new ChatGptModal)
                        .setHeader(gptI18n.modalTitle)
                        .setBody(gptI18n.translateQuestion)
                        .addAction({
                                title: gptI18n.buttonCancel,
                                class: 'btn btn-outline-secondary'
                            }, function (actionInstance) {
                                actionInstance.getModal().destroy();
                            })
                        .addAction({
                                title: gptI18n.buttonTranslate,
                            }, function (actionInstance) {
                                translate($(this).data('from'), $(this).data('to'), $(this).data('wrapper'));
                                actionInstance.getModal().destroy();
                            })
                        .open();
                    return;
                }

                translate($(this).data('from'), $(this).data('to'), $(this).data('wrapper'));
            });
        }
    }

    ChatGptTranslateAction.prototype.renderHtml = function() {
        var options = this.getOptions();
        var html = '<div class="translate-action-wrapper" id="' + options.id + '">';
        if (options.type == 'group') {
            if (options.languages.length > 1) {
                html += '<div class="dropdown">';
                html += '<a class="' + options.buttonClass + ' dropdown-toggle" href="#" role="button" id="group-' + options.id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + options.title + '</a>';
                html += '<div class="dropdown-menu" id="list-' + options.id + '" aria-labelledby="group-' + options.id + '">';
                html += '</div>';
                html += '</div>';
            } else {
                return '';
            }
        } else if (options.type == 'dropdown-item') {
            return '<a class="dropdown-item" href="#" role="button" data-wrapper="' + options.wrapperSelector + '" data-content-editor-preffix="' + options.contentEditorPreffix + '" data-entity="' + options.entity + '" id="group-' + options.id + '">' + options.title + '</a>';
        } else if (options.type == 'button') {
                return '<a class="' + options.buttonClass + '" href="#" role="button" data-wrapper="' + options.wrapperSelector + '" data-content-editor-preffix="' + options.contentEditorPreffix + '" data-entity="' + options.entity + '" id="group-' + options.id + '">' + options.title + '</a>';
        } else {
            html += '<a class="' + options.buttonClass + '" href="#" role="button" data-wrapper="' + options.wrapperSelector + '" data-content-editor-preffix="' + options.contentEditorPreffix + '" data-entity="' + options.entity + '" id="group-' + options.id + '">' + options.title + '</a>';
        }
        return html + '</div>';
    };

    ChatGptTranslateAction.prototype.renderInto = function(element, prepend) {
        if (!!element && element.length) {
            var h = this.renderHtml();
            if (!!h === false) {
                return this;
            }
            var obj = ChatGptTranslateAction.j(h);
            if (typeof prepend != 'undefined' && prepend) {
                element.prepend(obj);
            } else {
                element.append(obj);
            }
            this.setWrapper(element);
            renderActions(this);
        }
        return this;
    };

    ChatGptTranslateAction.prototype.render = function () {
        var options = this.getOptions();
        var wrapper = (!!options.wrapperSelector ? ChatGptTranslateAction.j(options.wrapperSelector) : false);

        this.renderInto(wrapper, false);
        return this;
    };

    ChatGptTranslateAction.prototype.destroy = function() {
        ChatGptTranslateAction.j('#' + this.getOptions().id).remove();
    };

    ChatGptTranslateAction.prototype.update = function() {
        renderActions(this);
        return this;
    };

    ChatGptTranslateAction.prototype.getButton = function() {
        return ChatGptTranslateAction.j('#group-' + this.getOptions().id);
    };

    return ChatGptTranslateAction;
})();
