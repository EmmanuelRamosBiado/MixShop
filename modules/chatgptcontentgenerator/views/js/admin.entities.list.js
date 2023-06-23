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

    if (adminPageName == 'productsList' || adminPageName == 'categoriesList') {
        var bulkAction = new ChatGptModalBulkAction({
            title: '<i class="material-icons">receipt</i> ' + gptI18n.bulkButtonName,
            class: 'dropdown-item'
        }, function (bulkActionButton) {
            var modal = new ChatGptModal({
                closable: false,
                keyboard: false,
                backdrop: false,
                class: 'black-modal modal-with-tabs'
            });
            
            bulkActionButton.setModal(modal);
            modal
                .setHeader(gptI18n.bulkGeneratingDescription)
                .setBody(ChatGptForm.descriptionForm())
                .addAction({
                        title: gptI18n.buttonCancel,
                        class: 'btn btn-outline-secondary'
                    }, function (actionInstance) {
                        actionInstance.getModal().destroy();
                    })
                .addAction({
                        title: gptI18n.buttonRegenerate,
                    }, async function (actionInstance) {
                        // define bulk options
                        var options = {
                            replace: +$("#allow_gen_content_0").is(':checked'),
                            skipExistingContent: +$("#skip_existing_content_1").is(':checked'),
                            maxWords: +$("#gpt_description_length").val(),
                            languages: [],
                            useProductCategory: +$("#use_product_category_1").is(':checked'),
                            useProductBrand: +$("#use_product_brand_1").is(':checked'),
                            useProductEan: +$("#use_product_ean_1").is(':checked'),
                            contentType: $('input[name="desc_or_characteristics"]:checked').val(),
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
                        
                        var contentInstance = new ChatGptContent();                        
                        var items = [];
                        var inputs = $('<input value="0" />');
                        if (adminPageName == 'productsList') {
                            inputs = $('input:checked[name="bulk_action_selected_products[]"]', $('#product_catalog_list'));
                        } else {
                            inputs = $('input:checked[name="category_id_category[]"]', $('#category_grid_table'));
                            if (isLegacyController) {
                                inputs = $('input:checked[name="categoryBox[]"]', $('#table-category'));
                            }
                        }

                        inputs.each(function () { items.push(+this.value); });

                        if (items.length == 0) {
                            alert(gptI18n.pleaseSelectItems);
                            return;
                        }

                        var modal = actionInstance.getModal();
                        modal.find('body').html(
                            '<div>' +
                                '<span>Generating in progress...</span>' +
                                '<span id="process_generate_status" style="color: darkred;"></span>' +
                                '<div class="progress mt-2" style="width: 100%">' +
                                    '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: 0%">' +
                                        '<span>0 %</span>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="process_generate_error_log" class="alert alert-danger mt-2" style="display: none;"><p class="alert-text"></p></div>' +
                                '<div id="process_generate_success_log" class="alert alert-success mt-2" style="display: none;"><p class="alert-text"></p></div>' +
                            '</div>'
                        );

                        modal
                            .setActions([])
                            .addAction({
                                    title: gptI18n.buttonCancel,
                                    class: 'btn btn-outline-secondary'
                                }, function (actionInstance) {
                                    contentInstance.stopCurrentProcess();
                                    actionInstance.getModal().find('#process_generate_status').text(gptI18n.textCanceled);
                                    
                                    actionInstance
                                        .getModal()
                                        .setActions([])
                                        .addAction({
                                                title: gptI18n.buttonClose,
                                                class: 'btn btn-outline-secondary'
                                            }, function (actionInstance) {
                                                actionInstance.getModal().destroy();
                                            })
                                        .renderActions();
                                })
                            .renderActions();

                        var functionName = 'bulkProductDescription';
                        if (adminPageName == 'categoriesList') {
                            functionName = 'bulkCategoryDescription';
                        }

                        await contentInstance[functionName](items, options, async function (idObject, itemIndex, response, languageId, languageIndex, instance) {
                            var progressBar = modal.find('.progress-bar'),
                                itemsCount = items.length,
                                totalRequest = (items.length * options.languages.length);
                            
                            if (typeof response.success != 'undefined' && !response.success) {
                                instance.stopCurrentProcess();
                                progressBar.removeClass('progress-bar-success');
                                progressBar.addClass('progress-bar-danger');
                                modal.find('#process_generate_status').text(gptI18n.bulkGenerationProcessFail);
                                modal.find("#process_generate_error_log").show().text(response.error.message);
                                
                                // render close button
                                modal
                                    .setActions([])
                                    .addAction({
                                            title: gptI18n.buttonClose,
                                            class: 'btn btn-outline-secondary'
                                        }, function (actionInstance) {
                                            actionInstance.getModal().destroy();
                                        })
                                    .renderActions();

                                return;
                            } else if (typeof response.success != 'undefined' && response.success) {
                                var inQueue = false;
                                if (adminPageName == 'categoriesList') {
                                    inQueue = response.categories[0].inQueue;
                                } else if (adminPageName == 'productsList') {
                                    inQueue = response.products[0].inQueue;
                                }
                                if (inQueue) {
                                    var requestId = 0;
                                    if (adminPageName == 'categoriesList') {
                                        requestId = response.categories[0].requestId;
                                    } else if (adminPageName == 'productsList') {
                                        requestId = response.products[0].requestId;
                                    }

                                    // await complete response
                                    requestInfo = await instance.awaitRequestResponse(requestId);
                                    // check request info
                                    if (requestInfo) {
                                        if (requestInfo.status != 'success') {
                                            // if the request sattus is not success then display the error
                                            instance.stopCurrentProcess();
                                            progressBar.removeClass('progress-bar-success');
                                            progressBar.addClass('progress-bar-danger');
                                            modal.find('#process_generate_status').text(gptI18n.bulkGenerationProcessFail);
                                            // modal.find("#process_generate_error_log").show().text(requestInfo.text);
                                            if (requestInfo.status == 'quota_over') {
                                                modal.find("#process_generate_error_log").show().text(gptI18n.subscriptionLimitЕxceeded);
                                            } else {
                                                window.showErrorMessage(requestInfo.text);
                                                modal.find("#process_generate_error_log").show().text(requestInfo.text);
                                            }

                                            // render close button
                                            modal
                                                .setActions([])
                                                .addAction({
                                                        title: gptI18n.buttonClose,
                                                        class: 'btn btn-outline-secondary'
                                                    }, function (actionInstance) {
                                                        actionInstance.getModal().destroy();
                                                    })
                                                .renderActions();

                                            return;
                                        } else if (requestInfo.text) {
                                            // set description
                                            await instance.setDescription(
                                                (adminPageName == 'categoriesList' ? response.categories[0].idCategory : response.products[0].idProduct),
                                                (adminPageName == 'categoriesList' ? 'category' : 'product'),
                                                requestInfo.text,
                                                options.replace,
                                                false, // translate
                                                languageId
                                            );
                                        }
                                    }
                                }
                            }

                            var completedRequests = options.languages.length * itemIndex + (languageIndex + 1);
                            progressBar.css('width', `${completedRequests * 100 / totalRequest}%`);
                            progressBar.find('span').html(`${(itemIndex+1)} / ${itemsCount} (${(completedRequests * 100 / totalRequest).toFixed(2)}%)`);

                            if ((completedRequests * 100 / totalRequest) >= 100) {
                                modal
                                    .setActions([])
                                    .addAction({
                                            title: gptI18n.buttonClose,
                                            class: 'btn btn-outline-secondary'
                                        }, function (actionInstance) {
                                            window.location.reload();
                                            actionInstance.getModal().destroy();
                                        })
                                    .renderActions();

                                modal.find('#process_generate_success_log').show().text(gptI18n.bulkGenerationProcessCompleted);
                            }
                        });
                    })
                .open(function () {
                    // init tooltips
                    $(".gpt-tooltip").popover();
                });
        });

        /** translate description action */
        var bulkTranslationMenu =  new ChatGptModalBulkAction({
            title: '<i class="material-icons">translate</i> ' + gptI18n.bulkTranslateButtonName,
            class: 'dropdown-item'
        }, function (bulkActionButton) {
            var modal = new ChatGptModal({
                closable: false,
                keyboard: false,
                backdrop: false,
                class: 'black-modal'
            });

            bulkTranslationMenu.setModal(modal);
            modal
                .setHeader(gptI18n.bulkTranslatingDescription)
                .setBody(ChatGptForm.traslationForm())
                .addAction({
                        title: gptI18n.buttonCancel,
                        class: 'btn btn-outline-secondary'
                    }, function (cancelButton) {
                        cancelButton.getModal().destroy();
                    })
                .addAction({
                        title: gptI18n.buttonTranslate,
                    }, async function (translateButton) {
                        // define bulk settings
                        var options = {
                            replace: true,
                            skipExistingContent: +$("#skip_existing_content_1").is(':checked'),
                            originLanguageId: +$('input[name="origin_language"]:checked').val(),
                            targetLanguages: [],
                            entity: (adminPageName == 'categoriesList' ? 'category' : 'product'),
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
                        
                        var entities = [];
                        var inputs = $('<input value="0" />');
                        if (adminPageName == 'productsList') {
                            inputs = $('input:checked[name="bulk_action_selected_products[]"]', $('#product_catalog_list'));
                        } else {
                            inputs = $('input:checked[name="category_id_category[]"]', $('#category_grid_table'));
                            if (isLegacyController) {
                                inputs = $('input:checked[name="categoryBox[]"]', $('#table-category'));
                            }
                        }

                        inputs.each(function () { entities.push(+this.value); });

                        if (entities.length == 0) {
                            alert(gptI18n.pleaseSelectItems);
                            return;
                        }

                        var modal = translateButton.getModal();
                        modal.find('body').html(
                            '<div>' +
                                '<span>Translating in progress...</span>' +
                                '<span id="process_translate_status" style="color: darkred;"></span>' +
                                '<div class="progress mt-2" style="width: 100%">' +
                                    '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: 0%">' +
                                        '<span>0 %</span>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="process_translate_error_log" class="alert alert-danger mt-2" style="display: none;"><p class="alert-text"></p></div>' +
                                '<div id="process_translate_success_log" class="alert alert-success mt-2" style="display: none;"><p class="alert-text"></p></div>' +
                            '</div>'
                        );

                        var contentInstance = new ChatGptContent();

                        modal
                            .setActions([])
                            .addAction({
                                    title: gptI18n.buttonCancel,
                                    class: 'btn btn-outline-secondary'
                                }, function (cancelButton) {
                                    contentInstance.stopCurrentProcess();
                                    cancelButton.getModal().find('#process_translate_status').text(gptI18n.textCanceled);
                                    
                                    cancelButton
                                        .getModal()
                                        .setActions([])
                                        .addAction({
                                                title: gptI18n.buttonClose,
                                                class: 'btn btn-outline-secondary'
                                            }, function (closeButton) {
                                                closeButton.getModal().destroy();
                                            })
                                        .renderActions();
                                })
                            .renderActions();

                        function handleTranslationError (errorMessage) {
                            progressBar = modal.find('.progress-bar');
                            progressBar.removeClass('progress-bar-success');
                            progressBar.addClass('progress-bar-danger');
                            modal.find('#process_translate_status').text(gptI18n.bulkTranslationProcessFail);
                            modal.find("#process_translate_error_log").show().text(errorMessage);

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

                        try {
                            await contentInstance.bulkTranslateObjects(entities, options, async function (idObject, itemIndex, response, languageId, languageIndex, instance) {
                                var progressBar = modal.find('.progress-bar'),
                                    itemsCount = entities.length,
                                    totalRequest = (entities.length * options.targetLanguages.length);
                                
                                if (typeof response.success != 'undefined' && !response.success) {
                                    instance.stopCurrentProcess();

                                    handleTranslationError(response.error.message);
                                    return;
                                } else if (typeof response.success != 'undefined' && response.success) {
                                    var inQueue = response.objects[0].inQueue;

                                    if (inQueue) {
                                        try {
                                            // await complete response
                                            requestInfo = await instance.awaitRequestResponse(response.objects[0].requestId);
                                        } catch (err) {
                                            window.showErrorMessage(err);
                                            return;
                                        };

                                        // check request info
                                        if (requestInfo) {
                                            if (requestInfo.status != 'success') {
                                                // if the request sattus is not success then display the error
                                                instance.stopCurrentProcess();
                                                
                                                if (requestInfo.status == 'quota_over') {
                                                    handleTranslationError(gptI18n.subscriptionLimitЕxceeded);
                                                } else {
                                                    handleTranslationError(requestInfo.text);
                                                }
                                                return;
                                            } else if (requestInfo.text) {
                                                // set description
                                                await instance.setDescription(
                                                    response.objects[0].idObject,
                                                    options.entity,
                                                    requestInfo.text,
                                                    options.replace,
                                                    true, // translate
                                                    languageId
                                                );
                                            }
                                        }
                                    }
                                }

                                var completedRequests = options.targetLanguages.length * itemIndex + (languageIndex + 1);

                                progressBar.css('width', `${completedRequests * 100 / totalRequest}%`);
                                progressBar.find('span').html(`${(itemIndex+1)} / ${itemsCount} (${(completedRequests * 100 / totalRequest).toFixed(2)}%)`);

                                if ((completedRequests * 100 / totalRequest) >= 100) {
                                    modal
                                        .setActions([])
                                        .addAction({
                                                title: gptI18n.buttonClose,
                                                class: 'btn btn-outline-secondary'
                                            }, function (closeButton) {
                                                window.location.reload();
                                                closeButton.getModal().destroy();
                                            })
                                        .renderActions();

                                    modal.find('#process_translate_success_log').show().text(gptI18n.bulkTranslationProcessCompleted);
                                }
                            });
                        } catch (err) {
                            handleTranslationError(err);
                        }
                    })
            ;

            modal.open();
        });
        /** END translate description action */

        /** translate title action */
        var bulkTitleTranslationMenu =  new ChatGptModalBulkAction({
            title: '<i class="material-icons">translate</i> ' + gptI18n.bulkTitleTranslateButtonName,
            class: 'dropdown-item'
        }, function (bulkActionButton) {
            var modal = new ChatGptModal({
                closable: false,
                keyboard: false,
                backdrop: false,
                class: 'black-modal'
            });

            bulkTitleTranslationMenu.setModal(modal);
            modal
                .setHeader(gptI18n.bulkTranslatingTitle)
                .setBody(ChatGptForm.traslationTitleForm())
                .addAction({
                        title: gptI18n.buttonCancel,
                        class: 'btn btn-outline-secondary'
                    }, function (cancelButton) {
                        cancelButton.getModal().destroy();
                    })
                .addAction({
                        title: gptI18n.buttonTranslate,
                    }, async function (titleTranslateButton) {
                        // define bulk settings
                        var options = {
                            replace: true,
                            skipExistingContent: +$("#skip_existing_content_1").is(':checked'),
                            originLanguageId: +$('input[name="origin_language"]:checked').val(),
                            targetLanguages: [],
                            entity: (adminPageName == 'categoriesList' ? 'category' : 'product'),
                            field: 'name', // set field name which will be translated
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
                        
                        var entities = [];
                        var inputs = $('<input value="0" />');
                        if (adminPageName == 'productsList') {
                            inputs = $('input:checked[name="bulk_action_selected_products[]"]', $('#product_catalog_list'));
                        } else {
                            inputs = $('input:checked[name="category_id_category[]"]', $('#category_grid_table'));
                            if (isLegacyController) {
                                inputs = $('input:checked[name="categoryBox[]"]', $('#table-category'));
                            }
                        }

                        inputs.each(function () { entities.push(+this.value); });

                        if (entities.length == 0) {
                            alert(gptI18n.pleaseSelectItems);
                            return;
                        }

                        var modal = titleTranslateButton.getModal();
                        modal.find('body').html(ChatGptForm.traslationProcess());

                        var contentInstance = new ChatGptContent();

                        modal
                            .setCancelButton(function (cancelButton) {
                                contentInstance.stopCurrentProcess();
                                cancelButton.getModal().find('#process_translate_status').text(gptI18n.textCanceled);
                            });

                        function handleTranslationError (errorMessage) {
                            progressBar = modal.find('.progress-bar');
                            progressBar.removeClass('progress-bar-success');
                            progressBar.addClass('progress-bar-danger');
                            modal.find('#process_translate_status').text(gptI18n.bulkTranslationProcessFail);
                            modal.find("#process_translate_error_log").show().text(errorMessage);

                            // render close button
                            modal.setCloseButton();
                        }

                        try {
                            await contentInstance.bulkTranslateObjects(entities, options, async function (idObject, itemIndex, response, languageId, languageIndex, instance) {
                                var progressBar = modal.find('.progress-bar'),
                                    itemsCount = entities.length,
                                    totalRequest = (entities.length * options.targetLanguages.length);
                                
                                if (typeof response.success != 'undefined' && !response.success) {
                                    instance.stopCurrentProcess();

                                    handleTranslationError(response.error.message);
                                    return;
                                } else if (typeof response.success != 'undefined' && response.success) {
                                    var inQueue = response.objects[0].inQueue;

                                    if (inQueue) {
                                        try {
                                            // await complete response
                                            requestInfo = await instance.awaitRequestResponse(response.objects[0].requestId);
                                        } catch (err) {
                                            window.showErrorMessage(err);
                                            return;
                                        };

                                        // check request info
                                        if (requestInfo) {
                                            if (requestInfo.status != 'success') {
                                                // if the request sattus is not success then display the error
                                                instance.stopCurrentProcess();
                                                
                                                if (requestInfo.status == 'quota_over') {
                                                    handleTranslationError(gptI18n.subscriptionLimitЕxceeded);
                                                } else {
                                                    handleTranslationError(requestInfo.text);
                                                }
                                                return;
                                            } else if (requestInfo.text) {
                                                // set description
                                                await instance.setContent(
                                                    response.objects[0].idObject,
                                                    options.entity,
                                                    options.field,
                                                    requestInfo.text,
                                                    options.replace,
                                                    true, // translate
                                                    languageId
                                                );
                                            }
                                        }
                                    }
                                }

                                var completedRequests = options.targetLanguages.length * itemIndex + (languageIndex + 1);

                                progressBar.css('width', `${completedRequests * 100 / totalRequest}%`);
                                progressBar.find('span').html(`${(itemIndex+1)} / ${itemsCount} (${(completedRequests * 100 / totalRequest).toFixed(2)}%)`);

                                if ((completedRequests * 100 / totalRequest) >= 100) {
                                    modal
                                        .setCloseButton(function () {
                                            window.location.reload();
                                        });

                                    modal.find('#process_translate_success_log').show().text(gptI18n.bulkTranslationProcessCompleted);
                                }
                            });
                        } catch (err) {
                            handleTranslationError(err);
                        }
                    })
            ;

            modal.open();
        });
        /** END translate title action */

        var availableCategoryDescriptionFeature = gptShopInfo.subscription && gptShopInfo.subscription.availableCategoryWords > 0;
        var availableProductDescriptionFeature = gptShopInfo.subscription && gptShopInfo.subscription.availableProductWords > 0;

        if (adminPageName == 'productsList' && availableProductDescriptionFeature) {
            var bulkMenu = $('.bulk-catalog .dropdown-menu');
            if (gptLanguages.length > 1) {
                bulkMenu.prepend($('<div class="dropdown-divider"></div>'));
                bulkTitleTranslationMenu.renderInto(bulkMenu, true);
                bulkTranslationMenu.renderInto(bulkMenu, true);
            }
            bulkMenu.prepend($('<div class="dropdown-divider"></div>'));
            bulkAction.renderInto(bulkMenu, true);
        } else if (adminPageName == 'categoriesList' && availableCategoryDescriptionFeature) {
            if (isLegacyController) {
                var bulkMenu = $("#bulk_action_menu_category").parent().find('ul');
            } else {
                var bulkMenu = $("#category_grid_bulk_action_enable_selection").closest('.dropdown-menu');
            }
            if (gptLanguages.length > 1) {
                bulkMenu.prepend($('<div class="dropdown-divider divider"></div>'));
                if (isLegacyController) {
                    bulkMenu.prepend($('<li id="categories-bulk-item-translation"></li>'));
                    bulkTitleTranslationMenu.renderInto($('#categories-bulk-item-translation'), true);
                    bulkTranslationMenu.renderInto($('#categories-bulk-item-translation'), true);
                } else {
                    bulkTitleTranslationMenu.renderInto(bulkMenu, true);
                    bulkTranslationMenu.renderInto(bulkMenu, true);
                }
            }
            bulkMenu.prepend($('<div class="dropdown-divider divider"></div>'));
            if (isLegacyController) {
                bulkMenu.prepend($('<li id="categories-bulk-item-description"></li>'));
                bulkAction.renderInto($('#categories-bulk-item-description'), true);
            } else {
                bulkAction.renderInto(bulkMenu, true);
            }
        }

        if ((adminPageName == 'productsList' && availableProductDescriptionFeature) || (adminPageName == 'categoriesList' && availableCategoryDescriptionFeature)) {

            function _printLangOptions(selected) {
                var output = '';
                for (var i = 0; i < gptLanguages.length; i++) {
                    output += '<option value="' + gptLanguages[i].id_lang + '"' + (selected.indexOf(gptLanguages[i].id_lang) != -1 ? ' selected="selected"' : '') + ' title="' + gptLanguages[i].name + '">' + gptLanguages[i].iso_code.toUpperCase() + '</option>';
                }
                return output;
            }

            // search table and add new column
            var listTable = $("#product_catalog_list").find('table.table.product');
            var filterColumn = 2,
                headerColumn = 3,
                headerRowCellTagName = 'th';
            if (adminPageName == 'categoriesList') {
                listTable = $("#category_grid_table");
                filterColumn = 3;
                headerColumn = 3;
                headerRowCellTagName = 'td';
            }

            if (isLegacyController == false) {
                // add head could
                $(listTable.find('thead').find('tr.column-headers').find('th').get(headerColumn))
                    .after($('<th scope="col" class="text-center">Content ChatGPT</th>'));
                // add filter cell
                $(listTable.find('thead').find('tr.column-filters').find(headerRowCellTagName).get(filterColumn))
                    .after(
                        $(
                            '<' + headerRowCellTagName + ' class="text-center gpt-select2-wrapper">' +
                                '<select id="generated_langs" name="filter_column_generated_langs[]" data-toggle="select2" multiple="multiple" data-minimumResultsForSearch="-1" class="custom-select gpt-select2" aria-label="generated_langs input">' + _printLangOptions(!!columnGeneratedLangs ? columnGeneratedLangs : []) + '</select>' +
                            '</' + headerRowCellTagName + '>'
                        )
                    );
                if (gptLanguages.length > 1) {
                    // add head could
                    $(listTable.find('thead').find('tr.column-headers').find('th').get(headerColumn+1))
                        .after($('<th scope="col" class="text-center">Tranlsate ChatGPT</th>'));
                    // add filter cell
                    $(listTable.find('thead').find('tr.column-filters').find(headerRowCellTagName).get(filterColumn+1))
                        .after(
                            $(
                                '<' + headerRowCellTagName + ' class="text-center gpt-select2-wrapper">' +
                                    '<select id="trans_langs" name="filter_column_translated_langs[]" data-toggle="select2" multiple="multiple" data-minimumResultsForSearch="-1" class="custom-select gpt-select2" aria-label="trans_langs input">' + _printLangOptions(!!columnTranslatedLangs ? columnTranslatedLangs : []) + '</select>' +
                                '</' + headerRowCellTagName + '>'
                            )
                        );
                }
            } else if (adminPageName == 'categoriesList') {
                // rebuild the gpt columns filter on the legacy list page
                var gptContentSelectFilter = $('select[name="categoryFilter_content_gen!content_generated"]');
                if (gptContentSelectFilter.length) {
                    gptContentSelectFilter
                        .attr('multiple', 'multiple')
                        .attr('name', 'filter_column_generated_langs[]')
                    ;
                    if (!!columnGeneratedLangs) {
                        gptContentSelectFilter.val(columnGeneratedLangs);
                    }
                }

                var gptContentSelectFilter2 = $('select[name="categoryFilter_content_gen!content_translated"]');
                if (gptContentSelectFilter2.length) {
                    gptContentSelectFilter2
                        .attr('multiple', 'multiple')
                        .attr('name', 'filter_column_translated_langs[]')
                    ;
                    if (!!columnTranslatedLangs) {
                        gptContentSelectFilter2.val(columnTranslatedLangs);
                    }
                }
            }

            try {
                (function () {
                    $('.gpt-select2').each(function() {
                        $(this).select2({
                            minimumResultsForSearch: -1,
                            maximumSelectionLength: 20,
                            multiple: true,
                        });
                    })
                })();
            } catch (error) {}

            function _printLangsIso(langs) {
                if (typeof langs == 'string') {
                    langs = langs.split(',');
                }
                // langs.sort();
                var output = [];
                for (var i = 0; i < gptLanguages.length; i++) {
                    if (langs.indexOf(gptLanguages[i].id_lang) != -1) {
                        output.push(gptLanguages[i].iso_code.toUpperCase());
                    }
                }

                return output.join(', ');
            }

            if (adminPageName == 'productsList') {
                if (catalogProductsList.length) {                    
                    listTable.find('tbody > tr').each(function (i) {
                        var langs = !!catalogProductsList[i] && !!catalogProductsList[i].generated_langs !== false ? catalogProductsList[i].generated_langs : false;
                        $($(this).find('td').get(headerColumn)).after($('<td class="text-center">' + (langs ? _printLangsIso(langs) : '---') + '</td>'));
                        if (gptLanguages.length > 1) {
                            langs = !!catalogProductsList[i] && !!catalogProductsList[i].translated_langs !== false ? catalogProductsList[i].translated_langs : false;
                            $($(this).find('td').get(headerColumn+1)).after($('<td class="text-center">' + (langs ? _printLangsIso(langs) : '---') + '</td>'));
                        }
                    });
                    // <i class="material-icons">check</i>
                }
            } else if (adminPageName == 'categoriesList' && isLegacyController == false) {

                if (catalogCategoriesList.length) {

                    listTable.find('tbody > tr').each(function (i) {
                        var langs = !!catalogCategoriesList[i] && !!catalogCategoriesList[i].generated_langs !== false ? catalogCategoriesList[i].generated_langs : false;
                        $($(this).find('td').get(filterColumn)).after($('<td class="text-center">' + (langs ? _printLangsIso(langs) : '---') + '</td>'));
                        if (gptLanguages.length > 1) {
                            langs = !!catalogCategoriesList[i] && !!catalogCategoriesList[i].translated_langs !== false ? catalogCategoriesList[i].translated_langs : false;
                            $($(this).find('td').get(filterColumn+1)).after($('<td class="text-center">' + (langs ? _printLangsIso(langs) : '---') + '</td>'));
                        }
                    });
                }
            }
        }
    }
});
