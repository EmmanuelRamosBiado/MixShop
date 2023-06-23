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
namespace PrestaShop\Module\Chatgptcontentgenerator\Repository;

if (!defined('_PS_VERSION_')) {
    exit;
}

use Db;
use PrestaShop\Module\Chatgptcontentgenerator\Entity\GptContentGenerator;

class GptContentGeneratorRepository
{
    /**
     * Init repository instance
     *
     * @return GptContentGeneratorRepository|null
     */
    public static function getInstance()
    {
        return new self();
    }

    public function initRepository()
    {
        return $this;
    }

    public function getByProductId($idProduct, $idLang = null)
    {
        $id = (int) Db::getInstance()->getValue(
            'SELECT id_content_generator FROM ' . GptContentGenerator::TABLE .
            ' WHERE id_object = ' . (int) $idProduct . ' AND object_type = ' . GptContentGenerator::TYPE_PRODUCT .
            (!is_null($idLang) ? ' AND id_lang = ' . (int) $idLang : '')
        );

        return new GptContentGenerator($id);
    }

    public function getByCategoryId($idCategory, $idLang = null)
    {
        $id = (int) Db::getInstance()->getValue(
            'SELECT id_content_generator FROM ' . GptContentGenerator::TABLE .
            ' WHERE id_object = ' . (int) $idCategory . ' AND object_type = ' . GptContentGenerator::TYPE_CATEGORY .
            (!is_null($idLang) ? ' AND id_lang = ' . (int) $idLang : '')
        );

        return new GptContentGenerator($id);
    }

    public function save(GptContentGenerator $object)
    {
        try {
            $object->save();
        } catch (\Exception $e) {
            return false;
        }

        return $object;
    }

    public function delete(GptContentGenerator $object)
    {
        try {
            $object->delete();
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }
}
