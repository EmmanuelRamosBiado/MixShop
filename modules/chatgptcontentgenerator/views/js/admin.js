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

const gptPageSettings = {
    productsList: {
        words: 400,
        minWords: 100,
        maxWords: 1000,
        step: 1,
        replaceContent: false,
        skipExistingDescription: true, // generate new content if empty
        skipExistingTitle: true,
    },
    productForm: {
        words: 400,
        minWords: 100,
        maxWords: 1000,
        step: 1,
        replaceContent: false,
        skipExistingDescription: false, // generate new content if empty
        skipExistingTitle: false
    },
    categoriesList: {
        words: 180,
        minWords: 10,
        maxWords: 1000,
        step: 1,
        skipExistingDescription: true,
        skipExistingTitle: true,
        replaceContent: false,
    },
    categoryForm: {
        words: 180,
        minWords: 10,
        maxWords: 1000,
        step: 1,
    },
    cmsForm: {
        words: 1000,
        minWords: 100,
        maxWords: 2000,
        step: 1,
    }
};

$(function () {
    if (typeof adminPageName == 'undefined') {
        return;
    }

    if (typeof gptShopInfo == 'undefined' || !!gptShopInfo === false) {
        console.error('The gptShopInfo is not defined. Make sure that the the shop data is agreement on the module configuration page');
        return;
    }

    if (typeof ChatGptContent == 'undefined') {
        console.error('The ChatGptContent is not defined.');
        return;
    }    

    // function renderLoaderlayer(el) {
    //     el.length > 0 && el.css('position', 'relative')
    //             .append('<div id="gpt_description_loader" class="content-loader-layer"><div class="loader-wrapper"><div class="content-loader"></div></div></div>');
    // }
    var renderLoaderlayer = ChatGptContent.renderLoaderlayer;

    function getWordsFiled(value, min, max, step) {
        return '<div class="col-md-4">'+
                    '<div class="input-group">' +
                        '<input type="number" id="gpt_description_length" title="' + gptI18n.maxLength + '" class="form-control" min="' + min + '" step="' + step + '" max="' + max + '" value="' + value + '">' +
                        '<div class="input-group-append">' +
                            '<span class="input-group-text"> ' + gptI18n.words + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
    }

    function getInfoButton(message) {
        return '<a class="btn tooltip-link delete pl-0 pr-0">' +
                '<span class="help-box gpt-tooltip" data-toggle="popover" data-content="' + message.replace(/\"/g, "\'") + '" data-original-title="" title=""></span>' +
            '</a>';
    }

    var removeLoaderLayer = ChatGptContent.removeLoaderLayer;

    function renderAlertMessage(messageText, element) {
        var object = $('<div class="alert alert-danger mt-2" role="alert">' +
                        '<p class="alert-text">' + messageText + '</p>' +
                    '</div>');
        if (!!element && element.length) {
            element.append(object);
        }
    }

    function renderTranslateButtonsList (contentButton, options) {
        throw new Error('This function is deprecated');
        return;
        // if the shop use the single language then not need the translation panel
        if (gptLanguages.length <= 1) {
            $("#actions-wrapper-" + contentButton.getGroupId()).remove();
            return;
        }

        options = Object.assign({}, {
            contentWrapperSelector: '',
            contentEditorPreffix: '',
            entity: '',
        }, options);
        var context = (new ChatGptContent),
            idLang = context.getPageLanguageId(),
            pageLanguage = context.getPageLanguage();
        contentButton.setActions([]).setActions(
            gptLanguages.filter(function (language) {
                return language.id_lang != idLang ? language : null;
            }).map(function (language) {
                return {
                    element: '<a class="dropdown-item" href="#" data-wrapper="' + options.contentWrapperSelector + '" data-content-editor-preffix="' + options.contentEditorPreffix + '" data-entity="' + options.entity + '" data-from="' + language.iso_code + '" data-to="' + pageLanguage.iso_code + '">' + gptI18n.buttonTranslate + ' ' + language.iso_code.charAt(0).toUpperCase() + language.iso_code.slice(1) + ' -> ' + pageLanguage.iso_code.charAt(0).toUpperCase() + pageLanguage.iso_code.slice(1) + '</a>',
                    callback: function () {
                        var contentEditorPreffix = $(this).data('content-editor-preffix');

                        var translate = (function (from, to, contentWrapperSelector, contentEditorPreffix, entity) {
                            return async function  () {
                                var content = new ChatGptContent();
                                text = tinymce.get(contentEditorPreffix + content.getLanguageByIsoCode(from).id_lang)
                                                .getContent({format: 'html'})
                                                .trim();

                                renderLoaderlayer($(contentWrapperSelector));

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
                                        removeLoaderLayer();
                                        return;
                                    }
                                }

                                if (translatedContent && translatedContent.text) {
                                    content.setContentIntoEditor(
                                        content.convertTextToHtml(translatedContent.text),
                                        {format: 'html'},
                                        tinymce.get(contentEditorPreffix + content.getLanguageByIsoCode(to).id_lang)
                                    );

                                    window.showSuccessMessage(gptI18n.successMessage.replace(/\%words\%/g, translatedContent.nbWords));
                                }

                                removeLoaderLayer();
                            }
                        })($(this).data('from'), $(this).data('to'), $(this).data('wrapper'), contentEditorPreffix, $(this).data('entity'));

                        var idLang = (new ChatGptContent()).getLanguageByIsoCode($(this).data('to')).id_lang,
                            currentContent = tinymce.get(contentEditorPreffix + idLang)
                                                .getContent({format: 'text'})
                                                .trim();

                        if (currentContent !== '') {
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
                                        translate($(this).data('from'), $(this).data('to'), $(this).data('wrapper'), $(this).data('content-editor-preffix'), $(this).data('entity'));
                                        actionInstance.getModal().destroy();
                                    })
                                .open();
                            return;
                        }

                        translate($(this).data('from'), $(this).data('to'), $(this).data('wrapper'));
                    }
                };
            })
        );
    }

    function renderCustomRequestForm (element, options) {
        options = Object.assign({}, {
            contentWrapperSelector: '',
            contentEditorPreffix: '',
            entity: '',
        }, options);

        var customRequestObject = new ChatGptCustomRequest({}, function (instance) {
            async function customRequest () {
                var content = new ChatGptContent(),
                    idLang = content.getPageLanguageId();

                renderLoaderlayer(instance.getWrapper());
                var response = await content.customRequest(instance.getText(), {entity: options.entity});
                if (typeof response.inQueue != 'undefined' && response.inQueue) {
                    response = await content.awaitRequestResponse(response.requestId);

                    // display error message if the request is failure
                    if (response && response.status != 'success') {
                        if (response.status == 'quota_over') {
                            window.showErrorMessage(gptI18n.subscriptionLimitЕxceeded);
                        } else {
                            window.showErrorMessage(response.text);
                        }
                        removeLoaderLayer();
                        return;
                    }
                }

                if (response && response.text) {                    
                    content.setContentIntoEditor(
                        content.convertTextToHtml(response.text),
                        {format: 'html'},
                        tinymce.get(options.contentEditorPreffix + idLang)
                    );

                    window.showSuccessMessage(gptI18n.successMessage.replace(/\%words\%/g, response.nbWords));
                }
                removeLoaderLayer();
            }

            var currentContent = tinymce.get(options.contentEditorPreffix + (new ChatGptContent()).getPageLanguageId())
                                    .getContent({format: 'text'})
                                    .trim();

            if (currentContent !== '') {
                (new ChatGptModal)
                    .setHeader(gptI18n.modalTitle)
                    .setBody(gptI18n.confirmCustomRequest)
                    .addAction({
                            title: gptI18n.buttonCancel,
                            class: 'btn btn-outline-secondary'
                        }, function (actionInstance) {
                            actionInstance.getModal().destroy();
                        })
                    .addAction({
                            title: '<i class="material-icons">send</i> ' + gptI18n.buttonSend,
                        }, function (actionInstance) {
                            customRequest();
                            actionInstance.getModal().destroy();
                        })
                    .open();
                return;
            }

            customRequest();
        }).renderInto(element);
    }

    // init description form //////////////////////////////////////
    var descriptionModal = new ChatGptModal({
        closable: false,
        keyboard: false,
        backdrop: false,
        class: 'black-modal modal-with-tabs'
    });

    descriptionModal
        .setHeader(gptI18n.bulkGeneratingDescription)
        .setBody(
            '<div>' + ChatGptForm.descriptionForm() + '</div>'
        )
    ;
    // END init description form //////////////////////////////////////

    // init translation form //////////////////////////////////////
    var trasnalationModal = new ChatGptModal({
        closable: false,
        keyboard: false,
        backdrop: false,
        class: 'black-modal modal-with-tabs'
    });

    trasnalationModal
        .setHeader(gptI18n.translatingSettings)
        .setBody(
            '<div>' + ChatGptForm.traslationForm() + '</div>'
        )
    ;
    // END init translation form //////////////////////////////////////

    function translateEventHandler (e) {
        e.preventDefault();

        var button = $(this);

        trasnalationModal.setBody(
            '<div>' + ChatGptForm.traslationForm() + '</div>'
        ).setActions([])
        .addAction({
            title: gptI18n.buttonCancel,
            class: 'btn btn-outline-secondary'
        }, function (cancelButton) {
            cancelButton.getModal().destroy();
        }).addAction({
            title: gptI18n.buttonTranslate,
        }, async function (actionInstance) {
            try {
                // define translate options
                var options = {
                    replace: true,
                    originLanguageId: +$('input[name="origin_language"]:checked').val(),
                    targetLanguages: [],
                };

                if (isNaN(options.originLanguageId) || options.originLanguageId == 0) {
                    alert('Please choose the origin language');
                    return;
                }

                // define selected languages
                $('.gpt-languages-list').each(function () {
                    var value = +($(this).is(':checked') ? this.value : 0);
                    if (
                        value != 0 &&
                        options.targetLanguages.indexOf(value) == -1 &&
                        value != options.originLanguageId // ignore origin language
                    ) {
                        options.targetLanguages.push(value);
                    }
                });

                if (options.targetLanguages.length == 0) {
                    alert(gptI18n.pleaseSelectLanguages);
                    return;
                }

                var contentEditorPreffix = button.data('content-editor-preffix');
                if (!!contentEditorPreffix == false) {
                    console.warn('The content editor is not set');
                    return;
                }

                ChatGptContent.renderLoaderlayer($('body'));
                try {
                    for (var langIndex = 0; langIndex < options.targetLanguages.length; langIndex ++) {
                        var content = new ChatGptContent();
                        var editor = document.getElementById(contentEditorPreffix + options.originLanguageId);
                        var text = content.getContentFromEditor(editor, 'html');

                        var translatedContent = await content.translateText(text, {
                            fromLangauge: content.getLanguageById(options.originLanguageId).iso_code,
                            toLanguage: content.getLanguageById(options.targetLanguages[langIndex]).iso_code,
                            entity: button.data('entity')
                        }, true);

                        if (typeof translatedContent.inQueue != 'undefined' && translatedContent.inQueue) {
                            translatedContent = await content.awaitRequestResponse(translatedContent.requestId);

                            if (translatedContent && translatedContent.status != 'success') {
                                if (translatedContent.status == 'quota_over') {
                                    var errorMessage = gptI18n.subscriptionLimitЕxceeded;
                                } else {
                                    var errorMessage = translatedContent.text;
                                }
                                handleModalError(
                                    actionInstance.getModal(),
                                    'Language: ' + content.getLanguageById(options.targetLanguages[langIndex]).name + '<br/>' + errorMessage
                                );

                                ChatGptContent.removeLoaderLayer();
                                return;
                            }
                        }

                        if (translatedContent && translatedContent.text) {
                            editor = document.getElementById(contentEditorPreffix + options.targetLanguages[langIndex]);
                            content.setContentIntoEditor(
                                (editor.tagName == 'INPUT' ? translatedContent.text : content.convertTextToHtml(translatedContent.text)),
                                {format: 'html'},
                                editor
                            );

                            window.showSuccessMessage('Language: ' + content.getLanguageById(options.targetLanguages[langIndex]).iso_code.toUpperCase() + ': ' + gptI18n.successMessage.replace(/\%words\%/g, translatedContent.nbWords));
                        }
                    }
                } catch (err) {
                    ChatGptContent.removeLoaderLayer();
                    handleModalError(
                        actionInstance.getModal(),
                        'Language: ' + (new ChatGptContent()).getLanguageById(options.targetLanguages[langIndex]).name + '<br/>' + err
                    );
                    return;
                }
            } catch (err) {
                ChatGptContent.removeLoaderLayer();
                handleModalError(actionInstance.getModal(), err);
                return;
            }

            ChatGptContent.removeLoaderLayer();
            actionInstance.getModal().destroy();
        });

        trasnalationModal.open();
    };

    /**
     * Handle error and print in modal body
     */
    function handleModalError (modal, errorMessage) {
        if (!!modal.find('.progress-bar') && modal.find('.progress-bar').length) {
            progressBar = modal.find('.progress-bar');
            progressBar.removeClass('progress-bar-success');
            progressBar.addClass('progress-bar-danger');
            modal.find('#process_translate_status').text(gptI18n.bulkTranslationProcessFail);
            modal.find("#process_translate_error_log").show().text(errorMessage);
        } else {
            // clean body
            modal.find('body').html('');
            // render message
            renderAlertMessage(errorMessage, modal.find('body'));
        }

        // render close button
        modal
            .setActions([])
            .addAction({
                    title: gptI18n.buttonClose,
                    class: 'btn btn-outline-secondary'
                }, function (closeButton) {
                    closeButton.getModal().destroy();
                })
            .renderActions();
    }

    if (adminPageName == 'productForm') {
        if (!gptShopInfo.subscription || gptShopInfo.subscription.availableProductWords == 0) {
            if (!gptShopInfo.subscription || !gptShopInfo.subscription.plan) {
                renderAlertMessage(gptI18n.subscriptionNotAvaialable, $("#description"));
            } else if (gptShopInfo.subscription.plan.productWords == 0) {
                renderAlertMessage(gptI18n.subscriptionPlanNoFeature, $("#description"));
            }  else if (gptShopInfo.subscription.availableProductWords == 0) {
                renderAlertMessage(gptI18n.subscriptionLimitЕxceeded, $("#description"));
            }
            return;
        }

        $(".summary-description-container").css('overflow', 'visible');

        var actionObject = (new ChatGptAction({
            id: "gpt_description_button",
            title: gptI18n.buttonName,
            type: 'single'
        }))
            .renderInto($("#description"));

        // $(".gpt-tooltip").popover();

        if (gptShopInfo.subscription.plan.customRequest) {
            renderCustomRequestForm($("#description"), {
                contentEditorPreffix: 'form_step1_description_',
                entity: 'product',
            });
        }

        if (gptLanguages.length > 1) {
            // translate product name button
            var translateProductNameObject = new ChatGptTranslateAction({
                entity: 'product',
                languages: gptLanguages,
                wrapperSelector: '#form_step1_name',
                contentEditorPreffix: 'form_step1_name_',
                title: gptI18n.buttonTranslate,
                type: 'single'
            })
                .renderInto($("#form_step1_names").closest('.row').parent(), false);

            // translate product short description button
            var translateProductShortDescriptionObject = new ChatGptTranslateAction({
                entity: 'product',
                languages: gptLanguages,
                wrapperSelector: '#description_short',
                contentEditorPreffix: 'form_step1_description_short_',
                buttonClass: 'btn btn-primary',
                type: 'single',
                title: gptI18n.buttonTranslate
            })
                .render();

            // translate product description button
            var translateProductDescriptionObject = new ChatGptTranslateAction({
                entity: 'product',
                languages: gptLanguages,
                wrapperSelector: '#description',
                contentEditorPreffix: 'form_step1_description_',
                buttonClass: 'btn btn-primary ml-2',
                type: 'button',
                title: gptI18n.buttonTranslate
            })
                .renderInto($(".gpt-button-wraper"), false);

            translateProductShortDescriptionObject.getButton().on('click', translateEventHandler);
            translateProductNameObject.getButton().on('click', translateEventHandler);
            translateProductDescriptionObject.getButton().on('click', translateEventHandler);
            // actionObject.setActions([{element:translateProductDescriptionObject.renderHtml(), callback: translateEventHandler}]);
        }

        actionObject.getButton().on('click', function (e) {
            e.preventDefault();

            descriptionModal.setBody(
                '<div>' + ChatGptForm.descriptionForm() + '</div>'
            ).setActions([])
            .addAction({
                title: gptI18n.buttonCancel,
                class: 'btn btn-outline-secondary'
            }, function (cancelButton) {
                cancelButton.getModal().destroy();
            }).addAction({
                title: gptI18n.buttonRegenerate,
            }, async function (actionInstance) {
                // define bulk options
                var options = {
                    replace: +$("#allow_gen_content_0").is(':checked'),
                    skipExistingContent: 0, // +$("#skip_existing_content_1").is(':checked'),
                    maxWords: +$("#gpt_description_length").val(),
                    languages: [],
                    useProductCategory: +$("#use_product_category_1").is(':checked'),
                    useProductBrand: +$("#use_product_brand_1").is(':checked'),
                    useProductEan: +$("#use_product_ean_1").is(':checked'),
                    contentType: $('input[name="desc_or_characteristics"]:checked').val(),
                    idDefaultCategory: 0,
                    idBrand: !!+$("#form_step1_id_manufacturer").val() && $("#form_step1_id_manufacturer").val()
                };
                // define selected languages
                $('.gpt-languages-list').each(function () {
                    var value = +($(this).is(':checked') ? this.value : 0);
                    if (value != 0 && options.languages.indexOf(value) == -1) {
                        options.languages.push(value);
                    }
                });

                if (isNaN(options.maxWords) || options.maxWords < gptPageSettings[adminPageName].minWords) {
                    alert(gptI18n.maxWordsNotValid.replace('%min_words%', gptPageSettings[adminPageName].minWords));
                    return;
                }

                if (options.languages.length == 0) {
                    alert(gptI18n.pleaseSelectLanguages);
                    return;
                }

                $('input.default-category').each(function () {
                    if ($(this).is(':checked')) {
                        options.idDefaultCategory = +this.value
                    }
                });

                var content = new ChatGptContent(),
                    productName = '';

                ChatGptContent.renderLoaderlayer($('body'));
                
                for (var langIndex = 0; langIndex < options.languages.length; langIndex ++) {
                    try {
                        options.idLang = options.languages[langIndex];
                        productName = $("#form_step1_name_" + options.idLang).val();
                        var description = await content.getProductDescription(productName, options, true);

                        if (typeof description.inQueue != 'undefined' && description.inQueue) {
                            description = await content.awaitRequestResponse(description.requestId);

                            // display error message if the request is failure
                            if (description && description.status != 'success') {
                                if (description.status == 'quota_over') {
                                    var errorMessage = gptI18n.subscriptionLimitЕxceeded;
                                } else {
                                    var errorMessage = description.text;
                                }

                                handleModalError(
                                    actionInstance.getModal(),
                                    'Language: ' + content.getLanguageById(options.languages[langIndex]).name + '<br/>' + errorMessage
                                );

                                ChatGptContent.removeLoaderLayer();
                                return;
                            }
                        }

                        if (description && description.text) {
                            var text = content.convertTextToHtml(description.text);
                            if (options.replace == false) {
                                text = content.getContentFromEditor(document.getElementById('form_step1_description_' + options.languages[langIndex]), 'html') + text;
                            }

                            content.setContentIntoEditor(
                                text,
                                {format: 'html'},
                                tinymce.get('form_step1_description_' + options.languages[langIndex])
                            );

                            window.showSuccessMessage('Language: ' + content.getLanguageById(options.languages[langIndex]).iso_code.toUpperCase() + ': ' + gptI18n.successMessage.replace(/\%words\%/g, description.nbWords));
                        }
                    } catch (err) {
                        ChatGptContent.removeLoaderLayer();
                        handleModalError(
                            actionInstance.getModal(),
                            'Language: ' + content.getLanguageById(options.languages[langIndex]).name + '<br/>' + err
                        );
                        return;
                    }
                }
                ChatGptContent.removeLoaderLayer();
                actionInstance.getModal().destroy();
            });

            descriptionModal.open(function () {
                // init tooltips
                $(".gpt-tooltip").popover();
            });
        });
    } else if (adminPageName == 'categoryForm') {
        var gptWidgetSettings = {
            descriptionWrapper: $("#category_description"),
            descriptionEditorPrefix: 'category_description_',
            descriptionWrapperSelector: '#category_description',
            nameWrapper: $('label[for="category_name"] + div'),
            nameWrapperSelector: 'label[for=\'category_name\'] + div',
            nameEditorPrefix: 'category_name_',
        };
        if (isLegacyController) {
            gptWidgetSettings.descriptionWrapper = $("#description_" + (new ChatGptContent).getPageLanguageId())
                .closest('.translatable-field')
                .parent()
                .addClass('category-description-wrapper');
            gptWidgetSettings.descriptionWrapperSelector = '.category-description-wrapper';
            gptWidgetSettings.descriptionEditorPrefix = 'description_';
            gptWidgetSettings.nameWrapper = $("#name_" + (new ChatGptContent).getPageLanguageId())
                .closest('.translatable-field')
                .parent()
                .addClass('category-name-wrapper');
            gptWidgetSettings.nameWrapperSelector = '.category-name-wrapper';
            gptWidgetSettings.nameEditorPrefix = 'name_';
        }
        if (!gptShopInfo.subscription || gptShopInfo.subscription.availableCategoryWords == 0) {
            if (!gptShopInfo.subscription || !gptShopInfo.subscription.plan) {
                renderAlertMessage(gptI18n.subscriptionNotAvaialable, gptWidgetSettings.descriptionWrapper);
            } else if (gptShopInfo.subscription.plan.categoryWords == 0) {
                renderAlertMessage(gptI18n.subscriptionPlanNoFeature, gptWidgetSettings.descriptionWrapper);
            }  else if (gptShopInfo.subscription.availableCategoryWords == 0) {
                renderAlertMessage(gptI18n.subscriptionLimitЕxceeded, gptWidgetSettings.descriptionWrapper);
            }
            return;
        }

        var contentAction = (new ChatGptAction({
            id: "gpt_description_button",
            title: gptI18n.buttonName,
            type: 'single'
        }))
            .renderInto(gptWidgetSettings.descriptionWrapper);

        if (gptLanguages.length > 1) {
            // translate category name button
            var translateNameObject = new ChatGptTranslateAction({
                entity: 'category',
                languages: gptLanguages,
                wrapperSelector: gptWidgetSettings.nameWrapperSelector,
                contentEditorPreffix: gptWidgetSettings.nameEditorPrefix,
                title: gptI18n.buttonTranslate,
                type: 'single'
            })
                .renderInto(gptWidgetSettings.nameWrapper, false);

            // translate category description button
            var translateCategoryDescriptionObject = new ChatGptTranslateAction({
                entity: 'category',
                languages: gptLanguages,
                wrapperSelector: gptWidgetSettings.descriptionWrapperSelector,
                contentEditorPreffix: gptWidgetSettings.descriptionEditorPrefix,
                buttonClass: 'btn btn-primary ml-2',
                type: 'button',
                title: gptI18n.buttonTranslate
            })
                .renderInto($('.gpt-description-wraper'), false);

            translateNameObject.getButton().on('click', translateEventHandler);
            translateCategoryDescriptionObject.getButton().on('click', translateEventHandler);
            // contentAction.setActions([{element:translateCategoryDescriptionObject.renderHtml(), callback: translateEventHandler}]);
        }

        if (gptShopInfo.subscription.plan.customRequest) {
            renderCustomRequestForm(gptWidgetSettings.descriptionWrapper, {
                contentEditorPreffix: gptWidgetSettings.descriptionEditorPrefix,
                entity: 'category',
            });
        }

        contentAction.getButton().on('click', function (e) {
            e.preventDefault();

            descriptionModal.setBody(
                '<div>' + ChatGptForm.descriptionForm() + '</div>'
            ).setActions([])
            .addAction({
                title: gptI18n.buttonCancel,
                class: 'btn btn-outline-secondary'
            }, function (cancelButton) {
                cancelButton.getModal().destroy();
            }).addAction({
                title: gptI18n.buttonRegenerate,
            }, async function (actionInstance) {
                // define bulk options
                var options = {
                    replace: +$("#allow_gen_content_0").is(':checked'),
                    skipExistingContent: 0,
                    maxWords: +$("#gpt_description_length").val(),
                    languages: [],
                };
                // define selected languages
                $('.gpt-languages-list').each(function () {
                    var value = +($(this).is(':checked') ? this.value : 0);
                    if (value != 0 && options.languages.indexOf(value) == -1) {
                        options.languages.push(value);
                    }
                });

                if (isNaN(options.maxWords) || options.maxWords < gptPageSettings[adminPageName].minWords) {
                    alert(gptI18n.maxWordsNotValid.replace('%min_words%', gptPageSettings[adminPageName].minWords));
                    return;
                }

                if (options.languages.length == 0) {
                    alert(gptI18n.pleaseSelectLanguages);
                    return;
                }

                var content = new ChatGptContent(),
                    categoryName = '';

                ChatGptContent.renderLoaderlayer($('body'));
                
                for (var langIndex = 0; langIndex < options.languages.length; langIndex ++) {
                    try {
                        options.idLang = options.languages[langIndex];
                        categoryName = $("#" + gptWidgetSettings.nameEditorPrefix + options.idLang).val();

                        var description = await content.getCategoryDescription(categoryName, options, true);

                        if (typeof description.inQueue != 'undefined' && description.inQueue) {
                            description = await content.awaitRequestResponse(description.requestId);

                            // display error message if the request is failure
                            if (description && description.status != 'success') {
                                if (description.status == 'quota_over') {
                                    var errorMessage = gptI18n.subscriptionLimitЕxceeded;
                                } else {
                                    var errorMessage = description.text;
                                }

                                handleModalError(
                                    actionInstance.getModal(),
                                    'Language: ' + content.getLanguageById(options.languages[langIndex]).name + '<br/>' + errorMessage
                                );

                                ChatGptContent.removeLoaderLayer();
                                return;
                            }
                        }

                        if (description && description.text) {
                            var text = content.convertTextToHtml(description.text);
                            if (options.replace == false) {
                                text = content.getContentFromEditor(document.getElementById(gptWidgetSettings.descriptionEditorPrefix + options.languages[langIndex]), 'html') + text;
                            }
                            content.setContentIntoEditor(
                                text,
                                {format: 'html'},
                                tinymce.get(gptWidgetSettings.descriptionEditorPrefix + options.languages[langIndex])
                            );

                            window.showSuccessMessage('Language: ' + content.getLanguageById(options.languages[langIndex]).iso_code.toUpperCase() + ': ' + gptI18n.successMessage.replace(/\%words\%/g, description.nbWords));
                        }
                    } catch (err) {
                        ChatGptContent.removeLoaderLayer();
                        handleModalError(
                            actionInstance.getModal(),
                            'Language: ' + content.getLanguageById(options.languages[langIndex]).name + '<br/>' + err
                        );
                        return;
                    }
                }
                ChatGptContent.removeLoaderLayer();
                actionInstance.getModal().destroy();
            });

            descriptionModal.open(function () {
                // init tooltips
                $(".gpt-tooltip").popover();
            });
        });
    }  else if (adminPageName == 'cmsForm') {
        var gptWidgetSettings = {
            descriptionWrapper: $("#cms_page_content"),
            descriptionEditorPrefix: 'cms_page_content_',
            descriptionWrapperSelector: '#cms_page_content',
            nameWrapper: $('label[for="category_name"] + div'),
            nameWrapperSelector: 'label[for=\'category_name\'] + div',
            nameEditorPrefix: 'cms_page_title_',
        };
        if (isLegacyController) {
            gptWidgetSettings.descriptionWrapper = $("#content_" + (new ChatGptContent).getPageLanguageId())
                .closest('.translatable-field')
                .parent()
                .addClass('cms-description-wrapper');
            gptWidgetSettings.descriptionWrapperSelector = '.cms-description-wrapper';
            gptWidgetSettings.descriptionEditorPrefix = 'content_';
            gptWidgetSettings.nameWrapper = $("#name_" + (new ChatGptContent).getPageLanguageId())
                .closest('.translatable-field')
                .parent()
                .addClass('cms-name-wrapper');
            gptWidgetSettings.nameWrapperSelector = '.cms-name-wrapper';
            gptWidgetSettings.nameEditorPrefix = 'name_';
        }

        if (!gptShopInfo.subscription || gptShopInfo.subscription.availablePageWords == 0) {
            var alertMessage = '';
            if (!gptShopInfo.subscription || !gptShopInfo.subscription.plan) {
                alertMessage = gptI18n.subscriptionNotAvaialable;
            } else if (gptShopInfo.subscription.plan.productWords == 0) {
                alertMessage = gptI18n.subscriptionPlanNoFeature;
            }  else if (gptShopInfo.subscription.availablePageWords == 0) {
                alertMessage = gptI18n.subscriptionLimitЕxceeded;
            }
            renderAlertMessage(alertMessage, gptWidgetSettings.descriptionWrapper);
            return;
        }

        var contentAction = (new ChatGptAction({
            id: "gpt_description_button",
            title: gptI18n.buttonName,
            type: 'single'
        }))
            .renderInto(gptWidgetSettings.descriptionWrapper);

        if (gptShopInfo.subscription.plan.customRequest) {
            renderCustomRequestForm(gptWidgetSettings.descriptionWrapper, {
                contentEditorPreffix: gptWidgetSettings.descriptionEditorPrefix,
                entity: 'page',
            });
        }
        if (gptLanguages.length > 1) {
            // define wrapper for translate action
            var translateWrapper = $("#" + gptWidgetSettings.nameEditorPrefix + (new ChatGptContent).getPageLanguageId()).closest('.input-container');
            if (isLegacyController) {
                translateWrapper = $("#" + gptWidgetSettings.nameEditorPrefix + (new ChatGptContent).getPageLanguageId())
                    .closest('.form-group');
            }
            // translate page title button
            var translateTitleObject = new ChatGptTranslateAction({
                entity: 'page',
                languages: gptLanguages,
                contentEditorPreffix: gptWidgetSettings.nameEditorPrefix,
                title: gptI18n.buttonTranslate,
                type: 'single'
            })
                .renderInto(translateWrapper, false);

            translateTitleObject.getButton().on('click', translateEventHandler);

            // translate page content button
            var translatePageContentObject = new ChatGptTranslateAction({
                entity: 'page',
                languages: gptLanguages,
                wrapperSelector: gptWidgetSettings.descriptionWrapperSelector,
                contentEditorPreffix: gptWidgetSettings.descriptionEditorPrefix,
                buttonClass: 'btn btn-primary ml-2',
                type: 'button',
                title: gptI18n.buttonTranslate
            })
                .renderInto($('.gpt-description-wraper'), false);

            translatePageContentObject.getButton().on('click', translateEventHandler);
        }

        contentAction.getButton().on('click', function (e) {
            e.preventDefault();

            descriptionModal.setHeader(gptI18n.titlePageConentGeneration)
            .setBody(
                '<div>' + ChatGptForm.descriptionForm() + '</div>'
            ).setActions([])
            .addAction({
                title: gptI18n.buttonCancel,
                class: 'btn btn-outline-secondary'
            }, function (cancelButton) {
                cancelButton.getModal().destroy();
            }).addAction({
                title: gptI18n.buttonRegenerate,
            }, async function (actionInstance) {
                // define bulk options
                var options = {
                    replace: +$("#allow_gen_content_0").is(':checked'),
                    skipExistingContent: 0,
                    maxWords: +$("#gpt_description_length").val(),
                    languages: [],
                };
                // define selected languages
                $('.gpt-languages-list').each(function () {
                    var value = +($(this).is(':checked') ? this.value : 0);
                    if (value != 0 && options.languages.indexOf(value) == -1) {
                        options.languages.push(value);
                    }
                });

                if (isNaN(options.maxWords) || options.maxWords < gptPageSettings[adminPageName].minWords) {
                    alert(gptI18n.maxWordsNotValid.replace('%min_words%', gptPageSettings[adminPageName].minWords));
                    return;
                }

                if (options.languages.length == 0) {
                    alert(gptI18n.pleaseSelectLanguages);
                    return;
                }

                var content = new ChatGptContent(),
                    pageName = '';

                ChatGptContent.renderLoaderlayer($('body'));
                
                for (var langIndex = 0; langIndex < options.languages.length; langIndex ++) {
                    try {
                        options.idLang = options.languages[langIndex];
                        pageName = $("#" + gptWidgetSettings.nameEditorPrefix + options.idLang).val();

                        var pageContent = await content.getPageContent(pageName, options, true);

                        if (typeof pageContent.inQueue != 'undefined' && pageContent.inQueue) {
                            pageContent = await content.awaitRequestResponse(pageContent.requestId);

                            // display error message if the request is failure
                            if (pageContent && pageContent.status != 'success') {
                                if (pageContent.status == 'quota_over') {
                                    var errorMessage = gptI18n.subscriptionLimitЕxceeded;
                                } else {
                                    var errorMessage = pageContent.text;
                                }

                                handleModalError(
                                    actionInstance.getModal(),
                                    'Language: ' + content.getLanguageById(options.languages[langIndex]).name + '<br/>' + errorMessage
                                );

                                ChatGptContent.removeLoaderLayer();
                                return;
                            }
                        }

                        if (pageContent && pageContent.text) {
                            var text = content.convertTextToHtml(pageContent.text);
                            if (options.replace == false) {
                                var existingContent = content.getContentFromEditor(document.getElementById(gptWidgetSettings.descriptionEditorPrefix + options.languages[langIndex]), 'html');
                                text = (!!existingContent ? existingContent : '') + text;
                            }
                            content.setContentIntoEditor(
                                text,
                                {format: 'html'},
                                tinymce.get(gptWidgetSettings.descriptionEditorPrefix + options.idLang)
                            );

                            window.showSuccessMessage('Language: ' + content.getLanguageById(options.languages[langIndex]).iso_code.toUpperCase() + ': ' + gptI18n.successMessage.replace(/\%words\%/g, pageContent.nbWords));
                        }
                    } catch (err) {
                        ChatGptContent.removeLoaderLayer();
                        handleModalError(
                            actionInstance.getModal(),
                            'Language: ' + content.getLanguageById(options.languages[langIndex]).name + '<br/>' + err
                        );
                        return;
                    }
                }
                ChatGptContent.removeLoaderLayer();
                actionInstance.getModal().destroy();
            });

            descriptionModal.open(function () {
                // init tooltips
                $(".gpt-tooltip").popover();
            });
        });
    }
});
