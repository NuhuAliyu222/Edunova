<?php
/**
 * Database Configuration and PDO Connection Manager
 * Edunova Smart Learning App
 */

class Database {
    // Database connection parameters
    private $host = "localhost";
    private $db_name = "edunova_db";
    private $username = "root";
    private $password = "";
    private $charset = "utf8mb4";
    public $conn;

    /**
     * Establishes a secure connection to the MySQL instance using PDO.
     * Includes default styling attributes for error logging and association parameters.
     */
    public function getConnection() {
        $this->conn = null;

        try {
            // DSN configuration
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $exception) {
            // Elegant JSON error response if connection breaks
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Database connection failure: " . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>
