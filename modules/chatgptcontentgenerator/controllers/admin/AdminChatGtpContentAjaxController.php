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
if (!defined('_PS_VERSION_')) {
    exit;
}

use PrestaShop\Module\Chatgptcontentgenerator\Api\Client;
use PrestaShop\Module\Chatgptcontentgenerator\Entity\GptContentGenerator;
use PrestaShop\Module\Chatgptcontentgenerator\Repository\GptContentGeneratorRepository;

class AdminChatGtpContentAjaxController extends ModuleAdminController
{
    private $apiClient;

    public function init()
    {
        parent::init();

        $this->apiClient = new Client(
            $this->module->getConfigGlobal('SHOP_UID')
        );
        $this->apiClient->setToken($this->module->getConfigGlobal('SHOP_TOKEN'));
    }

    public function ajaxProcessProductDescription()
    {
        $name = trim(Tools::getValue('name'));
        if ($name === '') {
            return $this->module->errorResponse(1, 'Product name is empty');
        }

        $language = $this->context->language;
        if (Tools::getValue('id_language')) {
            $language = new Language((int) Tools::getValue('id_language'));
        }

        $length = Tools::getValue('length');
        if (!is_numeric($length)) {
            $length = 0;
        }

        $use_category = (int) Tools::getValue('use_category', 0);
        $use_brand = (int) Tools::getValue('use_brand', 0);
        $use_ean = (int) Tools::getValue('use_ean', 0);
        $content_type = Tools::getValue('content_type', 'description');

        $idCategoryDefault = (int) Tools::getValue('id_category_default', 0);
        if ($idCategoryDefault == 0) {
            $product = new Product((int) Tools::getValue('id'), false, $language->id);
            $idCategoryDefault = (int) $product->id_category_default;
        }

        $categoryName = null;
        if ($use_category == 1 &&
            $idCategoryDefault &&
            $idCategoryDefault != (int) Configuration::get('PS_HOME_CATEGORY')) {
            // get parent categories
            $parentCategories = (new Category($idCategoryDefault, $language->id))
                ->getParentsCategories($language->id);
            if ($parentCategories) {
                // define categories line
                $parentCategories = array_reverse($parentCategories);
                $categoryName = trim(implode(' > ', array_filter(array_column($parentCategories, 'name'))));
            }
        }

        $brandName = null;
        if ($use_brand == 1) {
            // get product brand name
            $brandName = (new Manufacturer((int) Tools::getValue('id_manufacturer')))->name;
        }

        $productEan = null;
        if ($use_ean == 1) {
            // get product ean
            $product = new Product((int) Tools::getValue('id'), false, $language->id);
            $productEan = $product->id ? trim($product->ean13) : null;
        }

        try {
            if ($content_type == 'characteristics') {
                $description = $this->apiClient->productCharacteristics(
                    trim($name),
                    $length,
                    $language->iso_code,
                    $categoryName,
                    $brandName,
                    $productEan
                );
            } else {
                $description = $this->apiClient->productDescription(
                    trim($name),
                    $length,
                    $language->iso_code,
                    $categoryName,
                    $brandName,
                    $productEan
                );
            }

            $repository = GptContentGeneratorRepository::getInstance();
            if ((int) Tools::getValue('id')) {
                $object = $repository->getByProductId((int) Tools::getValue('id'), (int) $language->id);
                if ($object->getId() == 0) {
                    $object->setIdObject((int) Tools::getValue('id'));
                    $object->setObjectType(GptContentGenerator::TYPE_PRODUCT);
                    $object->setIdLang((int) $language->id);
                    $object->setIsGenerated(true);
                    $object->setDateAdd(new DateTime());
                    $repository->save($object);
                }
            }
        } catch (Exception $e) {
            $this->module->jsonExeptionResponse($e);
        }

        $this->module->jsonResponse([
            'text' => $description['text'],
            'nbWords' => (!isset($description['nbWords'])
                ? str_word_count($description['text'])
                : $description['nbWords']),
            'inQueue' => $description['inQueue'],
            'requestId' => $description['requestId'],
        ]);
    }

