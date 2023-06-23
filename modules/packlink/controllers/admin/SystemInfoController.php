<?php
/**
 * 2023 Packlink
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Apache License 2.0
 * that is bundled with this package in the file LICENSE.
 * It is also available through the world-wide-web at this URL:
 * http://www.apache.org/licenses/LICENSE-2.0.txt
 *
 * @author    Packlink <support@packlink.com>
 * @copyright 2023 Packlink Shipping S.L
 * @license   http://www.apache.org/licenses/LICENSE-2.0.txt  Apache License 2.0
 */

use Packlink\PrestaShop\Classes\Utility\PacklinkPrestaShopUtility;
use Packlink\BusinessLogic\Controllers\SystemInfoController as BaseSystemInfoController;

/** @noinspection PhpIncludeInspection */
require_once rtrim(_PS_MODULE_DIR_, '/') . '/packlink/vendor/autoload.php';

/**
 * Class SystemInfoController
 */
class SystemInfoController extends PacklinkBaseController
{
    /**
     * Returns regions available for Packlink account registration.
     */
    public function displayAjaxGet()
    {
        $controller = new BaseSystemInfoController();

        PacklinkPrestaShopUtility::dieDtoEntities($controller->get());
    }
}
