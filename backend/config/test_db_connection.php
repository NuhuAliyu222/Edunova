<?php
// Test database connection

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Connection Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .success { color: green; background: #d4edda; padding: 10px; border-radius: 5px; }
        .error { color: red; background: #f8d7da; padding: 10px; border-radius: 5px; }
        .info { background: #e2e3e5; padding: 10px; border-radius: 5px; margin-top: 10px; }
        pre { background: #fff; padding: 10px; border: 1px solid #ddd; overflow: auto; }
    </style>
</head>
<body>
    <h1>Database Connection Test</h1>
";

// Include database class
require_once __DIR__ . '/database.php';

// Test connection
$database = new Database();
$conn = $database->getConnection();

if ($conn) {
    echo "<div class='success'>✅ Database connection successful</div>";
    echo "<div class='info'>";
    echo "<strong>Server Info:</strong> " . htmlspecialchars($conn->getAttribute(PDO::ATTR_SERVER_VERSION)) . "<br>";
    echo "</div>";

    {
        // Check if database exists
        $stmt = $conn->query("SELECT DATABASE()");
        $currentDb = $stmt->fetchColumn();
        echo "<div class='info'>✅ Connected to database: <strong>" . htmlspecialchars($currentDb) . "</strong></div>";
        
        // List tables
        $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        if (count($tables) > 0) {
            echo "<div class='info'>📋 Tables found: " . implode(', ', array_map('htmlspecialchars', $tables)) . "</div>";
        } else {
            echo "<div class='error'>⚠️ No tables found. Please import the database schema.</div>";
        }
        
        // Count users
        $stmt = $conn->query("SELECT COUNT(*) FROM users");
        $userCount = $stmt->fetchColumn();
        echo "<div class='info'>👥 Total users: " . $userCount . "</div>";
    }
} else {
    echo "<div class='error'>❌ Database connection failed. Check your configuration.</div>";
    echo "<div class='info'>";
    echo "<strong>Troubleshooting steps:</strong><br>";
    echo "1. Make sure MySQL is running in XAMPP Control Panel<br>";
    echo "2. Check if database 'edunova' exists in phpMyAdmin<br>";
    echo "3. Verify username/password in .env file<br>";
    echo "4. Check if port 3306 is not blocked<br>";
    echo "</div>";
}

echo "<h2>Environment Variables Loaded:</h2>";
echo "<pre>";
echo "DB_HOST: " . (getenv('DB_HOST') ?: 'not set') . "\n";
echo "DB_NAME: " . (getenv('DB_NAME') ?: 'not set') . "\n";
echo "DB_USER: " . (getenv('DB_USER') ?: 'not set') . "\n";
echo "DB_PASS: " . (strlen(getenv('DB_PASS')) > 0 ? '*****' : 'empty') . "\n";
echo "</pre>";

echo "<h2>PHP Configuration:</h2>";
echo "<pre>";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'Enabled' : 'Disabled') . "\n";
echo "MySQLi: " . (extension_loaded('mysqli') ? 'Enabled' : 'Disabled') . "\n";
echo "</pre>";

echo "</body></html>";
?>