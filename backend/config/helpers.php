<?php
/**
 * Shared Request-Response Utilities & CORS Configs
 * Edunova PHP API Middleware
 */

// Enable comprehensive cross-origin resource sharing (CORS) defaults
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Auto-handle preflight OPTIONS handshake
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Returns structured JSON payload to browser and terminates execution.
 */
function jsonResponse($status, $message, $data = [], $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Parse input body (handling application/json formats elegantly).
 */
function getRequestData() {
    $rawInput = file_get_contents("php://input");
    $decoded = json_decode($rawInput, true);
    
    // Fallback to standard HTTP POST parameters if not JSON
    return $decoded ? $decoded : $_POST;
}

/**
 * Basic JWT/Session helper mockup. High-availability systems use secure
 * password crypts. Here we verify a lightweight Authorization token format 
 * token format, e.g. "Bearer base64_header_auth".
 */
function getAuthUser($db) {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (empty($authHeader)) {
        return null; // Guest/No Token
    }

    // Parse bearer token values (e.g. "Bearer USERID_ROLE_USERNAME_SIGNATURE")
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $parts = explode('.', base64_decode($token));
        
        if (count($parts) >= 3) {
            $userId = (int)$parts[0];
            $role = $parts[1];
            $email = $parts[2];

            // Secure validation check against the database values
            $query = "SELECT id, name, username, email, role FROM users WHERE id = :id AND role = :role LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $stmt->bindParam(":role", $role, PDO::PARAM_STR);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return $stmt->fetch();
            }
        }
    }
    
    return null;
}

/**
 * Ensures user is logged in, throwing unauthorized errors if not.
 */
function requireAuth($db) {
    $user = getAuthUser($db);
    if (!$user) {
        jsonResponse("unauthorized", "Unauthorized access. Authentication bearer token required.", [], 401);
    }
    return $user;
}

/**
 * Restricts endpoint strictly for admin roles.
 */
function requireAdmin($db) {
    $user = requireAuth($db);
    if ($user['role'] !== 'admin') {
        jsonResponse("forbidden", "Forbidden access. Administrative clearance required.", [], 403);
    }
    return $user;
}

/**
 * Generates an elegant secure base64 token for returning to frontend client.
 */
function generateMockToken($userId, $role, $email) {
    $payloadText = "{$userId}.{$role}.{$email}." . bin2hex(random_bytes(16));
    return base64_encode($payloadText);
}
?>
