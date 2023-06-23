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
namespace PrestaShop\Module\Chatgptcontentgenerator\Adapter\Product;

if (!defined('_PS_VERSION_')) {
    exit;
}

use Doctrine\ORM\EntityManager;
use PrestaShop\PrestaShop\Adapter\ImageManager;
use PrestaShop\PrestaShop\Adapter\Product\AdminProductDataProvider;
use PrestaShop\PrestaShop\Adapter\SymfonyContainer;
use Psr\Cache\CacheItemPoolInterface;

class GptProductDataProvider extends AdminProductDataProvider
{
    public function __construct(
        EntityManager $entityManager = null,
        ImageManager $imageManager = null,
        CacheItemPoolInterface $cache = null
    ) {
        $container = SymfonyContainer::getInstance();

        if (is_null($entityManager)) {
            $entityManager = $container->get('doctrine.orm.entity_manager');
        }
        if (is_null($imageManager)) {
            $imageManager = $container->get('prestashop.adapter.image_manager');
        }
        if (is_null($cache)) {
            $cache = $container->get('prestashop.static_cache.adapter');
        }
        parent::__construct($entityManager, $imageManager, $cache);
    }

    public function isColumnFiltered()
    {
        return true;
    }
}
