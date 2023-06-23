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

class SqlInstaller
{
    private $sql = [];
    private $usql = [];
    private $errors = [];

    public function __construct()
    {
        $collation_database = Db::getInstance()->getValue('SELECT @@collation_database');

        $this->sql['content_generator'] = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'content_generator` (
                                            `id_content_generator` int(10) NOT NULL AUTO_INCREMENT,
                                            `id_object` int(10) NOT NULL,
                                            `id_lang` int(10) NULL,
                                            `object_type` tinyint(1) DEFAULT 1,
                                            `is_translated` tinyint(1) NULL DEFAULT 0,
                                            `is_generated` tinyint(1) NULL DEFAULT 0,
                                            `date_add` datetime DEFAULT NULL,
                                            PRIMARY KEY (`id_content_generator`),
                                            KEY `id_object` (`id_object`,`object_type`)
                                        ) COLLATE=\'' . $collation_database . '\' ENGINE=' . _MYSQL_ENGINE_ . ';';

        $this->usql['content_generator'] = 'DROP TABLE IF EXISTS `' . _DB_PREFIX_ . 'content_generator`;';
    }

    /**
     *   @return bool
     */
    public function install()
    {
        foreach ($this->sql as $table => $sql) {
            if (!Db::getInstance()->execute($sql)) {
                $this->errors[] = 'The table ' . $table . ' can not be created';
                return false;
            }
        }
        return true;
    }

    /**
     *   @return bool
     */
    public function uninstall()
    {
        foreach ($this->usql as $table => $sql) {
            if (!Db::getInstance()->execute($sql)) {
                $this->errors[] = 'The table ' . $table . ' can not be removed';
                return false;
            }
        }
        return true;
    }

    /**
     *   Get the errors list
     *   @return array
     */
    public function getErrors()
    {
        return $this->errors;
    }
}
