<?php

require_once __DIR__ . '/../models/Bookmark.php';
require_once __DIR__ . '/../models/Course.php';
require_once __DIR__ . '/../helpers/Response.php';

class BookmarkController
{
    private Bookmark $bookmarkModel;
    private Course $courseModel;
    
    public function __construct(PDO $db)
    {
        $this->bookmarkModel = new Bookmark($db);
        $this->courseModel = new Course($db);
    }
    
    public function getUserBookmarks(array $authUser)
    {
        $userId = (int) $authUser['user_id'];
        $bookmarks = $this->bookmarkModel->getByUser($userId);
        return Response::success($bookmarks);
    }
    
    public function addBookmark(array $authUser, object $data)
    {
        $missing = Validator::required(['course_id'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        
        $userId = (int) $authUser['user_id'];
        $courseId = (int) $data->course_id;
        
        $course = $this->courseModel->getById($courseId);
        if (!$course) {
            return Response::error('Course not found', 404);
        }
        
        $added = $this->bookmarkModel->add($userId, $courseId);
        if (!$added) {
            return Response::error('Failed to add bookmark', 500);
        }
        
        return Response::success(null, 'Bookmark added successfully', 201);
    }
    
    public function removeBookmark(array $authUser, int $courseId)
    {
        $userId = (int) $authUser['user_id'];
        
        $removed = $this->bookmarkModel->remove($userId, $courseId);
        if (!$removed) {
            return Response::error('Bookmark not found', 404);
        }
        
        return Response::success(null, 'Bookmark removed successfully');
    }
    
    public function isBookmarked(array $authUser, int $courseId)
    {
        $userId = (int) $authUser['user_id'];
        $isBookmarked = $this->bookmarkModel->isBookmarked($userId, $courseId);
        
        return Response::success(['is_bookmarked' => $isBookmarked]);
    }
}