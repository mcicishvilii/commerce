<?php
// backend/src/Models/BaseModel.php

namespace App\Models;

use App\DatabaseConnection;

abstract class BaseModel
{
    protected $table;
    protected $pdo;

    public function __construct()
    {
        $this->pdo = DatabaseConnection::getInstance()->getPdo();
    }

    public function all()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table}");
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function find($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    public function create(array $data)
    {
        $columns = implode(', ', array_keys($data));
        $values = ':' . implode(', :', array_keys($data));
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} ({$columns}) VALUES ({$values})");
        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        return $stmt->execute();
    }
}