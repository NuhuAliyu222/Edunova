<?php

require_once __DIR__ . '/../models/Review.php';
require_once __DIR__ . '/../models/Course.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class ReviewController
{
    private Review $reviewModel;
    private Course $courseModel;
    
    public function __construct(PDO $db)
    {
        $this->reviewModel = new Review($db);
        $this->courseModel = new Course($db);
    }
    
    public function getCourseReviews(int $courseId)
    {
        $course = $this->courseModel->getById($courseId);
        if (!$course) {
            return Response::error('Course not found', 404);
        }
        
        $reviews = $this->reviewModel->getByCourse($courseId);
        $average = $this->reviewModel->getAverageRating($courseId);
        
        return Response::success([
            'reviews' => $reviews,
            'average_rating' => $average,
            'total_reviews' => count($reviews)
        ]);
    }
    
    public function addReview(array $authUser, object $data)
    {
        $missing = Validator::required(['course_id', 'rating'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        
        $userId = (int) $authUser['user_id'];
        $courseId = (int) $data->course_id;
        $rating = (int) $data->rating;
        $comment = $data->comment ?? '';
        
        if ($rating < 1 || $rating > 5) {
            return Response::error('Rating must be between 1 and 5', 422);
        }
        
        // Check if user is enrolled
        if (!$this->courseModel->isEnrolled($userId, $courseId)) {
            return Response::error('You must be enrolled to review this course', 403);
        }
        
        $review = $this->reviewModel->create($userId, $courseId, $rating, $comment);
        return Response::success($review, 'Review added successfully', 201);
    }
    
    public function deleteReview(array $authUser, int $id)
    {
        $userId = (int) $authUser['user_id'];
        $role = $authUser['role'] ?? 'student';
        
        // Admins can delete any review
        if ($role === 'admin') {
            $deleted = $this->reviewModel->delete($id, null);
        } else {
            $deleted = $this->reviewModel->delete($id, $userId);
        }
        
        if (!$deleted) {
            return Response::error('Review not found or unauthorized', 404);
        }
        
        return Response::success(null, 'Review deleted successfully');
    }
}