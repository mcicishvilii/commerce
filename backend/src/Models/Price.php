<?php
// backend/src/Models/Price.php

namespace App\Models;

class Price extends BaseModel
{
    protected $table = 'price';

    public function getForProduct($productId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE product_id = :product_id");
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}