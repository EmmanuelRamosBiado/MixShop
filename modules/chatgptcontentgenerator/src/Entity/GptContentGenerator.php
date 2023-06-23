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
namespace PrestaShop\Module\Chatgptcontentgenerator\Entity;

if (!defined('_PS_VERSION_')) {
    exit;
}

class GptContentGenerator extends \ObjectModel
{
    public const TABLE = _DB_PREFIX_ . 'content_generator';

    public const TYPE_PRODUCT = 1;
    public const TYPE_CATEGORY = 2;

    /**
     * @var int
     */
    public $id_object;

    /**
     * @var int
     */
    public $id_lang;

    /**
     * @var int
     */
    public $object_type = 0;

    /**
     * @var int
     */
    public $is_translated = 0;

    /**
     * @var int
     */
    public $is_generated = 0;

    /**
     * @var string
     */
    public $date_add;

    /**
     * @see ObjectModel::$definition
     */
    public static $definition = [
        'table' => 'content_generator',
        'primary' => 'id_content_generator',
        'multilang' => false,
        'fields' => [
            'id_object' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true],
            'id_lang' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => false],
            'object_type' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => false],
            'is_translated' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'is_generated' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'date_add' => ['type' => self::TYPE_DATE, 'validate' => 'isDate'],
        ],
    ];

    /**
     * @return int|null
     */
    public function getId()
    {
        return (int) $this->id;
    }

    /**
     * @return int
     */
    public function getIdObject()
    {
        return (int) $this->id_object;
    }

    /**
     * @param int $id_object
     * @return $this
     */
    public function setIdObject(int $id_object)
    {
        $this->id_object = $id_object;

        return $this;
    }

    /**
     * @return int
     */
    public function getIdLang()
    {
        return (int) $this->id_lang;
    }

    /**
     * @param int $id_lang
     * @return $this
     */
    public function setIdLang(int $id_lang)
    {
        $this->id_lang = $id_lang;

        return $this;
    }

    /**
     * @return int
     */
    public function getIsTranslated()
    {
        return (int) $this->is_translated;
    }

    /**
     * @param int|bool $is_translated
     * @return $this
     */
    public function setIsTranslated($is_translated)
    {
        $this->is_translated = (int) $is_translated;

        return $this;
    }

    /**
     * @return int
     */
    public function getIsGenerated()
    {
        return (int) $this->is_generated;
    }

    /**
     * @param int|bool $is_generated
     * @return $this
     */
    public function setIsGenerated($is_generated)
    {
        $this->is_generated = (int) $is_generated;

        return $this;
    }

    /**
     * Get type name
     *
     * @return string
     */
    public function getObjectTypeName()
    {
        $name = '';
        switch ((int) $this->object_type) {
            case self::TYPE_CATEGORY:
                $name = 'category';
                break;

            case self::TYPE_PRODUCT:
                $name = 'amount';
                break;

            default:
                $name = 'none';
                break;
        }

        return $name;
    }

    /**
     * @return int|null
     */
    public function getObjectType()
    {
        return (int) $this->object_type;
    }

    /**
     * @param int|null $object_type
     * @return $this
     */
    public function setObjectType(int $object_type)
    {
        $this->object_type = $object_type;
        return $this;
    }

    /**
     * Get date_add.
     *
     * @return string
     */
    public function getDateAdd()
    {
        return $this->date_add;
    }

    /**
     * Set date_add.
     *
     * @param string $date_add
     *
     * @return $this
     */
    public function setDateAdd()
    {
        $this->date_add = date('Y-m-d H:i:s');

        return $this;
    }
}
