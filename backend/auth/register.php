<?php
/**
 * Student Registration Endpoint
 * Edunova PHP API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$data = getRequestData();

// Extract input field variables safely
$name = isset($data['name']) ? trim($data['name']) : '';
$username = isset($data['username']) ? trim($data['username']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : null;
$gender = isset($data['gender']) ? trim($data['gender']) : null;
$dob = isset($data['dob']) ? trim($data['dob']) : null;
$bio = isset($data['bio']) ? trim($data['bio']) : null;

// Validation rules
if (empty($name) || empty($username) || empty($email) || empty($password)) {
    jsonResponse("failed", "Name, Username, Email, and Password are required registration parameters.", [], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse("failed", "Please specify a valid academic email address structure.", [], 400);
}

// Check for existing records
$checkQuery = "SELECT id, email, username FROM users WHERE email = :email OR username = :username LIMIT 1";
$checkStmt = $db->prepare($checkQuery);
$checkStmt->bindParam(":email", $email, PDO::PARAM_STR);
$checkStmt->bindParam(":username", $username, PDO::PARAM_STR);
$checkStmt->execute();

if ($checkStmt->rowCount() > 0) {
    $existing = $checkStmt->fetch();
    if ($existing['email'] === $email) {
        jsonResponse("failed", "Email has already been registered in the academic register.", [], 409);
    } else {
        jsonResponse("failed", "Username username is already taken. Please pick another moniker.", [], 409);
    }
}

// Safe password hashing
$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    // Insert new user
    $insertQuery = "INSERT INTO users (name, username, email, password_hash, phone, gender, dob, bio, role) 
                    VALUES (:name, :username, :email, :password_hash, :phone, :gender, :dob, :bio, 'student')";
    
    $stmt = $db->prepare($insertQuery);
    $stmt->bindParam(":name", $name, PDO::PARAM_STR);
    $stmt->bindParam(":username", $username, PDO::PARAM_STR);
    $stmt->bindParam(":email", $email, PDO::PARAM_STR);
    $stmt->bindParam(":password_hash", $password_hash, PDO::PARAM_STR);
    $stmt->bindParam(":phone", $phone, PDO::PARAM_STR);
    $stmt->bindParam(":gender", $gender, PDO::PARAM_STR);
    $stmt->bindParam(":dob", $dob, PDO::PARAM_STR);
    $stmt->bindParam(":bio", $bio, PDO::PARAM_STR);
    
    if ($stmt->execute()) {
        $newUserId = $db->lastInsertId();
        
        // Generate automatic system message for the welcoming dashboard experience
        $welcomeText = "Hello {$name}! Welcome to the Edunova Portal. You can enroll in active curriculum catalog modules free of charge. Contact our support desk if you face any issues.";
        $msgQuery = "INSERT INTO messages (user_id, text, sender, is_read) VALUES (:userid, :text, 'system', 0)";
        $msgStmt = $db->prepare($msgQuery);
        $msgStmt->bindParam(":userid", $newUserId, PDO::PARAM_INT);
        $msgStmt->bindParam(":text", $welcomeText, PDO::PARAM_STR);
        $msgStmt->execute();

        // Output matching user record with token for quick browser login auto-flows
        $token = generateMockToken($newUserId, 'student', $email);
        $payload = [
            "id" => (int)$newUserId,
            "name" => $name,
            "username" => $username,
            "email" => $email,
            "phone" => $phone,
            "gender" => $gender,
            "dob" => $dob,
            "bio" => $bio,
            "role" => "student",
            "registeredAt" => date('Y-m-d H:i:s'),
            "token" => $token
        ];

        jsonResponse("success", "Student registered successfully. Academic dossier created.", $payload, 201);
    } else {
        jsonResponse("failed", "Database execution error occurred. Account creation aborted.", [], 500);
    }
} catch (PDOException $e) {
    jsonResponse("error", "Underlying schema constraint failed: " . $e->getMessage(), [], 500);
}
?>
