<?php
/**
 * Campus Announcements Broadcast REST API
 * Edunova PHP API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($db);
        break;
    case 'POST':
        handlePost($db);
        break;
    default:
        jsonResponse("failed", "Requested endpoint does not support matching HTTP triggers.", [], 405);
}

/**
 * Fetch Announcements (Publicly readable)
 */
function handleGet($db) {
    try {
        $query = "SELECT * FROM announcements ORDER BY published_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $broadcasts = [];
        while ($row = $stmt->fetch()) {
            $broadcasts[] = [
                "id" => (int)$row['id'],
                "title" => $row['title'],
                "excerpt" => $row['excerpt'],
                // Formatted date readable by React UI modules
                "date" => date('M d, Y', strtotime($row['published_at']))
            ];
        }

        jsonResponse("success", "Historical campus broadcasts retrieved.", $broadcasts);
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}

/**
 * Launch Announcement Broadcast (ADMIN ONLY)
 */
function handlePost($db) {
    requireAdmin($db); // Access check
    $data = getRequestData();

    $title = isset($data['title']) ? trim($data['title']) : '';
    $excerpt = isset($data['excerpt']) ? trim($data['excerpt']) : '';

    if (empty($title) || empty($excerpt)) {
        jsonResponse("failed", "Title and excerpt are required broadcast parameters.", [], 400);
    }

    try {
        $query = "INSERT INTO announcements (title, excerpt) VALUES (:title, :excerpt)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title, PDO::PARAM_STR);
        $stmt->bindParam(":excerpt", $excerpt, PDO::PARAM_STR);

        if ($stmt->execute()) {
            $id = (int)$db->lastInsertId();
            
            // Generate a global system trigger alert in messages for all active users
            // So that students feel the dashboard live with push messages!
            $sysAlertText = "📢 Official Campus Broadcasting Network: '{$title}' has been published. Read details in the Announcements feeds.";
            
            $usersQuery = "SELECT id FROM users WHERE role = 'student'";
            $uStmt = $db->prepare($usersQuery);
            $uStmt->execute();
            
            while($studentId = $uStmt->fetchColumn()) {
                $sysStmt = $db->prepare("INSERT INTO messages (user_id, text, sender, is_read) VALUES (:uid, :txt, 'system', 0)");
                $sysStmt->bindParam(":uid", $studentId, PDO::PARAM_INT);
                $sysStmt->bindParam(":txt", $sysAlertText, PDO::PARAM_STR);
                $sysStmt->execute();
            }

            jsonResponse("success", "Campus-wide announcement successfully broadcasted.", [
                "id" => $id,
                "title" => $title,
                "excerpt" => $excerpt,
                "date" => date('M d, Y')
            ], 201);
        } else {
            jsonResponse("failed", "Database broadcast aborted.", [], 500);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "Underlying SQL failure: " . $e->getMessage(), [], 500);
    }
}
?>
