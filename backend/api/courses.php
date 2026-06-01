<?php
/**
 * Course Management & Catalog REST API
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
    case 'PUT':
        handlePut($db);
        break;
    case 'DELETE':
        handleDelete($db);
        break;
    default:
        jsonResponse("failed", "Requested HTTP method is not permitted on this resource.", [], 405);
}

/**
 * Handle GET Requests (Fetch single course, filter list, query catalogs)
 */
function handleGet($db) {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Optional logged-in context check to see personal enrollment statuses
    $currentUser = getAuthUser($db);

    if ($id > 0) {
        // Fetch specific course details
        $query = "SELECT * FROM courses WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            jsonResponse("failed", "Curriculum course module not found in catalog.", [], 404);
        }

        $course = $stmt->fetch();
        
        // Convert prices/ratings explicitly to numbers
        $course['id'] = (int)$course['id'];
        $course['price'] = (float)$course['price'];
        $course['rating'] = (float)$course['rating'];
        $course['reviewsCount'] = (int)$course['reviews_count'];
        unset($course['reviews_count']);

        // Check if current authenticated user is enrolled
        $course['isEnrolled'] = false;
        if ($currentUser) {
            $enrollQuery = "SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid LIMIT 1";
            $enrollStmt = $db->prepare($enrollQuery);
            $enrollStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
            $enrollStmt->bindParam(":cid", $id, PDO::PARAM_INT);
            $enrollStmt->execute();
            $course['isEnrolled'] = $enrollStmt->rowCount() > 0;
        }

        jsonResponse("success", "Course records obtained.", $course);
    } else {
        // Build collaborative dynamic sql query
        $conditions = [];
        $params = [];

        if (!empty($category)) {
            $conditions[] = "category = :category";
            $params[':category'] = $category;
        }

        if (!empty($search)) {
            $conditions[] = "(title LIKE :search OR description LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";
        $query = "SELECT * FROM courses {$whereClause} ORDER BY id DESC";
        $stmt = $db->prepare($query);

        foreach ($params as $key => &$val) {
            $stmt->bindParam($key, $val, PDO::PARAM_STR);
        }

        $stmt->execute();
        $results = [];

        while ($row = $stmt->fetch()) {
            $row['id'] = (int)$row['id'];
            $row['price'] = (float)$row['price'];
            $row['rating'] = (float)$row['rating'];
            $row['reviewsCount'] = (int)$row['reviews_count'];
            unset($row['reviews_count']);
            
            // Check enrollment logic dynamically per list item
            $row['isEnrolled'] = false;
            if ($currentUser) {
                $enrollQuery = "SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid LIMIT 1";
                $enrollStmt = $db->prepare($enrollQuery);
                $enrollStmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
                $enrollStmt->bindParam(":cid", $row['id'], PDO::PARAM_INT);
                $enrollStmt->execute();
                $row['isEnrolled'] = $enrollStmt->rowCount() > 0;
            }
            
            $results[] = $row;
        }

        jsonResponse("success", "Course list aggregated.", $results);
    }
}

/**
 * Handle POST Requests (Create course - ADMIN ONLY)
 */
