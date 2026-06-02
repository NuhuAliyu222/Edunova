<?php

require_once __DIR__ . '/../models/Course.php';
require_once __DIR__ . '/../models/Lesson.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class CourseController
{
    private Course $courseModel;
    private Lesson $lessonModel;

    public function __construct(PDO $db)
    {
        $this->courseModel = new Course($db);
        $this->lessonModel = new Lesson($db);
    }

    public function getAllCourses()
    {
        return Response::success($this->courseModel->getAll());
    }

    public function getCourse(int $id)
    {
        $course = $this->courseModel->getById($id);
        if (!$course) {
            return Response::error('Course not found', 404);
        }
        $course['lessons'] = $this->lessonModel->getByCourse($id);
        return Response::success($course);
    }

    public function createCourse(object $data)
    {
        $missing = Validator::required(['title'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        $id = $this->courseModel->create([
            'title' => trim($data->title),
            'description' => $data->description ?? '',
            'thumbnail' => $data->thumbnail ?? '',
            'category' => $data->category ?? '',
            'instructor' => $data->instructor ?? '',
            'price' => $data->price ?? 0,
        ]);
        return Response::success($this->courseModel->getById($id), 'Course created', 201);
    }

    public function updateCourse(int $id, object $data)
    {
        if (!$this->courseModel->getById($id)) {
            return Response::error('Course not found', 404);
        }
        $this->courseModel->update($id, [
            'title' => trim($data->title ?? ''),
            'description' => $data->description ?? '',
            'thumbnail' => $data->thumbnail ?? '',
            'category' => $data->category ?? '',
            'instructor' => $data->instructor ?? '',
            'price' => $data->price ?? 0,
        ]);
        return Response::success($this->courseModel->getById($id), 'Course updated');
    }

    public function deleteCourse(int $id)
    {
        if (!$this->courseModel->delete($id)) {
            return Response::error('Could not delete course', 500);
        }
        return Response::success(null, 'Course deleted');
    }
}
