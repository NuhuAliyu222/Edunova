<?php
/**
 * Live Peer Support & Administration Messaging Channels API
 * Edunova PHP API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$currentUser = requireAuth($db);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($db, $currentUser);
        break;
    case 'POST':
        handlePost($db, $currentUser);
        break;
    default:
        jsonResponse("failed", "Http method not allowed.", [], 405);
}

/**
 * Fetch dialogues
 */
function handleGet($db, $currentUser) {
    $role = $currentUser['role'];

    if ($role === 'student') {
        // Students fetch their own inbox thread + general system alerts logs
        try {
            $query = "SELECT * FROM messages WHERE user_id = :uid ORDER BY sent_at ASC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $stmt->execute();

            $messages = [];
            while ($row = $stmt->fetch()) {
                $messages[] = [
                    "id" => (int)$row['id'],
                    "userId" => (int)$row['user_id'],
                    "text" => $row['text'],
                    "sender" => $row['sender'],
                    "read" => (bool)$row['is_read'],
                    "sentAt" => $row['sent_at']
                ];
            }

            // AUTO-MARK AS READ: Automatically mark incoming Admin messages as read when fetched by student
            $updateStmt = $db->prepare("UPDATE messages SET is_read = 1 WHERE user_id = :uid AND sender = 'admin'");
            $updateStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $updateStmt->execute();

            jsonResponse("success", "Student personal support log extracted.", $messages);
        } catch (PDOException $e) {
            jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
        }
    } else if ($role === 'admin') {
        // Admins can fetch messages of a specific target student by querying `?studentId=X`
        $studentId = isset($_GET['studentId']) ? (int)$_GET['studentId'] : 0;

        if ($studentId > 0) {
            try {
                $query = "SELECT * FROM messages WHERE user_id = :student_id ORDER BY sent_at ASC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":student_id", $studentId, PDO::PARAM_INT);
                $stmt->execute();

                $messages = [];
                while ($row = $stmt->fetch()) {
                    $messages[] = [
                        "id" => (int)$row['id'],
                        "userId" => (int)$row['user_id'],
                        "text" => $row['text'],
                        "sender" => $row['sender'],
                        "read" => (bool)$row['is_read'],
                        "sentAt" => $row['sent_at']
                    ];
                }

                // AUTO-MARK AS READ: Mark student responses read when fetched by admin
                $updateStmt = $db->prepare("UPDATE messages SET is_read = 1 WHERE user_id = :sid AND sender = 'student'");
                $updateStmt->bindParam(":sid", $studentId, PDO::PARAM_INT);
                $updateStmt->execute();

                jsonResponse("success", "Student channel data compiled.", $messages);
            } catch (PDOException $e) {
                jsonResponse("error", "SQL failed: " . $e->getMessage(), [], 500);
            }
        } else {
            // Otherwise, get an aggregate summary of all students with recent thread activities for admin directory dashboards!
            try {
                $query = "SELECT u.id, u.name, u.email, 
                          (SELECT m.text FROM messages m WHERE m.user_id = u.id ORDER BY m.sent_at DESC LIMIT 1) as last_text,
                          (SELECT m.sent_at FROM messages m WHERE m.user_id = u.id ORDER BY m.sent_at DESC LIMIT 1) as last_activity,
                          (SELECT COUNT(m.id) FROM messages m WHERE m.user_id = u.id AND m.is_read = 0 AND m.sender = 'student') as unread_count
                          FROM users u WHERE u.role = 'student' ORDER BY last_activity DESC";
                
                $stmt = $db->prepare($query);
                $stmt->execute();

                $channels = [];
                while ($row = $stmt->fetch()) {
                    $channels[] = [
                        "studentId" => (int)$row['id'],
                        "name" => $row['name'],
                        "email" => $row['email'],
                        "lastMessage" => $row['last_text'],
                        "lastActivity" => $row['last_activity'],
                        "unreadCount" => (int)$row['unread_count']
                    ];
                }
                jsonResponse("success", "Active administrative mailboxes listed.", $channels);
            } catch (PDOException $e) {
                jsonResponse("error", "Failed aggregate query: " . $e->getMessage(), [], 500);
            }
        }
    }
}

/**
 * Dispatch Support Message (Student submitting support ticket OR admin responding)
 */
function handlePost($db, $currentUser) {
    $data = getRequestData();
    $text = isset($data['text']) ? trim($data['text']) : '';

    if (empty($text)) {
        jsonResponse("failed", "Content bodies 'text' must not remain empty.", [], 400);
    }

    $role = $currentUser['role'];

    if ($role === 'student') {
        // Students can only post under their own id tag
        $userId = $currentUser['id'];
        $sender = 'student';
    } else {
        // Admins must specify which student ID thread they are responding to
        $userId = isset($data['userId']) ? (int)$data['userId'] : 0;
        $sender = 'admin';

        if ($userId <= 0) {
            jsonResponse("failed", "Admins must specify a 'userId' recipient for response dispatches.", [], 400);
        }
    }

    try {
        $query = "INSERT INTO messages (user_id, text, sender, is_read) VALUES (:uid, :txt, :sender, 0)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":uid", $userId, PDO::PARAM_INT);
        $stmt->bindParam(":txt", $text, PDO::PARAM_STR);
        $stmt->bindParam(":sender", $sender, PDO::PARAM_STR);

        if ($stmt->execute()) {
            $newMsg = [
                "id" => (int)$db->lastInsertId(),
                "userId" => $userId,
                "text" => $text,
                "sender" => $sender,
                "read" => false,
                "sentAt" => date('Y-m-d H:i:s')
            ];

            // SIMULATED AUTO-RESPONDER BOT:
            // If the student sends a message, simulate an automated instant response from the Registrar bot
            // if no real human is connected, based on academic keyword triggers!
            if ($role === 'student') {
                $replyText = "";
                $normalizedText = strtolower($text);
                
                if (strpos($normalizedText, 'certificate') !== false || strpos($normalizedText, 'cert') !== false) {
                    $replyText = "Hello! Verifiable certificates are automatically unlocked when you complete all lessons in a course. Once unlocked, click 'View Certificate' in the Course details or your Profile page!";
                } else if (strpos($normalizedText, 'quiz') !== false || strpos($normalizedText, 'exam') !== false) {
                    $replyText = "Greetings scholar! You can re-take course quizzes as many times as you'd like. Only your highest single score is registered on the Wall of Fame Smart Leaderboard!";
                } else if (strpos($normalizedText, 'help') !== false || strpos($normalizedText, 'error') !== false) {
                    $replyText = "Our System Registrar has initiated a helpdesk ticket. Please list details of the bug, and our technical office will address it shortly. Stay focused!";
                }

                if (!empty($replyText)) {
                    // Send simulated admin response
                    $botQuery = "INSERT INTO messages (user_id, text, sender, is_read) VALUES (:uid, :txt, 'admin', 0)";
                    $botStmt = $db->prepare($botQuery);
                    $botStmt->bindParam(":uid", $userId, PDO::PARAM_INT);
                    $botStmt->bindParam(":txt", $replyText, PDO::PARAM_STR);
                    $botStmt->execute();
                }
            }

            jsonResponse("success", "Message dispatched successfully.", $newMsg, 201);
        } else {
            jsonResponse("failed", "Dispatch aborted due to writing block.", [], 500);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "Connection error: " . $e->getMessage(), [], 500);
    }
}
?>
