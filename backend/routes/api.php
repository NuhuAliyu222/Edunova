<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 3600');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/Authorization.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/CourseController.php';
require_once __DIR__ . '/../controllers/LessonController.php';
require_once __DIR__ . '/../controllers/QuizController.php';
require_once __DIR__ . '/../controllers/StudentController.php';
require_once __DIR__ . '/../controllers/CertificateController.php';
require_once __DIR__ . '/../controllers/ReviewController.php';
require_once __DIR__ . '/../controllers/BookmarkController.php';
require_once __DIR__ . '/../controllers/AnnouncementController.php';
require_once __DIR__ . '/../controllers/MessageController.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    Response::error('Database connection failed', 503);
}

$authMiddleware = new AuthMiddleware();
$authController = new AuthController($db);
$courseController = new CourseController($db);
$lessonController = new LessonController($db);
$quizController = new QuizController($db);
$studentController = new StudentController($db);
$certificateController = new CertificateController($db);
$reviewController = new ReviewController($db);
$bookmarkController = new BookmarkController($db);
$announcementController = new AnnouncementController($db);
$messageController = new MessageController($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$authorization = getAuthorizationHeader();

function readJsonBody(): ?object
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return (object) [];
    }
    $decoded = json_decode($raw);
    return is_object($decoded) ? $decoded : (object) [];
}

