<?php
// backend/src/DatabaseConnection.php

namespace App;

use PDO;
use PDOException;

class DatabaseConnection
{
    private static $instance = null;
    private $pdo;

    private function __construct()
    {

        // //for localhost
        // $host = "localhost";
        // $dbname = "mishosdb";
        // $user = "root";
        // $password = "123456";
        

        //for real server
        $host = "mysql8.serv00.com";
        $dbname = "m1718_mishosdb";
        $user = "m1718";
        $password = "(XROWmkR9L021)98drcA";

        if (!$host || !$dbname || !$user) {
            throw new \Exception("Database configuration is incomplete. Please check your environment variables.");
        }

        try {
            $this->pdo = new PDO(
                "mysql:host=$host;dbname=$dbname",
                $user,
                $password
            );
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            error_log("Database connection successful");
        } catch (PDOException $e) {
            error_log("Connection failed: " . $e->getMessage());
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new DatabaseConnection();
        }
        return self::$instance;
    }

    public function getPdo()
    {
        return $this->pdo;
    }
}