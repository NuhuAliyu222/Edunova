<?php
/**
 * Users, Students, & Administrative Personnel Rest API
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
    case 'PUT':
        handlePut($db);
        break;
    case 'DELETE':
        handleDelete($db);
        break;
    default:
        jsonResponse("failed", "Http verb trigger not permitted.", [], 405);
}

/**
 * Fetch users (ADMIN ONLY, lists active student rosters)
 */
function handleGet($db) {
    requireAdmin($db); // Verification barrier
    
    try {
        $query = "SELECT id, name, username, email, phone, gender, dob, bio, role, registered_at 
                  FROM users 
                  WHERE role = 'student' 
                  ORDER BY id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $students = [];
        while ($row = $stmt->fetch()) {
            $row['id'] = (int)$row['id'];
            $students[] = $row;
        }

        jsonResponse("success", "Active student directory aggregated successfully.", $students);
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}

/**
 * Handle Profile Updates (Supports Student modifying their own phone/bio/dob)
 */
function handlePut($db) {
    $currentUser = requireAuth($db);
    $data = getRequestData();

    $name = isset($data['name']) ? trim($data['name']) : '';
    $phone = isset($data['phone']) ? trim($data['phone']) : null;
    $gender = isset($data['gender']) ? trim($data['gender']) : null;
    $dob = isset($data['dob']) ? trim($data['dob']) : null;
    $bio = isset($data['bio']) ? trim($data['bio']) : null;

    if (empty($name)) {
        jsonResponse("failed", "Name is a required field.", [], 400);
    }

    try {
        $query = "UPDATE users SET name = :name, phone = :phone, gender = :gender, dob = :dob, bio = :bio 
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":name", $name, PDO::PARAM_STR);
        $stmt->bindParam(":phone", $phone, PDO::PARAM_STR);
        $stmt->bindParam(":gender", $gender, PDO::PARAM_STR);
        $stmt->bindParam(":dob", $dob, PDO::PARAM_STR);
        $stmt->bindParam(":bio", $bio, PDO::PARAM_STR);
        $stmt->bindParam(":id", $currentUser['id'], PDO::PARAM_INT);
        $stmt->execute();

        // Retrieve modified profile payload
        $refStmt = $db->prepare("SELECT id, name, username, email, phone, gender, dob, bio, role, registered_at FROM users WHERE id = :id LIMIT 1");
        $refStmt->bindParam(":id", $currentUser['id'], PDO::PARAM_INT);
        $refStmt->execute();
        $updatedUser = $refStmt->fetch();
        $updatedUser['id'] = (int)$updatedUser['id'];

        jsonResponse("success", "User profile changes finalized in administrative registries.", $updatedUser);
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure during modifier execution: " . $e->getMessage(), [], 500);
    }
}

/**
 * Delete / Expel Student account (ADMIN ONLY)
 */
function handleDelete($db) {
    requireAdmin($db);
    $targetId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($targetId <= 0) {
        jsonResponse("failed", "Target user 'id' required in parameter queries.", [], 400);
    }

    try {
        $query = "DELETE FROM users WHERE id = :id AND role = 'student'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $targetId, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            jsonResponse("success", "Student record fully expunged from database.", ["deleted_id" => $targetId]);
        } else {
            jsonResponse("failed", "No student matches the provided ID.", [], 404);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "SQL failed: " . $e->getMessage(), [], 500);
    }
}
?>
