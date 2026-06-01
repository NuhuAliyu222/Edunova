<?php
/**
 * Interactive Academy Quizzes Rest API
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
        jsonResponse("failed", "Http method not permitted.", [], 405);
}

/**
 * Retrieve Questions for target course
 */
function handleGet($db) {
    $courseId = isset($_GET['courseId']) ? (int)$_GET['courseId'] : 0;
    if ($courseId <= 0) {
        jsonResponse("failed", "Query parameter 'courseId' is required.", [], 400);
    }

    try {
        $query = "SELECT id, course_id, question, options, correct_index FROM quiz_questions WHERE course_id = :cid";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
        $stmt->execute();

        $questions = [];
        $currentUser = getAuthUser($db);
        $isAdmin = ($currentUser && $currentUser['role'] === 'admin');

        while ($row = $stmt->fetch()) {
            // Options are stored as JSON strings in SQL; decode neatly
            $optionsDecoded = json_decode($row['options'], true);
            if (!is_array($optionsDecoded)) {
                $optionsDecoded = [];
            }

            $questionItem = [
                "id" => (int)$row['id'],
                "courseId" => (int)$row['course_id'],
                "question" => $row['question'],
                "options" => $optionsDecoded
            ];

            // Hide correct_index from standard students preventing frontend network cheating!
            // Only expose to admins or when checking answers manually
            if ($isAdmin) {
                $questionItem["correctIndex"] = (int)$row['correct_index'];
            }

            $questions[] = $questionItem;
        }

        jsonResponse("success", "Quiz questions compiled successfully.", $questions);
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}

/**
 * Submit Quiz Answers (Secure Server-side evaluation & score logs)
 */
function handlePost($db) {
    $currentUser = requireAuth($db);
    $data = getRequestData();

    $courseId = isset($data['courseId']) ? (int)$data['courseId'] : 0;
    $answers = isset($data['answers']) ? $data['answers'] : null; // Key-value map: { "questionId": selectedIndex }

    if ($courseId <= 0 || !is_array($answers)) {
        jsonResponse("failed", "Mandatory fields 'courseId' and 'answers' object must be supplied.", [], 400);
    }

    try {
        // Fetch matching questions for correct indexes evaluation
        $query = "SELECT id, correct_index FROM quiz_questions WHERE course_id = :cid";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            jsonResponse("failed", "No quiz configuration exists for specified course id.", [], 404);
        }

        $correctMap = [];
        while ($row = $stmt->fetch()) {
            $correctMap[(int)$row['id']] = (int)$row['correct_index'];
        }

        $totalCount = count($correctMap);
        $correctCount = 0;

        foreach ($correctMap as $qid => $correctIdx) {
            if (isset($answers[$qid]) && (int)$answers[$qid] === $correctIdx) {
                $correctCount++;
            }
        }

        // Percentage calculation
        $scorePercentage = ($totalCount > 0) ? round(($correctCount / $totalCount) * 100, 2) : 0;

        // Persistent save of attempt log index
        $logQuery = "INSERT INTO quiz_attempts (user_id, course_id, score, correct_count, total_count) 
                     VALUES (:uid, :cid, :score, :correct, :total)";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
        $logStmt->bindParam(":cid", $courseId, PDO::PARAM_INT);
        $logStmt->bindParam(":score", $scorePercentage, PDO::PARAM_STR);
        $logStmt->bindParam(":correct", $correctCount, PDO::PARAM_INT);
        $logStmt->bindParam(":total", $totalCount, PDO::PARAM_INT);
        $logStmt->execute();

        $attemptId = $db->lastInsertId();

        $resultPayload = [
            "attemptId" => (int)$attemptId,
            "score" => (float)$scorePercentage,
            "correctCount" => $correctCount,
            "totalCount" => $totalCount,
            "attemptedAt" => date('Y-m-d H:i:s')
        ];

        // Trigger dynamic system notifications in cases of scoring breakthroughs
        if ($scorePercentage >= 80) {
            $highScoreText = "🎓 Brilliant! You scored {$scorePercentage}% on the Course quiz! Stand proud on the interactive leaderboards!";
            $sysStmt = $db->prepare("INSERT INTO messages (user_id, text, sender, is_read) VALUES (:uid, :txt, 'system', 0)");
            $sysStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $sysStmt->bindParam(":txt", $highScoreText, PDO::PARAM_STR);
            $sysStmt->execute();
        }

        jsonResponse("success", "Quiz evaluated and score recorded securely.", $resultPayload);

    } catch (PDOException $e) {
        jsonResponse("error", "Failed evaluating quiz: " . $e->getMessage(), [], 500);
    }
}
?>
