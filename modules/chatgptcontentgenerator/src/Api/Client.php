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
namespace PrestaShop\Module\Chatgptcontentgenerator\Api;

if (!defined('_PS_VERSION_')) {
    exit;
}

use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\CategoryTrait;
use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\CustomRequestTrait;
use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\ModuleTrait;
use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\PageTrait;
use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\ProductTrait;
use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\ShopTrait;
use PrestaShop\Module\Chatgptcontentgenerator\Api\Traits\TextTrait;

class Client
{
    use ProductTrait;
    use CategoryTrait;
    use PageTrait;
    use TextTrait;
    use CustomRequestTrait;
    use ShopTrait;
    use ModuleTrait;

    const ENDPOINT = 'https://saas.softsprint.net/gpt/api';
    const APIHOST = 'https://saas.softsprint.net/gpt';

    /**
     * @var string
     */
    private $shopUid;

    /**
     * @var string
     */
    private $shopToken = '';

    public function __construct($shopUid)
    {
        $this->shopUid = $shopUid;
    }

    /**
     * @param string $shopUid
     */
    public function setShopUid($shopUid)
    {
        $this->shopUid = $shopUid;
        return $this;
    }

    /**
     * @param string $shopToken
     */
    public function setToken($shopToken)
    {
        $this->shopToken = $shopToken;
        return $this;
    }

    /**
     * Send post request to the API
     *
     * @param string $uri
     *
     * @return array
     */
    public function sendPostRequest($uri, array $body = [])
    {
        return $this->sendRequest($uri, 'POST', $body);
    }

    /**
     * @param string $url
     * @param string $method
     * @param array $body
     * @return bool|string
     */
    private function sendRequest(string $uri, string $method = 'GET', array $body = [])
    {
        $headers = [
            'Content-Type: application/x-www-form-urlencoded',
        ];

        // set emppty string for the null fields
        foreach ($body as $field => $value) {
            if (is_null($value)) {
                $body[$field] = '';
            }
        }

        if (!isset($body['modelAi'])) {
            $body['modelAi'] = 'chatgpt';
        }

        // $body['shopToken'] = $this->shopToken;
        $body['module'] = 'chatgptcontentgenerator';

        // generate token
        $keys = array_keys($body);

        $n = rand(0, strlen($this->shopToken) - 1);
        $bytes = bin2hex(random_bytes(rand(5, 10)));

        asort($keys);
        $token = hash('sha256', $this->shopToken . implode('.', $keys) . $this->shopToken);
        $arr = explode($this->shopToken[$n], $this->shopToken);
        $arr = array_reverse($arr);
        $arr = implode('.', $arr) . '.' . $bytes;

        $token = base64_encode($body['module'] . ':' . base64_encode($this->shopToken[$n]) . ':' . $arr . ':' . $token);

        $body = http_build_query($body);

        $headers[] = 'Authorization: Bearer ' . $token;

        $uri = '/' . ltrim($uri, '/');

        $curlInfo = [
            CURLOPT_URL => self::ENDPOINT . $uri,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 180,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
        ];

        if (empty($body)) {
            unset($curlInfo[CURLOPT_POSTFIELDS]);
        }

        $curl = curl_init();
        curl_setopt_array($curl, $curlInfo);
        $response = curl_exec($curl);
        curl_close($curl);
        return $this->handleResponseContent($response);
    }

    /**
     * Handle response content
     *
     * @param string $response
     *
     * @return array
     */
    private function handleResponseContent($response)
    {
        $response = json_decode($response, true);
        if (!is_array($response)) {
            return [
                'success' => false,
                'error' => [
                    'message' => 'Unknown response',
                ],
            ];
        }

        return $response;
    }

    /**
     * Get host api url
     *
     * @return string
     */
    public static function getApiHostUrl()
    {
        return self::APIHOST;
    }

    /**
     * Get server address
     *
     * @return string
     */
    public static function getServerIp()
    {
        return isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';
    }
}
