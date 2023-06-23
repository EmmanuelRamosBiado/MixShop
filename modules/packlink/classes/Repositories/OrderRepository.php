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

namespace Packlink\PrestaShop\Classes\Repositories;

use Packlink\BusinessLogic\Order\Exceptions\OrderNotFound;

/**
 * Class OrderRepository.
 *
 * @package Packlink\PrestaShop\Classes\Repositories
 */
class OrderRepository
{
    const PACKLINK_ORDER_DRAFT_FIELD = 'packlink_order_draft';

    /**
     * Updates order state.
     *
     * @param int $orderId
     * @param int $stateId
     *
     * @throws \Packlink\BusinessLogic\Order\Exceptions\OrderNotFound
     * @noinspection PhpDocMissingThrowsInspection
     * @noinspection PhpUnhandledExceptionInspection
     */
    public function updateOrderState($orderId, $stateId)
    {
        $order = $this->getOrder($orderId);

        if ((int)$order->getCurrentState() !== $stateId) {
            $order->setCurrentState($stateId);
            $order->save();
        }
    }

    /**
     * Sets the tracking number for order.
     *
     * @param int $orderId
     * @param string $trackingNumber
     *
     * @throws \Packlink\BusinessLogic\Order\Exceptions\OrderNotFound
     */
    public function setTrackingNumber($orderId, $trackingNumber)
    {
        $order = $this->getOrder($orderId);
        $order->setWsShippingNumber($trackingNumber);
    }

    /**
     * Gets the order.
     *
     * @param int $orderId
     *
     * @return \Order An order instance.
     *
     * @throws \Packlink\BusinessLogic\Order\Exceptions\OrderNotFound If order does not exist.
     */
    private function getOrder($orderId)
    {
        $order = null;
        try {
            $order = new \Order($orderId);
        } catch (\PrestaShopDatabaseException $e) {
        } catch (\PrestaShopException $e) {
        }

        if (!\Validate::isLoadedObject($order)) {
            throw new OrderNotFound('Order with ID ' . $orderId . ' not found.');
        }

        return $order;
    }
}