try {
    switch ($method) {
        case 'POST':
            $data = readJsonBody();
            switch ($action) {
                case 'register':
                    $missing = Validator::required(['name', 'email', 'password'], $data);
                    if ($missing) Response::error('Validation failed', 422, $missing);
                    $authController->register($data->name, $data->email, $data->password);
                    break;
                case 'login':
                    $missing = Validator::required(['email', 'password'], $data);
                    if ($missing) Response::error('Validation failed', 422, $missing);
                    $authController->login($data->email, $data->password);
                    break;
                case 'adminLogin':
                    $missing = Validator::required(['email', 'password'], $data);
                    if ($missing) Response::error('Validation failed', 422, $missing);
                    $authController->login($data->email, $data->password, 'admin');
                    break;
                case 'createCourse':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    $courseController->createCourse($data);
                    break;
                case 'createLesson':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    $lessonController->create($data);
                    break;
                case 'createQuiz':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    $quizController->create($data);
                    break;
                case 'submitQuiz':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $quizController->submit($user, $data);
                    break;
                case 'markLessonComplete':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $studentController->markLessonComplete($user, $data);
                    break;
                case 'enrollCourse':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $studentController->enrollCourse($user, $data);
                    break;
                case 'addReview':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $reviewController->addReview($user, $data);
                    break;
                case 'addBookmark':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $bookmarkController->addBookmark($user, $data);
                    break;
                case 'createAnnouncement':
                    $user = $authMiddleware->requireAuth($authorization);
                    $announcementController->createAnnouncement($user, $data);
                    break;
                case 'sendMessage':
                    $user = $authMiddleware->requireAuth($authorization);
                    $messageController->sendMessage($user, $data);
                    break;
                case 'generateCertificate':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $certificateController->generateCertificate($user, $data->course_id ?? 0);
                    break;
                default:
                    Response::error('Unknown action', 404);
            }
            break;

        case 'GET':
            switch ($action) {
                case 'health':
                    Response::success(['status' => 'ok', 'service' => 'Edunova API']);
                    break;
                case 'getCourses':
                    $courseController->getAllCourses();
                    break;
                case 'getCourse':
                    if (!$id) Response::error('Course id required', 422);
                    $courseController->getCourse($id);
                    break;
                case 'getLessons':
                    if (!$id) Response::error('Course id required', 422);
                    $lessonController->getByCourse($id);
                    break;
                case 'getQuizzes':
                    $quizUser = $authMiddleware->verifyJWT($authorization);
                    $isAdmin = is_array($quizUser) && ($quizUser['role'] ?? '') === 'admin';
                    if ($id) {
                        $quizController->getByCourse($id, $isAdmin);
                    } else {
                        $quizController->getAll();
                    }
                    break;
                case 'profile':
                    $user = $authMiddleware->requireAuth($authorization);
                    $authController->profile($user);
                    break;
                case 'studentDashboard':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $studentController->dashboard($user);
                    break;
                case 'getCourseProgress':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    if (!$id) Response::error('Course id required', 422);
                    $studentController->getCourseProgress($user, $id);
                    break;
                case 'getMyProgress':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $studentController->getMyProgress($user);
                    break;
                case 'getStudents':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    $studentController->listStudents();
                    break;
                case 'getInstructors':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    $studentController->listInstructors();
                    break;
                case 'adminStats':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    $studentController->adminStats();
                    break;
                case 'getCourseReviews':
                    if (!$id) Response::error('Course id required', 422);
                    $reviewController->getCourseReviews($id);
                    break;
                case 'getUserBookmarks':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $bookmarkController->getUserBookmarks($user);
                    break;
                case 'isBookmarked':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    if (!$id) Response::error('Course id required', 422);
                    $bookmarkController->isBookmarked($user, $id);
                    break;
                case 'getCourseAnnouncements':
                    if (!$id) Response::error('Course id required', 422);
                    $announcementController->getCourseAnnouncements($id);
                    break;
                case 'getInbox':
                    $user = $authMiddleware->requireAuth($authorization);
                    $messageController->getInbox($user);
                    break;
                case 'getOutbox':
                    $user = $authMiddleware->requireAuth($authorization);
                    $messageController->getOutbox($user);
                    break;
                case 'getMessage':
                    $user = $authMiddleware->requireAuth($authorization);
                    if (!$id) Response::error('Message id required', 422);
                    $messageController->getMessage($user, $id);
                    break;
                case 'getUnreadCount':
                    $user = $authMiddleware->requireAuth($authorization);
                    $messageController->getUnreadCount($user);
                    break;
                case 'getUserCertificates':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    $certificateController->getUserCertificates($user);
                    break;
                case 'getCertificate':
                    if (!$id) Response::error('Certificate id required', 422);
                    $certificateController->getCertificate($id);
                    break;
                default:
                    Response::error('Unknown action', 404);
            }
            break;

        case 'PUT':
            $data = readJsonBody();
            $user = $authMiddleware->requireAuth($authorization);
            switch ($action) {
                case 'updateProfile':
                    $missing = Validator::required(['name', 'email'], $data);
                    if ($missing) Response::error('Validation failed', 422, $missing);
                    $authController->updateProfile($user, $data->name, $data->email);
                    break;
                case 'updateCourse':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Course id required', 422);
                    $courseController->updateCourse($id, $data);
                    break;
                case 'updateLesson':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Lesson id required', 422);
                    $lessonController->update($id, $data);
                    break;
                case 'updateQuiz':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Quiz id required', 422);
                    $quizController->update($id, $data);
                    break;
                case 'updateAnnouncement':
                    $authMiddleware->requireAuth($authorization);
                    if (!$id) Response::error('Announcement id required', 422);
                    $announcementController->updateAnnouncement($user, $id, $data);
                    break;
                default:
                    Response::error('Unknown action', 404);
            }
            break;

        case 'DELETE':
            $authMiddleware->requireAuth($authorization);
            switch ($action) {
                case 'deleteCourse':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Course id required', 422);
                    $courseController->deleteCourse($id);
                    break;
                case 'deleteLesson':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Lesson id required', 422);
                    $lessonController->delete($id);
                    break;
                case 'deleteQuiz':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Quiz id required', 422);
                    $quizController->delete($id);
                    break;
                case 'deleteStudent':
                    $authMiddleware->requireAuth($authorization, 'admin');
                    if (!$id) Response::error('Student id required', 422);
                    $studentController->deleteStudent($id);
                    break;
                case 'deleteReview':
                    $authMiddleware->requireAuth($authorization);
                    if (!$id) Response::error('Review id required', 422);
                    $reviewController->deleteReview($user, $id);
                    break;
                case 'removeBookmark':
                    $user = $authMiddleware->requireAuth($authorization, 'student');
                    if (!$id) Response::error('Course id required', 422);
                    $bookmarkController->removeBookmark($user, $id);
                    break;
                case 'deleteAnnouncement':
                    if (!$id) Response::error('Announcement id required', 422);
                    $announcementController->deleteAnnouncement($user, $id);
                    break;
                default:
                    Response::error('Unknown action', 404);
            }
            break;

        default:
            Response::error('Method not allowed', 405);
    }
} catch (Throwable $e) {
    error_log($e->getMessage());
    Response::error('Internal server error', 500);
}