<?php

require_once __DIR__ . '/../models/Lesson.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class LessonController
{
    private Lesson $lessonModel;

    public function __construct(PDO $db)
    {
        $this->lessonModel = new Lesson($db);
    }

    public function getByCourse(int $courseId)
    {
        return Response::success($this->lessonModel->getByCourse($courseId));
    }

    public function create(object $data)
    {
        $missing = Validator::required(['course_id', 'title'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        $id = $this->lessonModel->create([
            'course_id' => (int) $data->course_id,
            'title' => trim($data->title),
            'video_url' => $data->video_url ?? '',
            'pdf_url' => $data->pdf_url ?? '',
            'duration' => $data->duration ?? '',
        ]);
        return Response::success(['id' => $id], 'Lesson created', 201);
    }

    public function update(int $id, object $data)
    {
        $ok = $this->lessonModel->update($id, [
            'course_id' => (int) ($data->course_id ?? 0),
            'title' => trim($data->title ?? ''),
            'video_url' => $data->video_url ?? '',
            'pdf_url' => $data->pdf_url ?? '',
            'duration' => $data->duration ?? '',
        ]);
        if (!$ok) {
            return Response::error('Could not update lesson', 500);
        }
        return Response::success(null, 'Lesson updated');
    }

    public function delete(int $id)
    {
        if (!$this->lessonModel->delete($id)) {
            return Response::error('Could not delete lesson', 500);
        }
        return Response::success(null, 'Lesson deleted');
    }
}
