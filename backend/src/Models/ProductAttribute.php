<?php

namespace App\Models;

class ProductAttribute extends BaseModel
{
    protected $table = 'product_attribute';

    public function getForAttributeSet($attributeSetId)
    {
        $stmt = $this->pdo->prepare('SELECT * FROM ' . $this->table . ' WHERE attribute_set_id = :attribute_set_id');
        $stmt->execute(['attribute_set_id' => $attributeSetId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
