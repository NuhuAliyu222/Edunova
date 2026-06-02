<?php

require_once __DIR__ . '/env.php';

class Database
{
    private string $host;
    private string $db_name;
    private string $username;
    private string $password;
    public $conn;

    public function __construct()
    {
        $this->host = env('DB_HOST', 'localhost');
        $this->db_name = env('DB_NAME', 'edunova');
        $this->username = env('DB_USER', 'root');
        $this->password = env('DB_PASS', '');
    }

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
        } catch (PDOException $exception) {
            error_log('Database connection error: ' . $exception->getMessage());
        }
        return $this->conn;
    }
}
