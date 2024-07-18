<?php
// backend/src/Models/Product.php

namespace App\Models;

class Product extends BaseModel
{
    protected $table = 'product';
    
    protected $casts = [
        'gallery' => 'array'
    ];

    public function getByCategory($categoryName)
{
    $stmt = $this->pdo->prepare("
        SELECT p.* 
        FROM {$this->table} p
        JOIN category c ON p.category_id = c.id
        WHERE c.name = :category_name
    ");
    $stmt->bindParam(':category_name', $categoryName);
    $stmt->execute();
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}
}