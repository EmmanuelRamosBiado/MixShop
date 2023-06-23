{*
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
*}

<script src="{$urlAccountsCdn|escape:'htmlall':'UTF-8'}" rel="preload"></script>
<script src="{$urlBilling|escape:'htmlall':'UTF-8'}" rel="preload"></script>
{if isset($urlCloudsync)}
    <script src="{$urlCloudsync|escape:'htmlall':'UTF-8'}"></script>
{/if}

<script>
    /*********************
    * PrestaShop Account *
    * *******************/
    window?.psaccountsVue?.init();

    if (window.psaccountsVue.isOnboardingCompleted()) {
        document.getElementById('module-step-1').classList.add('completed');
    } else {
        document.getElementById('module-step-1').classList.add('current');
        setModuleStatus('installed');
    }

    // CloudSync
    const cdc = window.cloudSyncSharingConsent;
    cdc.init('#prestashop-cloudsync');
    cdc.on('OnboardingCompleted', function (isCompleted) {
        if (isCompleted) {
            displayModuleConfigurationsForm();
            document.getElementById('module-step-3').classList.add('current');
            document.getElementById('module-step-2').classList.add('completed');
            document.getElementById('module-step-2').classList.remove('current');
            setModuleStatus('data_shared');
        } else {
            // hide billing panel
            document.getElementById('ps-billing').innerHTML = '';
            // hide configuration form
            // document.getElementById('gpt_configuration_form').style.display = 'none';
            // hide plan limits panel
            document.getElementById('form-subscription-plan-used-limits').style.display = 'none';
            document.getElementById('module-step-2').classList.add('current');
            document.getElementById('module-step-2').classList.remove('completed');
            document.getElementById('module-step-3').classList.remove('completed');
            document.getElementById('module-steps').style.display = 'block';
        }
    });
    cdc.isOnboardingCompleted(function (isCompleted) {
        if (isCompleted) {
            displayModuleConfigurationsForm();
            document.getElementById('module-step-2').classList.add('completed');
        } else if (window.psaccountsVue.isOnboardingCompleted()) {
            document.getElementById('module-step-2').classList.add('current');
        }
    });

    function setModuleStatus(status) {
        (new ChatGptModule({
            endPoint: backendEndpointUrl,
            version: gptModuleVersion
        }))
        .setModuleStatus(status);
    }

    function displaySubscriptionStatistic() {
        (new ChatGptModule({
            endPoint: backendEndpointUrl,
        }))
        .displaySubscriptionUsage(
            document.getElementById('table-subscription-plan-used-limits') &&
            document.getElementById('table-subscription-plan-used-limits').getElementsByTagName('tbody')[0],
            function (module, xhr) {
                document.getElementById('form-subscription-plan-used-limits').style.display = 'block';

                var errorMessage = '{l s='ChatGPT response is unknown!' d='Modules.Chatgptcontentgenerator.Admin' js=1}';
                var response = {
                    host: gptApiHost,
                    ip: '',
                    shop_url: window.location.origin + window.location.pathname,
                    version: gptModuleVersion,
                };
                try {
                    response = JSON.parse(xhr.responseText);
                    if (response.success == true) {
                        return;
                    }
                    errorMessage = response.error.message;
                } catch (err) {}

                var form = ChatGptModule.renderFormErrorReport(
                    (!!response ? response.host : gptApiHost),
                    [
                        {
                            name: 'action',
                            value: 'getShopInfo',
                        },
                        {
                            name: 'error',
                            value: errorMessage,
                        },
                        {
                            name: 'server_ip',
                            value: !!response.ip ? response.ip : gptServerIp,
                        },
                        {
                            name: 'shop_url',
                            value: !!response.shop_url ? response.shop_url : '',
                        },
                        {
                            name: 'version',
                            value: !!response.version ? response.version : '',
                        },
                        {
                            name: 'psversion',
                            value: gptSiteVersion
                        },
                        {
                            name: 'email',
                            value: !!response.email ? response.email : '',
                        },
                        {
                            name: 'full_name',
                            value: !!response.full_name ? response.full_name : '',
                        },
                    ],
                    '<b>link</b>'
                );

                var div = document.createElement('div');
                var psaccounts = document.getElementById('psaccounts');
                var wrapper = psaccounts.parentNode;
                wrapper.insertBefore(div, psaccounts);
                div.innerHTML = '<div class="alert alert-danger mt-2" role="alert">' +
                        '<div class="alert-text">' + errorMessage + '<br/>Click the ' + form + ' to send the report</div>' +
                    '</div>';
            }
        );
    }

    // display configurations form
    function displayModuleConfigurationsForm () {
        // document.getElementById('gpt_configuration_form').style.display = 'block';

        if (hasSubscription) {
            document.getElementById('module-step-3').classList.add('completed');
            // document.getElementById('module-steps').style.display = 'none';
            document.getElementById('module-step-3').classList.remove('current');
        }

        var gptModuleInstance = new ChatGptModule({
                endPoint: backendEndpointUrl
            });

        if (typeof isShopAssociated == 'undefined' || !isShopAssociated) {
            gptModuleInstance.associateShop(function (moduleObject, xhr) {
                if (xhr && xhr.status == 200) {
                    displaySubscriptionStatistic();
                }
            });
        } else {
            displaySubscriptionStatistic();
        }

        // cleaning billing panel
        document.getElementById('ps-billing').innerHTML = '';

        /*********************
        * PrestaShop Billing *
        * *******************/
        window.psBilling.initialize(window.psBillingContext.context, '#ps-billing', '#ps-modal', function (type, data) {
            // Event hook listener
            switch (type) {
                // Hook triggered when PrestaShop Billing is initialized
                case window.psBilling.EVENT_HOOK_TYPE.BILLING_INITIALIZED:
                    console.log('Billing initialized', data);
                    break;
                // Hook triggered when the subscription is created or updated
                case window.psBilling.EVENT_HOOK_TYPE.SUBSCRIPTION_UPDATED:
                    document.getElementById('module-step-3').classList.add('completed');
                    setModuleStatus('subscribed');
                    document.getElementById('module-steps').style.display = 'none';
                    displaySubscriptionStatistic();
                    break;
                // Hook triggered when the subscription is cancelled
                case window.psBilling.EVENT_HOOK_TYPE.SUBSCRIPTION_CANCELLED:
                    displaySubscriptionStatistic();
                    break;
            }
        });
    }
</script>