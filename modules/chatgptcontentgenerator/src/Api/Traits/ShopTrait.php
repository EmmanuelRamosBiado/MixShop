<?php
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
*/
namespace PrestaShop\Module\Chatgptcontentgenerator\Api\Traits;

if (!defined('_PS_VERSION_')) {
    exit;
}

use Employee;
use Shop;

trait ShopTrait
{
    public function associateShop($shopUid, $shopToken, Shop $shop, Employee $employee = null)
    {
        if (trim($shopUid) === '') {
            throw new \Exception('The shopUid is empty');
        }

        if (trim($shopToken) === '') {
            throw new \Exception('The shopToken is empty');
        }

        $params = [
            'shopUid' => trim($shopUid),
            'token' => trim($shopToken),
            'domain' => $shop->domain,
            'name' => $shop->name,
            'url' => $shop->getBaseURL(true, true),
            'employee' => [
                'firstname' => ($employee ? $employee->firstname : ''),
                'lastname' => ($employee ? $employee->lastname : ''),
                'email' => ($employee ? $employee->email : ''),
            ],
        ];

        $response = $this->sendRequest(
            '/shop/associate-prestashop',
            'POST',
            $params
        );

        if ($response['success'] == false) {
            throw new \Exception($response['error']['message']);
        }

        return $response['success'];
    }

    public function getShopInfo($shopUid = null, $shopToken = null)
    {
        if (is_null($shopUid)) {
            $shopUid = $this->shopUid;
        }
        if (is_null($shopToken)) {
            $shopToken = $this->shopToken;
        }

        if (trim($shopUid) === '') {
            throw new \Exception('The shopUid is empty');
        }

        if (trim($shopToken) === '') {
            throw new \Exception('The shopToken is empty');
        }

        $response = $this->sendRequest(
            '/shop/get-info',
            'POST',
            [
                'shopUid' => trim($shopUid),
                'token' => trim($shopToken),
            ]
        );

        if ($response['success'] == false) {
            throw new \Exception($response['error']['message']);
        }

        return $response['shop'];
    }
}
