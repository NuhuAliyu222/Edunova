<?php

require_once __DIR__ . '/../models/Quiz.php';
require_once __DIR__ . '/../models/Progress.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Validator.php';

class QuizController
{
    private Quiz $quizModel;
    private Progress $progressModel;

    public function __construct(PDO $db)
    {
        $this->quizModel = new Quiz($db);
        $this->progressModel = new Progress($db);
    }

    public function getAll()
    {
        return Response::success($this->quizModel->getAll());
    }

    public function getByCourse(int $courseId, bool $includeAnswers = false)
    {
        $rows = $this->quizModel->getByCourse($courseId);
        if (!$includeAnswers) {
            $rows = Quiz::stripCorrectAnswers($rows);
        }
        return Response::success($rows);
    }

    public function create(object $data)
    {
        $missing = Validator::required(['course_id', 'question'], $data);
        if ($missing) {
            return Response::error('Validation failed', 422, $missing);
        }
        $id = $this->quizModel->create([
            'course_id' => (int) $data->course_id,
            'question' => trim($data->question),
            'options' => $data->options ?? [],
            'correct_answer' => $data->correct_answer ?? '',
        ]);
        return Response::success(['id' => $id], 'Quiz created', 201);
    }

    public function update(int $id, object $data)
    {
        $ok = $this->quizModel->update($id, [
            'course_id' => (int) ($data->course_id ?? 0),
            'question' => trim($data->question ?? ''),
            'options' => $data->options ?? [],
            'correct_answer' => $data->correct_answer ?? '',
        ]);
        if (!$ok) {
            return Response::error('Could not update quiz', 500);
        }
        return Response::success(null, 'Quiz updated');
    }

    public function delete(int $id)
    {
        if (!$this->quizModel->delete($id)) {
            return Response::error('Could not delete quiz', 500);
        }
        return Response::success(null, 'Quiz deleted');
    }

    public function submit(array $authUser, object $data)
    {
        $answers = $data->answers ?? [];
        if (is_array($answers)) {
            $answers = (object) $answers;
        }
        $courseId = (int) ($data->course_id ?? 0);
        if (!$courseId) {
            return Response::error('course_id is required', 422);
        }

        $quizzes = $this->quizModel->getByCourse($courseId);
        $total = count($quizzes);
        $correct = 0;

        foreach ($quizzes as $quiz) {
            $qid = (string) $quiz['id'];
            $submitted = isset($answers->$qid) ? (string) $answers->$qid : '';
            if ($submitted !== '' && $submitted === (string) $quiz['correct_answer']) {
                $correct++;
            }
        }

        $score = $total > 0 ? (int) round(($correct / $total) * 100) : 0;
        $this->progressModel->saveQuizScore((int) $authUser['user_id'], $courseId, $score);

        return Response::success([
            'score' => $score,
            'correct' => $correct,
            'total' => $total,
        ], 'Quiz submitted');
    }
}