    public function ajaxProcessCategoryDescription()
    {
        $name = trim(Tools::getValue('name'));
        if ($name === '') {
            return $this->module->errorResponse(2, 'Category name is empty');
        }

        $language = $this->context->language;
        if (Tools::getValue('id_language')) {
            $language = new Language((int) Tools::getValue('id_language'));
        }

        $length = Tools::getValue('length');
        if (!is_numeric($length)) {
            $length = 0;
        }

        try {
            $description = $this->apiClient->categoryDescription(
                $name,
                $length,
                $language->iso_code
            );
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([
            'text' => $description['text'],
            'nbWords' => (!isset($description['nbWords'])
                ? str_word_count($description['text'])
                : $description['nbWords']),
            'inQueue' => $description['inQueue'],
            'requestId' => $description['requestId'],
        ]);
    }

    public function ajaxProcessPageContent()
    {
        $name = trim(Tools::getValue('name'));
        if ($name === '') {
            return $this->module->errorResponse(1, 'Page name is empty');
        }

        $language = $this->context->language;
        if (Tools::getValue('id_language')) {
            $language = new Language((int) Tools::getValue('id_language'));
        }

        $length = Tools::getValue('length');
        if (!is_numeric($length)) {
            $length = 0;
        }

        try {
            $content = $this->apiClient
                ->pageContent($name, $length, $language->iso_code);
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([
            'text' => $content['text'],
            'nbWords' => (!isset($content['nbWords']) ? str_word_count($content['text']) : $content['nbWords']),
            'inQueue' => $content['inQueue'],
            'requestId' => $content['requestId'],
        ]);
    }

    public function ajaxProcessTranslateText()
    {
        $text = trim(Tools::getValue('text'));
        if ($text === '') {
            return $this->module->errorResponse(1, 'The text is empty');
        }

        $fromLangauge = trim(Tools::getValue('fromLangauge'));
        if ($fromLangauge === '') {
            return $this->module->errorResponse(1, 'The origin language is not set');
        }
        $toLanguage = trim(Tools::getValue('toLanguage'));
        if ($toLanguage === '') {
            return $this->module->errorResponse(1, 'The target language is not set');
        }

        try {
            $text = $this->apiClient
                ->translateText($text, $fromLangauge, $toLanguage, Tools::getValue('entity'));
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([
            'text' => $text['text'],
            'nbWords' => (!isset($text['nbWords']) ? str_word_count($text['text']) : $text['nbWords']),
            'inQueue' => $text['inQueue'],
            'requestId' => $text['requestId'],
        ]);
    }

    public function ajaxProcessBulkTranslateText()
    {
        $fromLangauge = trim(Tools::getValue('fromLangauge'));
        if ($fromLangauge === '' || !is_numeric($fromLangauge)) {
            return $this->module->errorResponse(1, 'The origin language is not set or not valid');
        }
        $fromLangauge = new Language((int) $fromLangauge);

        $toLanguages = Tools::getValue('toLanguages');
        if (empty($toLanguages) || !is_array($toLanguages)) {
            return $this->module->errorResponse(1, 'The target language is not set or not valid');
        }

        $entity = trim(Tools::getValue('entity', ''));
        if ($entity === '') {
            return $this->module->errorResponse(1, 'The entity is not set');
        }

        $skip_existing_description = (int) Tools::getValue('skip_existing_description', 0);
        // define filed wtich will be translated
        $field = trim(Tools::getValue('field', 'description'));
        if (!is_string($field) || $field === '') {
            return $this->module->errorResponse(
                5,
                $this->trans(
                    'The field is missing or empty',
                    [],
                    'Modules.Chatgptcontentgenerator.Admin'
                )
            );
        }

        $ids = Tools::getValue('ids');
        if (!is_array($ids)) {
            $ids = [$ids];
        }

        $replace = Tools::getValue('replace', 1);
        if (!is_numeric($replace)) {
            $replace = 1;
        }

        $result = [];
        foreach ($ids as $id) {
            foreach ($toLanguages as $toLanguageId) {
                if (empty($toLanguageId) || !is_numeric($toLanguageId)) {
                    return $this->module->errorResponse(
                        2,
                        $this->trans(
                            'The target language Id is not valid',
                            [],
                            'Modules.Chatgptcontentgenerator.Admin'
                        )
                    );
                }

                $object = $this->getObjectByEntity($id, $toLanguageId, $entity);
                if (!Validate::isLoadedObject($object)) {
                    return $this->module->errorResponse(
                        2,
                        $this->trans(
                            'The %entity% #%id% could not be loaded',
                            ['%id%' => $id, '%entity%' => $entity],
                            'Modules.Chatgptcontentgenerator.Admin'
                        )
                    );
                }

                if (property_exists($object, $field) == false) {
                    return $this->module->errorResponse(
                        4,
                        $this->trans(
                            'The field %field% not exists in the %entity%',
                            ['%field%' => $field, '%entity%' => $entity],
                            'Modules.Chatgptcontentgenerator.Admin'
                        )
                    );
                }

                // get source content
                $sourceObject = $this->getObjectByEntity($id, $fromLangauge->id, $entity);
                $sourceContent = $sourceObject->{$field};

                // ignore objects with not empty content (field)
                // check content (field)
                // check source (field)
                if (
                    ($skip_existing_description && trim($object->{$field}) !== '') ||
                    trim($sourceContent) === ''
                ) {
                    $result[] = [
                        'idObject' => (int) $object->id,
                        'text' => $object->{$field},
                        'nbWords' => str_word_count($object->{$field}),
                        'inQueue' => false,
                        'requestId' => time(),
                    ];
                    continue;
                }

                try {
                    $text = $this->apiClient->translateText(
                        $sourceContent,
                        $fromLangauge->iso_code,
                        (new Language((int) $toLanguageId))->iso_code,
                        $entity
                    );
                    $result[] = [
                        'idObject' => (int) $object->id,
                        'text' => $text['text'],
                        'nbWords' => (!isset($text['nbWords']) ? str_word_count($text['text']) : $text['nbWords']),
                        'inQueue' => $text['inQueue'],
                        'requestId' => $text['requestId'],
                    ];

                    if ($text['inQueue']) {
                        return $this->module->jsonResponse(['objects' => $result]);
                    }

                    $newContent = trim($text['text']);

                    if ($newContent) {
                        // get object to update
                        $object = $this->getObjectByEntity($id, null, $entity);
                        if ($replace) {
                            $object->{$field}[$toLanguageId] = $newContent;
                        } else {
                            $object->{$field}[$toLanguageId] .= $newContent;
                        }

                        if ($object->save()) {
                            $repository = GptContentGeneratorRepository::getInstance();
                            if ($entity == 'product') {
                                $node = $repository->getByProductId($object->id, (int) $toLanguageId);
                            } else {
                                $node = $repository->getByCategoryId($object->id, (int) $toLanguageId);
                            }
                            if ($node->getId() == 0) {
                                $type = ($entity == 'product'
                                    ? GptContentGenerator::TYPE_PRODUCT
                                    : GptContentGenerator::TYPE_CATEGORY);

                                $node->setIdObject((int) $object->id);
                                $node->setIdLang((int) $toLanguageId);
                                $node->setIsGenerated(true);
                                $node->setObjectType($type);
                                $node->setDateAdd(new DateTime());
                            }
                            $node->setIsTranslated(true);
                            $repository->save($node);
                        } else {
                            return $this->module->errorResponse(
                                3,
                                $this->trans(
                                    '%entity% #%id%. Error: %field% could not be updated',
                                    ['%id%' => $product->id, '%entity%' => ucfirst($entity), '%field%' => $field],
                                    'Modules.Chatgptcontentgenerator.Admin'
                                )
                            );
                        }
                    }
                } catch (Exception $e) {
                    return $this->module->errorResponse(
                        $e->getCode(),
                        $this->trans(
                            '%entity% #%id%. Error: %err% ' . $e->getFile() . ':' . $e->getLine() . '<br>' . $e->getTraceAsString(),
                            ['%id%' => $id, '%err%' => $e->getMessage(), '%entity%' => ucfirst($entity)],
                            'Modules.Chatgptcontentgenerator.Admin'
                        )
                    );
                }
            }
        }

        return $this->module->jsonResponse(['objects' => $result]);
    }

    public function ajaxProcessCustomRequest()
    {
        $text = trim(Tools::getValue('text'));
        if ($text === '') {
            return $this->module->errorResponse(1, 'The text is empty');
        }

        try {
            $response = $this->apiClient->customRequest($text, Tools::getValue('entity'));
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([
            'text' => $response['text'],
            'nbWords' => (!isset($response['nbWords']) ? str_word_count($response['text']) : $response['nbWords']),
            'inQueue' => (!isset($response['inQueue']) ? false : $response['inQueue']),
            'requestId' => (!isset($response['requestId']) ? 0 : (int) $response['requestId']),
        ]);
    }

    public function ajaxProcessAssociateShop()
    {
        try {
            $shopUid = $this->module->getShopKeyId();

            if (trim($shopUid) === '') {
                throw new Exception('The shop UID is empty.');
            }

            $shopToken = hash('sha256', $shopUid . '.' . _COOKIE_IV_);
            $this->module->setConfigGlobal('SHOP_TOKEN', $shopToken);

            $client = new Client($shopUid);
            $client
                ->setToken($shopToken)
                ->associateShop($shopUid, $shopToken, $this->context->shop, $this->context->employee);

            $this->module->setConfigGlobal('SHOP_ASSOCIATED', 1);
            $this->module->setConfigGlobal('SHOP_UID', $shopUid);
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([]);
    }

    public function ajaxProcessSetModuleStatus()
    {
        try {
            $status = Tools::getValue('status', '');
            $version = Tools::getValue('version', '');
            $shopUid = $this->module->getShopKeyId();
            $shopToken = hash('sha256', $shopUid . '.' . _COOKIE_IV_);

            $client = new Client($shopUid);
            $client
                ->setToken($shopToken)
                ->setModuleStatus($status, $version, $this->context->shop, $this->context->employee);

            $this->module->setConfigGlobal('SHOP_ASSOCIATED', 1);
            $this->module->setConfigGlobal('SHOP_UID', $shopUid);
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([]);
    }

    public function ajaxProcessGetShopInfo()
    {
        try {
            $shopInfo = (new Client($this->module->getConfigGlobal('SHOP_UID')))
                ->setToken($this->module->getConfigGlobal('SHOP_TOKEN'))
                ->getShopInfo()
            ;
        } catch (Exception $e) {
            return $this->module->jsonResponse([
                'success' => false,
                'error' => [
                    'code' => $e->getCode(),
                    'message' => $e->getMessage(),
                ],
                'host' => Client::getApiHostUrl(),
                'ip' => Client::getServerIp(),
                'shop_url' => $this->context->shop->getBaseURL(true, true),
                'version' => $this->module->version,
                'email' => $this->context->employee->email,
                'full_name' => trim($this->context->employee->firstname . ' ' . $this->context->employee->lastname),
            ]);
        }

        return $this->module->jsonResponse(['shop' => $shopInfo]);
    }

    public function ajaxProcessGetRequestInfo()
    {
        $id = (int) Tools::getValue('id');

        try {
            $requestInfo = $this->apiClient->sendPostRequest('/requests/info/' . $id);

            if (!isset($requestInfo['success'])) {
                throw new Exception('GetRequestInfo #' . $id . '. Error: unknown response');
            } elseif ($requestInfo['success'] == false) {
                throw new Exception('GetRequestInfo #' . $id . '. ' . $requestInfo['error']['message']);
            }
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse([
            'requestId' => $id,
            'inQueue' => $requestInfo['inQueue'],
            'text' => $requestInfo['text'],
            'nbWords' => $requestInfo['nbWords'],
            'status' => $requestInfo['status'],
        ]);
    }

    public function ajaxProcessBulkProductDescription()
    {
        $replace = Tools::getValue('replace', 1);
        if (!is_numeric($replace)) {
            $replace = 1;
        }

        $ids = Tools::getValue('ids');
        if (!is_array($ids)) {
            $ids = [$ids];
        }

        $language = $this->context->language;
        if (Tools::getValue('id_language')) {
            $language = new Language((int) Tools::getValue('id_language'));
        }

        $length = Tools::getValue('length');
        if (!is_numeric($length)) {
            $length = 250;
        }

        $skip_existing_description = (int) Tools::getValue('skip_existing_description', 0);
        $use_category = (int) Tools::getValue('use_category', 0);
        $use_brand = (int) Tools::getValue('use_brand', 0);
        $use_ean = (int) Tools::getValue('use_ean', 0);
        $content_type = Tools::getValue('content_type', 'description');

        $result = [];
        foreach ($ids as $id) {
            $product = new Product($id, false, $language->id);
            if (!Validate::isLoadedObject($product)) {
                return $this->module->errorResponse(
                    2,
                    $this->trans(
                        'The product #%id% could not be loaded',
                        ['%id%' => $id],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }

            // ignore products with not empty descriptions
            if ($skip_existing_description && trim($product->description) !== '') {
                $result[] = [
                    'idProduct' => (int) $product->id,
                    'text' => $product->description,
                    'nbWords' => str_word_count($product->description),
                    'inQueue' => false,
                    'requestId' => time(),
                ];
                continue;
            }

            $categoryName = null;
            if ($use_category == 1 &&
                $product->id_category_default &&
                $product->id_category_default != (int) Configuration::get('PS_HOME_CATEGORY')) {
                // get parent categories
                $parentCategories = (new Category($product->id_category_default, $language->id))
                    ->getParentsCategories($language->id);
                if ($parentCategories) {
                    // define categories line
                    $parentCategories = array_reverse($parentCategories);
                    $categoryName = trim(implode(' > ', array_filter(array_column($parentCategories, 'name'))));
                }
            }

            $brandName = null;
            if ($use_brand == 1) {
                $brandName = (new Manufacturer($product->id_manufacturer))->name;
            }

            $productEan = null;
            if ($use_ean == 1) {
                $productEan = trim($product->ean13);
            }

            if (trim($product->name) === '') {
                return $this->module->errorResponse(
                    1,
                    $this->trans(
                        'Product #%id%. Error: name is empty',
                        ['%id%' => $product->id],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }

            try {
                if ($content_type == 'characteristics') {
                    $description = $this->apiClient->productCharacteristics(
                        trim($product->name),
                        $length,
                        $language->iso_code,
                        $categoryName,
                        $brandName,
                        $productEan
                    );
                } else {
                    $description = $this->apiClient->productDescription(
                        trim($product->name),
                        $length,
                        $language->iso_code,
                        $categoryName,
                        $brandName,
                        $productEan
                    );
                }

                $result[] = [
                    'idProduct' => (int) $id,
                    'text' => $description['text'],
                    'nbWords' => (!isset($description['nbWords'])
                        ? str_word_count($description['text'])
                        : $description['nbWords']),
                    'inQueue' => $description['inQueue'],
                    'requestId' => $description['requestId'],
                ];

                if ($description['inQueue']) {
                    return $this->module->jsonResponse(['products' => $result]);
                }
                if ($content_type != 'characteristics') {
                    $newDescription = implode(
                        '',
                        array_map(
                            function ($text) {
                                return '<p>' . $text . '</p>';
                            },
                            explode("\n", trim($description['text']))
                        )
                    );
                } else {
                    $newDescription = trim($description['text']);
                }

                if ($newDescription) {
                    // get product to update
                    $product = $this->getObjectByEntity((int) $product->id, null, 'product');
                    if ($replace) {
                        $product->description[$language->id] = $newDescription;
                    } else {
                        $product->description[$language->id] .= $newDescription;
                    }
                    if ($product->save()) {
                        $repository = GptContentGeneratorRepository::getInstance();
                        $object = $repository->getByProductId($product->id, (int) $language->id);
                        if ($object->getId() == 0) {
                            $object->setIdObject((int) $product->id);
                            $object->setObjectType(GptContentGenerator::TYPE_PRODUCT);
                            $object->setIdLang((int) $language->id);
                            $object->setIsGenerated(true);
                            $repository->save($object);
                        }
                    } else {
                        return $this->module->errorResponse(
                            3,
                            $this->trans(
                                'Product #%id%. Error: description could not be updated',
                                ['%id%' => $product->id],
                                'Modules.Chatgptcontentgenerator.Admin'
                            )
                        );
                    }
                }
            } catch (Exception $e) {
                return $this->module->errorResponse(
                    $e->getCode(),
                    $this->trans(
                        'Product #%id%. Error: %err%',
                        ['%id%' => $id, '%err%' => $e->getMessage()],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }
        }

        return $this->module->jsonResponse(['products' => $result]);
    }

    public function ajaxProcessBulkCategoryDescription()
    {
        $replace = Tools::getValue('replace', 1);
        if (!is_numeric($replace)) {
            $replace = 1;
        }

        $ids = Tools::getValue('ids');
        if (!is_array($ids)) {
            $ids = [$ids];
        }

        $language = $this->context->language;
        if (Tools::getValue('id_language')) {
            $language = new Language((int) Tools::getValue('id_language'));
        }

        $length = 180;
        $skip_existing_description = (int) Tools::getValue('skip_existing_description', 0);

        $result = [];
        foreach ($ids as $id) {
            $category = new Category($id, $language->id);
            if (!Validate::isLoadedObject($category)) {
                return $this->module->errorResponse(
                    2,
                    $this->trans(
                        'The category #%id% could not be loaded',
                        ['%id%' => $id],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }

            // ignore categories with not empty descriptions
            if ($skip_existing_description && trim($category->description) !== '') {
                $result[] = [
                    'idCategory' => (int) $category->id,
                    'text' => $category->description,
                    'nbWords' => str_word_count($category->description),
                    'inQueue' => false,
                    'requestId' => time(),
                ];
                continue;
            }

            if (trim($category->name) === '') {
                return $this->module->errorResponse(
                    1,
                    $this->trans(
                        'Category #%id%. Error: name is empty',
                        ['%id%' => $category->id],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }

            try {
                $description = $this->apiClient->categoryDescription(
                    $category->name,
                    $length,
                    $language->iso_code
                );

                $result[] = [
                    'idCategory' => (int) $category->id,
                    'text' => $description['text'],
                    'nbWords' => (!isset($description['nbWords'])
                        ? str_word_count($description['text'])
                        : $description['nbWords']),
                    'inQueue' => $description['inQueue'],
                    'requestId' => $description['requestId'],
                ];

                if ($description['inQueue']) {
                    return $this->module->jsonResponse(['categories' => $result]);
                }

                $newDescription = implode(
                    '',
                    array_map(
                        function ($text) {
                            return '<p>' . $text . '</p>';
                        },
                        explode("\n", trim($description['text']))
                    )
                );

                if ($newDescription) {
                    // get category to update
                    $category = $this->getObjectByEntity((int) $category->id, null, 'category');
                    if ($replace) {
                        $category->description[$language->id] = $newDescription;
                    } else {
                        $category->description[$language->id] .= $newDescription;
                    }
                    if ($category->save()) {
                        $repository = GptContentGeneratorRepository::getInstance();
                        $object = $repository->getByCategoryId($category->id, (int) $language->id);
                        if ($object->getId() == 0) {
                            $object->setIdObject((int) $category->id);
                            $object->setObjectType(GptContentGenerator::TYPE_CATEGORY);
                            $object->setIdLang((int) $language->id);
                            $object->setIsGenerated(true);
                            $repository->save($object);
                        }
                    } else {
                        return $this->module->errorResponse(
                            3,
                            $this->trans(
                                'Category #%id%. Error: description could not be updated',
                                ['%id%' => $category->id],
                                'Modules.Chatgptcontentgenerator.Admin'
                            )
                        );
                    }
                }
            } catch (Exception $e) {
                $this->module->jsonExeptionResponse($e);
            }
        }

        return $this->module->jsonResponse(['categories' => $result]);
    }

    public function ajaxProcessSetDescription()
    {
        $id = (int) Tools::getValue('id');
        $entity = Tools::getValue('entity');
        $text = Tools::getValue('content', Tools::getValue('description'));

        // define filed wtich will be translated
        $field = trim(Tools::getValue('field', 'description'));
        if (!is_string($field) || $field === '') {
            return $this->module->errorResponse(
                5,
                $this->trans(
                    'The field is missing or empty',
                    [],
                    'Modules.Chatgptcontentgenerator.Admin'
                )
            );
        }

        $replace = Tools::getValue('replace', 1);
        if (!is_numeric($replace)) {
            $replace = 1;
        }

        $translate = Tools::getValue('translate', 1);

        $language = $this->context->language;
        if (Tools::getValue('id_language')) {
            $language = new Language((int) Tools::getValue('id_language'));
        }

        try {
            // get object to update
            $object = $this->getObjectByEntity($id, null, $entity);

            if (!$object || !Validate::isLoadedObject($object)) {
                throw new Exception('The object could not be loaded');
            }

            if (property_exists($object, $field) == false) {
                return $this->module->errorResponse(
                    4,
                    $this->trans(
                        'The field %field% not exists in the %entity%',
                        ['%field%' => $field, '%entity%' => $entity],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }

            if ($replace) {
                $object->{$field}[$language->id] = $text;
            } else {
                $object->{$field}[$language->id] .= $text;
            }
            if ($object->save()) {
                $repository = GptContentGeneratorRepository::getInstance();
                if ($entity == 'product') {
                    $node = $repository->getByProductId($object->id, (int) $language->id);
                } else {
                    $node = $repository->getByCategoryId($object->id, (int) $language->id);
                }
                if ($node->getId() == 0) {
                    $type = ($entity == 'product'
                        ? GptContentGenerator::TYPE_PRODUCT
                        : GptContentGenerator::TYPE_CATEGORY);

                    $node->setIdObject((int) $object->id);
                    $node->setIdLang((int) $language->id);
                    $node->setObjectType($type);
                    $node->setDateAdd(new DateTime());
                }

                if ($translate) {
                    $node->setIsTranslated(true);
                }
                $node->setIsGenerated(true);
                $repository->save($node);
            } else {
                return $this->module->errorResponse(
                    3,
                    $this->trans(
                        'Object #%id%. Error: description could not be updated',
                        ['%id%' => $object->id],
                        'Modules.Chatgptcontentgenerator.Admin'
                    )
                );
            }
        } catch (Exception $e) {
            return $this->module->jsonExeptionResponse($e);
        }

        return $this->module->jsonResponse(['success' => true]);
    }

    private function getObjectByEntity($idObject, $idLang, $entity)
    {
        if ($entity == 'product') {
            return new Product($idObject, false, $idLang);
        } elseif ($entity == 'category') {
            return new Category($idObject, $idLang);
        }
        return false;
    }
}
