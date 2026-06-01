<?php
/**
 * Verifiable Graduate Credentials Rest API & Validation Engines
 * Edunova PHP API Endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    jsonResponse("failed", "Http verb trigger not permitted.", [], 405);
}

// Support a query param 'code' which is dynamic and publicly accessible for validation handshakes
$code = isset($_GET['code']) ? trim($_GET['code']) : '';

if (!empty($code)) {
    // PUBLIC ACCESS: Validate credentials code
    try {
        $query = "SELECT c.certificate_code, c.issued_at, u.name as user_name, co.title as course_title, co.instructor 
                  FROM certificates c 
                  JOIN users u ON c.user_id = u.id 
                  JOIN courses co ON c.course_id = co.id 
                  WHERE c.certificate_code = :code LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":code", $code, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            jsonResponse("failed", "Specified certificate tracking reference code was not recognized.", ["valid" => false], 404);
        }

        $cert = $stmt->fetch();
        $cert['valid'] = true;
        jsonResponse("success", "Certificate credential verified fully in registry database.", $cert);

    } catch (PDOException $e) {
        jsonResponse("error", "Verification process error: " . $e->getMessage(), [], 500);
    }
} else {
    // PRIVATE ACCESS: Fetch logged-in user owned certificates
    $currentUser = requireAuth($db);

    try {
        $query = "SELECT c.id, c.certificate_code as certificateCode, c.issued_at as issuedAt, 
                  u.name as userName, co.title as courseTitle, co.id as courseId
                  FROM certificates c 
                  JOIN users u ON c.user_id = u.id 
                  JOIN courses co ON c.course_id = co.id 
                  WHERE c.user_id = :uid ORDER BY c.issued_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":uid", $currentUser['id'], PDO::PARAM_INT);
        $stmt->execute();

        $certificates = [];
        while ($row = $stmt->fetch()) {
            $row['id'] = (int)$row['id'];
            $row['courseId'] = (int)$row['courseId'];
            $certificates[] = $row;
        }

        jsonResponse("success", "Student credentials list retrieved.", $certificates);
    } catch (PDOException $e) {
        jsonResponse("error", "Database failure: " . $e->getMessage(), [], 500);
    }
}
?>
