<?php

namespace App\Models;

class ProductAttributeSet extends BaseModel
{
    protected $table = 'product_attribute_set';

    public function getForProduct($productId)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM ' . $this->table . ' WHERE product_id = :product_id');
        $stmt->execute(['product_id' => $productId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
