<?php
/**
 * Simple Enrollment Module
 * Edunova PHP API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

// Block guests
$currentUser = requireAuth($db);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("failed", "Must use POST method to enroll.", [], 405);
}

$data = getRequestData();
$courseId = isset($data['courseId']) ? (int)$data['courseId'] : 0;

if ($courseId <= 0) {
    jsonResponse("failed", "Specify a valid interest course parameter 'courseId'.", [], 400);
}

// Ensure course module exists
$checkCourse = "SELECT title FROM courses WHERE id = :cid LIMIT 1";
$checkCStmt = $db->prepare($checkCourse);
$checkCStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
$checkCStmt->execute();

if ($checkCStmt->rowCount() === 0) {
    jsonResponse("failed", "Target course module does not exist in registry.", [], 404);
}

$courseTitle = $checkCStmt->fetchColumn();

try {
    // Attempt enrollment insert (PRIMARY KEY constraint handles deduplication block)
    $query = "INSERT INTO enrollments (user_id, course_id) VALUES (:uid, :cid)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
    $stmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        
        // Log custom system message notification
        $sysMsgText = "Success! You have enrolled in '{$courseTitle}'. Complete all micro-lessons to obtain your verifiable graduate certificate.";
        $sysStmt = $db->prepare("INSERT INTO messages (user_id, text, sender, is_read) VALUES (:uid, :txt, 'system', 0)");
        $sysStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
        $sysStmt->bindParam(":txt", $sysMsgText, PDO::PARAM_STR);
        $sysStmt->execute();

        $enPayload = [
            "userId" => (int)$currentUser['id'],
            "courseId" => $courseId,
            "enrolledAt" => date('Y-m-d H:i:s')
        ];

        jsonResponse("success", "Enrollment completed successfully. Class log established.", $enPayload, 201);
    }
} catch (PDOException $e) {
    // Handle duplicated enrollments gracefully (MySQL returns code 23000 on Integrity constraint violation)
    if ($e->getCode() == 23000) {
        jsonResponse("failed", "You are already enrolled inside this academic coursework module.", [], 409);
    }
    jsonResponse("error", "Enrollment abort: " . $e->getMessage(), [], 500);
}
?>
