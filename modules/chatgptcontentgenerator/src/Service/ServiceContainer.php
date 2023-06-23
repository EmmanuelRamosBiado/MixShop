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
namespace PrestaShop\Module\Chatgptcontentgenerator\Service;

if (!defined('_PS_VERSION_')) {
    exit;
}

use PrestaShop\ModuleLibCacheDirectoryProvider\Cache\CacheDirectoryProvider;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ServiceContainer
{
    /**
     * @var string Module Name
     */
    private $moduleName;

    /**
     * @var string Module Local Path
     */
    private $moduleLocalPath;

    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @param string $moduleName
     * @param string $moduleLocalPath
     */
    public function __construct($moduleName, $moduleLocalPath)
    {
        $this->moduleName = $moduleName;
        $this->moduleLocalPath = $moduleLocalPath;
    }

    /**
     * @param string $serviceName
     *
     * @return object|null
     */
    public function getService($serviceName)
    {
        if (null === $this->container) {
            $this->initContainer();
        }

        return $this->container->get($serviceName);
    }

    /**
     * Instantiate a new ContainerProvider
     */
    private function initContainer()
    {
        $cacheDirectory = new CacheDirectoryProvider(
            _PS_VERSION_,
            _PS_ROOT_DIR_,
            _PS_MODE_DEV_
        );
        $containerProvider = new ContainerProvider($this->moduleName, $this->moduleLocalPath, $cacheDirectory);

        $this->container = $containerProvider->get(defined('_PS_ADMIN_DIR_') || defined('PS_INSTALLATION_IN_PROGRESS') || PHP_SAPI === 'cli' ? 'admin' : 'front');
    }
}
