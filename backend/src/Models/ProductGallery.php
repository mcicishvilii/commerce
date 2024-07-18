<?php
// backend/src/Models/ProductGallery.php

namespace App\Models;

class ProductGallery extends BaseModel
{
    protected $table = 'product_gallery';

    public function getImagesForProduct($productId)
    {
        $stmt = $this->pdo->prepare("SELECT image_url FROM {$this->table} WHERE product_id = :product_id");
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}