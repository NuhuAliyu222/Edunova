<?php

require_once __DIR__ . '/../models/Announcement.php';
require_once __DIR__ . '/../models/Course.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class AnnouncementController
{
    private Announcement $announcementModel;
    private Course $courseModel;
    
    public function __construct(PDO $db)
    {
        $this->announcementModel = new Announcement($db);
        $this->courseModel = new Course($db);
    }
    
    public function getCourseAnnouncements(int $courseId)
    {
        $course = $this->courseModel->getById($courseId);
        if (!$course) {
            return Response::error('Course not found', 404);
        }
        
        $announcements = $this->announcementModel->getByCourse($courseId);
        return Response::success($announcements);
    }
    
    public function createAnnouncement(array $authUser, object $data)
    {
        $missing = Validator::required(['course_id', 'title', 'content'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        
        $userId = (int) $authUser['user_id'];
        $role = $authUser['role'] ?? 'student';
        $courseId = (int) $data->course_id;
        
        // Only admins and instructors can create announcements
        if ($role !== 'admin' && $role !== 'instructor') {
            return Response::error('Unauthorized to create announcements', 403);
        }
        
        $course = $this->courseModel->getById($courseId);
        if (!$course) {
            return Response::error('Course not found', 404);
        }
        
        // Check if instructor owns this course
        if ($role === 'instructor' && $course['instructor_id'] != $userId) {
            return Response::error('You can only post announcements for your own courses', 403);
        }
        
        $announcement = $this->announcementModel->create(
            $courseId,
            $userId,
            $data->title,
            $data->content
        );
        
        return Response::success($announcement, 'Announcement created successfully', 201);
    }
    
    public function updateAnnouncement(array $authUser, int $id, object $data)
    {
        $userId = (int) $authUser['user_id'];
        $role = $authUser['role'] ?? 'student';
        
        $announcement = $this->announcementModel->getById($id);
        if (!$announcement) {
            return Response::error('Announcement not found', 404);
        }
        
        // Check permissions
        if ($role !== 'admin' && $announcement['author_id'] != $userId) {
            return Response::error('Unauthorized to update this announcement', 403);
        }
        
        $title = $data->title ?? $announcement['title'];
        $content = $data->content ?? $announcement['content'];
        
        $updated = $this->announcementModel->update($id, $title, $content);
        if (!$updated) {
            return Response::error('Failed to update announcement', 500);
        }
        
        return Response::success($this->announcementModel->getById($id), 'Announcement updated successfully');
    }
    
    public function deleteAnnouncement(array $authUser, int $id)
    {
        $userId = (int) $authUser['user_id'];
        $role = $authUser['role'] ?? 'student';
        
        $announcement = $this->announcementModel->getById($id);
        if (!$announcement) {
            return Response::error('Announcement not found', 404);
        }
        
        // Check permissions
        if ($role !== 'admin' && $announcement['author_id'] != $userId) {
            return Response::error('Unauthorized to delete this announcement', 403);
        }
        
        $deleted = $this->announcementModel->delete($id);
        if (!$deleted) {
            return Response::error('Failed to delete announcement', 500);
        }
        
        return Response::success(null, 'Announcement deleted successfully');
    }
}