<?php
/**
 * Lesson Completion & Smart Certificate Auto-generation
 * Edunova PHP API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

// Guard route
$currentUser = requireAuth($db);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse("failed", "Use POST payload to transmit completion logs.", [], 405);
}

$data = getRequestData();
$courseId = isset($data['courseId']) ? (int)$data['courseId'] : 0;
$lessonId = isset($data['lessonId']) ? (int)$data['lessonId'] : 0;

if ($courseId <= 0 || $lessonId <= 0) {
    jsonResponse("failed", "Mandatory variables 'courseId' and 'lessonId' must be supplied.", [], 400);
}

try {
    // 1. Verify lesson belongs to target course
    $verifyQuery = "SELECT title FROM lessons WHERE id = :lid AND course_id = :cid LIMIT 1";
    $vStmt = $db->prepare($verifyQuery);
    $vStmt->bindParam(":lid", $lessonId, PDO::PARAM_INT);
    $vStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
    $vStmt->execute();

    if ($vStmt->rowCount() === 0) {
        jsonResponse("failed", "Lesson segment index holds no relational maps to specified course ID.", [], 400);
    }
    
    $lessonTitle = $vStmt->fetchColumn();

    // 2. Mark lesson as complete (duplicate entries captured by try/catch of duplicate keys)
    $insertProgress = "INSERT INTO lesson_progress (user_id, course_id, lesson_id) VALUES (:uid, :cid, :lid)";
    $progStmt = $db->prepare($insertProgress);
    $progStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
    $progStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
    $progStmt->bindParam(":lid", $lessonId, PDO::PARAM_INT);
    $progStmt->execute();

    // 3. SMART METRIC: Let's calculate total lessons in this course vs completed lessons by student
    $totalLessonsQuery = "SELECT COUNT(id) FROM lessons WHERE course_id = :cid";
    $tStmt = $db->prepare($totalLessonsQuery);
    $tStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
    $tStmt->execute();
    $totalLessonsCount = (int)$tStmt->fetchColumn();

    $completedLessonsQuery = "SELECT COUNT(lesson_id) FROM lesson_progress WHERE user_id = :uid AND course_id = :cid";
    $cStmt = $db->prepare($completedLessonsQuery);
    $cStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
    $cStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
    $cStmt->execute();
    $completedLessonsCount = (int)$cStmt->fetchColumn();

    $certificateUnlocked = false;
    $certCode = "";

    // If student successfully completed all course lessons
    if ($totalLessonsCount > 0 && $completedLessonsCount === $totalLessonsCount) {
        
        // Ensure no certificate exists already for this course + user combination
        $certCheck = "SELECT certificate_code FROM certificates WHERE user_id = :uid AND course_id = :cid LIMIT 1";
        $ccStmt = $db->prepare($certCheck);
        $ccStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
        $ccStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
        $ccStmt->execute();

        if ($ccStmt->rowCount() === 0) {
            // Fetch Course Title for logs
            $courseInfoQuery = "SELECT title FROM courses WHERE id = :cid";
            $ciStmt = $db->prepare($courseInfoQuery);
            $ciStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
            $ciStmt->execute();
            $courseTitle = $ciStmt->fetchColumn();

            // Auto-generate verification token hash
            $certCode = "EDN-" . strtoupper(substr(md5(uniqid($currentUser['id'] . "-" . $courseId, true)), 0, 10));

            $generateCert = "INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (:uid, :cid, :code)";
            $gcStmt = $db->prepare($generateCert);
            $gcStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $gcStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
            $gcStmt->bindParam(":code", $certCode, PDO::PARAM_STR);
            $gcStmt->execute();

            $certificateUnlocked = true;

            // Log beautiful system message alerting student of the breakthrough
            $congratsText = "🎉 Spectacular Milestone! You have completed all lessons in '{$courseTitle}'. Your official verifiable Certificate of Completion has been generated: Code [{$certCode}]. Visit your profile tab to download it!";
            $sysStmt = $db->prepare("INSERT INTO messages (user_id, text, sender, is_read) VALUES (:uid, :txt, 'system', 0)");
            $sysStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $sysStmt->bindParam(":txt", $congratsText, PDO::PARAM_STR);
            $sysStmt->execute();
        } else {
            $certCode = $ccStmt->fetchColumn();
        }
    }

    $responsePayload = [
        "lessonId" => $lessonId,
        "completed" => true,
        "completedCount" => $completedLessonsCount,
        "totalCount" => $totalLessonsCount,
        "certificateUnlocked" => $certificateUnlocked,
        "certificateCode" => !empty($certCode) ? $certCode : null
    ];

    jsonResponse("success", "Lesson progress logged cleanly.", $responsePayload);

} catch (PDOException $e) {
    // Graceful duplicate catch
    if ($e->getCode() == 23000) {
        jsonResponse("success", "Lesson already checked as finished in records.", ["alreadyCompleted" => true]);
    }
    jsonResponse("error", "Failed logging progress: " . $e->getMessage(), [], 500);
}
?>