function handlePost($db) {
    requireAdmin($db); // Verification barrier
    $data = getRequestData();

    $title = isset($data['title']) ? trim($data['title']) : '';
    $description = isset($data['description']) ? trim($data['description']) : '';
    $category = isset($data['category']) ? trim($data['category']) : '';
    $instructor = isset($data['instructor']) ? trim($data['instructor']) : '';
    $price = isset($data['price']) ? (float)$data['price'] : 0.00;
    $thumbnail = isset($data['thumbnail']) ? trim($data['thumbnail']) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';

    if (empty($title) || empty($description) || empty($category) || empty($instructor)) {
        jsonResponse("failed", "Title, description, category, and instructor are mandatory course variables.", [], 400);
    }

    try {
        $query = "INSERT INTO courses (title, description, category, instructor, price, thumbnail, rating, reviews_count) 
                  VALUES (:title, :description, :category, :instructor, :price, :thumbnail, 5.0, 1)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":title", $title, PDO::PARAM_STR);
        $stmt->bindParam(":description", $description, PDO::PARAM_STR);
        $stmt->bindParam(":category", $category, PDO::PARAM_STR);
        $stmt->bindParam(":instructor", $instructor, PDO::PARAM_STR);
        $stmt->bindParam(":price", $price, PDO::PARAM_STR);
        $stmt->bindParam(":thumbnail", $thumbnail, PDO::PARAM_STR);

        if ($stmt->execute()) {
            $id = (int)$db->lastInsertId();
            $newCourse = [
                "id" => $id,
                "title" => $title,
                "description" => $description,
                "category" => $category,
                "instructor" => $instructor,
                "price" => $price,
                "thumbnail" => $thumbnail,
                "rating" => 5.0,
                "reviewsCount" => 1
            ];
            jsonResponse("success", "Curriculum course launched in active directory.", $newCourse, 201);
        } else {
            jsonResponse("failed", "Could not complete course database insert.", [], 500);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}

/**
 * Handle PUT Requests (Update course details - ADMIN ONLY)
 */
function handlePut($db) {
    requireAdmin($db);
    $data = getRequestData();

    $id = isset($data['id']) ? (int)$data['id'] : 0;
    if ($id <= 0) {
        jsonResponse("failed", "Please specify a valid targeting course key 'id'.", [], 400);
    }

    // Verify course exists
    $checkQuery = "SELECT 1 FROM courses WHERE id = :id LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(":id", $id, PDO::PARAM_INT);
    $checkStmt->execute();

    if ($checkStmt->rowCount() === 0) {
        jsonResponse("failed", "Course requested for modification does not exist.", [], 404);
    }

    // Capture dynamic inputs
    $title = isset($data['title']) ? trim($data['title']) : '';
    $description = isset($data['description']) ? trim($data['description']) : '';
    $category = isset($data['category']) ? trim($data['category']) : '';
    $instructor = isset($data['instructor']) ? trim($data['instructor']) : '';
    $price = isset($data['price']) ? (float)$data['price'] : null;
    $thumbnail = isset($data['thumbnail']) ? trim($data['thumbnail']) : '';

    // Dynamically build SET parameters
    $updates = [];
    $params = [':id' => $id];

    if (!empty($title)) {
        $updates[] = "title = :title";
        $params[':title'] = $title;
    }
    if (!empty($description)) {
        $updates[] = "description = :description";
        $params[':description'] = $description;
    }
    if (!empty($category)) {
        $updates[] = "category = :category";
        $params[':category'] = $category;
    }
    if (!empty($instructor)) {
        $updates[] = "instructor = :instructor";
        $params[':instructor'] = $instructor;
    }
    if ($price !== null) {
        $updates[] = "price = :price";
        $params[':price'] = $price;
    }
    if (!empty($thumbnail)) {
        $updates[] = "thumbnail = :thumbnail";
        $params[':thumbnail'] = $thumbnail;
    }

    if (empty($updates)) {
        jsonResponse("failed", "Specify at least one parameter update in request payload.", [], 400);
    }

    try {
        $query = "UPDATE courses SET " . implode(", ", $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute($params);

        jsonResponse("success", "Course configurations successfully modified in academic record.", ["updated_id" => $id]);
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}

/**
 * Handle DELETE Requests (Delete course - ADMIN ONLY)
 */
function handleDelete($db) {
    requireAdmin($db);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        jsonResponse("failed", "Mandatory primary index targeting parameter 'id' missing in request query.", [], 400);
    }

    try {
        $query = "DELETE FROM courses WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            jsonResponse("success", "Course fully excised from educational roster.", ["deleted_id" => $id]);
        } else {
            jsonResponse("failed", "Target course index did not match records. No rows deleted.", [], 404);
        }
    } catch (PDOException $e) {
        jsonResponse("error", "Database dependency failure: " . $e->getMessage(), [], 500);
    }
}
?>
