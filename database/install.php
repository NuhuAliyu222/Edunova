<?php

/**
 * Run once after importing schema.sql to set the admin password.
 * Usage: php database/install.php
 */

require_once __DIR__ . '/../backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    fwrite(STDERR, "Database connection failed.\n");
    exit(1);
}

$hash = password_hash('admin123', PASSWORD_BCRYPT);
$stmt = $db->prepare("UPDATE users SET password = :password WHERE email = 'admin@edunova.com'");
$stmt->execute([':password' => $hash]);

echo "Admin password updated for admin@edunova.com (password: admin123)\n";
