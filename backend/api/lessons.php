<?php
/**
 * Lesson Content Delivery REST API
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
    case 'DELETE':
        handleDelete($db);
        break;
    default:
        jsonResponse("failed", "Http method not allowed.", [], 405);
}

/**
 * Fetch lessons for targeting course
 */
function handleGet($db) {
    $courseId = isset($_GET['courseId']) ? (int)$_GET['courseId'] : 0;
    if ($courseId <= 0) {
        jsonResponse("failed", "Mandatory query parameter 'courseId' is required.", [], 400);
    }

    $currentUser = getAuthUser($db);

    try {
        // Fetch all course lessons ordered by lesson_order
        $query = "SELECT * FROM lessons WHERE course_id = :course_id ORDER BY lesson_order ASC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":course_id", $courseId, PDO::PARAM_INT);
        $stmt->execute();
        
        $lessons = [];
        while ($row = $stmt->fetch()) {
            $lessonId = (int)$row['id'];
            $lessons[] = [
                "id" => $lessonId,
                "courseId" => (int)$row['course_id'],
                "title" => $row['title'],
                "duration" => $row['duration'],
                "videoUrl" => $row['video_url'],
                "order" => (int)$row['lesson_order'],
                "isCompleted" => false
            ];
        }

        // Check completion stamps for authenticated student
        if ($currentUser) {
            $compQuery = "SELECT lesson_id FROM lesson_progress WHERE user_id = :uid AND course_id = :cid";
            $compStmt = $db->prepare($compQuery);
            $compStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $compStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
            $compStmt->execute();

            $completedLessonIds = $compStmt->fetchAll(PDO::FETCH_COLUMN, 0);
            
            foreach ($lessons as &$lesson) {
                if (in_array($lesson['id'], $completedLessonIds)) {
                    $lesson['isCompleted'] = true;
                }
            }
        }

        jsonResponse("success", "Lesson curriculum extracted.", $lessons);
    } catch (PDOException $e) {
        jsonResponse("error", "Database error: " . $e->getMessage(), [], 500);
    }
}

/**
 * Upload new lesson (ADMIN ONLY)
 */
function handlePost($db) {
    requireAdmin($db);
    $data = getRequestData();

    $courseId = isset($data['courseId']) ? (int)$data['courseId'] : 0;
    $title = isset($data['title']) ? trim($data['title']) : '';
    $duration = isset($data['duration']) ? trim($data['duration']) : '10 mins';
    $videoUrl = isset($data['videoUrl']) ? trim($data['videoUrl']) : null;
    $order = isset($data['order']) ? (int)$data['order'] : 0;

    if ($courseId <= 0 || empty($title)) {
        jsonResponse("failed", "CourseId and title are required parameters.", [], 400);
    }

    // Set implicit sequential order if none provided
    if ($order <= 0) {
        $orderQuery = "SELECT COALESCE(MAX(lesson_order), 0) + 1 FROM lessons WHERE course_id = :cid";
        $orderStmt = $db->prepare($orderQuery);
        $orderStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
        $orderStmt->execute();
        $order = (int)$orderStmt->fetchColumn();
    }

    try {
        $query = "INSERT INTO lessons (course_id, title, duration, video_url, lesson_order) 
                  VALUES (:course_id, :title, :duration, :video_url, :order)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":course_id", $courseId, PDO::PARAM_INT);
        $stmt->bindParam(":title", $title, PDO::PARAM_STR);
        $stmt->bindParam(":duration", $duration, PDO::PARAM_STR);
        $stmt->bindParam(":video_url", $videoUrl, PDO::PARAM_STR);
        $stmt->bindParam(":order", $order, PDO::PARAM_INT);

        if ($stmt->execute()) {
            jsonResponse("success", "Lesson published to course agenda index.", [
                "id" => (int)$db->lastInsertId(),
                "courseId" => $courseId,
                "title" => $title,
                "duration" => $duration,
                "videoUrl" => $videoUrl,
                "order" => $order
            ], 201);
        } else {
            jsonResponse("failed", "Record insertion aborted.", [], 500);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}

/**
 * Remove lesson (ADMIN ONLY)
 */
function handleDelete($db) {
    requireAdmin($db);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        jsonResponse("failed", "Mandatory query parameter 'id' required.", [], 400);
    }

    try {
        $query = "DELETE FROM lessons WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            jsonResponse("success", "Lesson successfully erased.", ["deleted_id" => $id]);
        } else {
            jsonResponse("failed", "Matching lesson record not found.", [], 404);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "Database connection issue: " . $e->getMessage(), [], 500);
    }
}
?>
