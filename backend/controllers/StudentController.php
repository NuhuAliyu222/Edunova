<?php

require_once __DIR__ . '/../models/Progress.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Course.php';
require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../models/Lesson.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class StudentController
{
    private Progress $progressModel;
    private User $userModel;
    private Course $courseModel;
    private Quiz $quizModel;
    private Lesson $lessonModel;

    public function __construct(PDO $db)
    {
        $this->progressModel = new Progress($db);
        $this->userModel = new User($db);
        $this->courseModel = new Course($db);
        $this->quizModel = new Quiz($db);
        $this->lessonModel = new Lesson($db);
    }

    public function dashboard(array $authUser)
    {
        return Response::success($this->progressModel->getDashboardStats((int) $authUser['user_id']));
    }

    public function listStudents()
    {
        return Response::success($this->userModel->getAllStudents());
    }

    public function listInstructors()
    {
        return Response::success($this->userModel->getAllInstructors());
    }

    public function deleteStudent(int $id)
    {
        if (!$this->userModel->deleteStudent($id)) {
            return Response::error('Could not delete student', 500);
        }
        return Response::success(null, 'Student deleted');
    }

    public function adminStats()
    {
        return Response::success([
            'students' => $this->userModel->countStudents(),
            'courses' => $this->courseModel->count(),
            'quizzes' => $this->quizModel->count(),
            'enrollments' => $this->progressModel->countDistinctEnrollments(),
        ]);
    }

    public function getCourseProgress(array $authUser, int $courseId)
    {
        if (!$this->courseModel->getById($courseId)) {
            return Response::error('Course not found', 404);
        }
        $total = $this->lessonModel->countByCourse($courseId);
        $summary = $this->progressModel->getCourseProgressSummary(
            (int) $authUser['user_id'],
            $courseId,
            $total
        );
        return Response::success($summary);
    }

    public function getMyProgress(array $authUser)
    {
        return Response::success(
            $this->progressModel->getMyCoursesProgress((int) $authUser['user_id'])
        );
    }

    public function markLessonComplete(array $authUser, object $data)
    {
        $missing = Validator::required(['course_id', 'lesson_id'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }

        $courseId = (int) $data->course_id;
        $lessonId = (int) $data->lesson_id;
        $lesson = $this->lessonModel->getById($lessonId);

        if (!$lesson || (int) $lesson['course_id'] !== $courseId) {
            return Response::error('Lesson not found in this course', 404);
        }

        $ok = $this->progressModel->upsertLessonProgress(
            (int) $authUser['user_id'],
            $courseId,
            $lessonId,
            true
        );

        if (!$ok) {
            return Response::error('Could not save lesson progress', 500);
        }

        $total = $this->lessonModel->countByCourse($courseId);
        return Response::success(
            $this->progressModel->getCourseProgressSummary(
                (int) $authUser['user_id'],
                $courseId,
                $total
            ),
            'Lesson marked complete'
        );
    }

    // Add this missing method
    public function enrollCourse(array $authUser, object $data)
    {
        $missing = Validator::required(['course_id'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        
        $userId = (int) $authUser['user_id'];
        $courseId = (int) $data->course_id;
        
        // Check if course exists
        $course = $this->courseModel->getById($courseId);
        if (!$course) {
            return Response::error('Course not found', 404);
        }
        
        // Check if already enrolled
        if ($this->courseModel->isEnrolled($userId, $courseId)) {
            return Response::error('Already enrolled in this course', 400);
        }
        
        // Record enrollment and create an initial progress record
        $ok = $this->courseModel->enrollStudent($userId, $courseId)
            && $this->progressModel->saveQuizScore($userId, $courseId, 0);
        
        if (!$ok) {
            return Response::error('Could not enroll in course', 500);
        }
        
        return Response::success(null, 'Successfully enrolled in course');
    }
}