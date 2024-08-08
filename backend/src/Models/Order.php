<?php
// backend/src/Models/Order.php

namespace App\Models;

class Order extends BaseModel
{
    protected $table = 'order';

    public function create(array $items)
    {
        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (created_at) VALUES (NOW())");
            $stmt->execute();
            $orderId = $this->pdo->lastInsertId();

            $stmt = $this->pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, options) VALUES (?, ?, ?, ?)");
            foreach ($items as $item) {
                $stmt->execute([$orderId, $item['productId'], $item['quantity'], $item['options'] ?? null]);
            }

            $this->pdo->commit();
            return true;
        } catch (\Exception $e) {
            $this->pdo->rollBack();
            error_log("Error creating order: " . $e->getMessage());
            return false;
        }
    }
}