<?php

class Quiz
{
    private PDO $conn;
    private string $table = 'quizzes';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByCourse(int $courseId): array
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE course_id = :course_id ORDER BY id ASC");
        $stmt->bindValue(':course_id', $courseId, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            if (isset($row['options']) && is_string($row['options'])) {
                $row['options'] = json_decode($row['options'], true) ?: [];
            }
        }
        return $rows;
    }

    public function getAll(): array
    {
        $rows = $this->conn->query("SELECT q.*, c.title AS course_title FROM {$this->table} q
            LEFT JOIN courses c ON c.id = q.course_id ORDER BY q.id DESC")->fetchAll();
        foreach ($rows as &$row) {
            if (isset($row['options']) && is_string($row['options'])) {
                $row['options'] = json_decode($row['options'], true) ?: [];
            }
        }
        return $rows;
    }

    public function create(array $data): ?int
    {
        $options = is_array($data['options'] ?? null)
            ? json_encode($data['options'])
            : ($data['options'] ?? '[]');
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (course_id, question, options, correct_answer)
             VALUES (:course_id, :question, :options, :correct_answer)"
        );
        $stmt->execute([
            ':course_id' => $data['course_id'],
            ':question' => $data['question'],
            ':options' => $options,
            ':correct_answer' => $data['correct_answer'] ?? '',
        ]);
        return (int) $this->conn->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $options = is_array($data['options'] ?? null)
            ? json_encode($data['options'])
            : ($data['options'] ?? '[]');
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET course_id = :course_id, question = :question,
             options = :options, correct_answer = :correct_answer WHERE id = :id"
        );
        return $stmt->execute([
            ':id' => $id,
            ':course_id' => $data['course_id'],
            ':question' => $data['question'],
            ':options' => $options,
            ':correct_answer' => $data['correct_answer'] ?? '',
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function count(): int
    {
        return (int) $this->conn->query("SELECT COUNT(*) FROM {$this->table}")->fetchColumn();
    }

    public static function stripCorrectAnswers(array $rows): array
    {
        return array_map(function ($row) {
            unset($row['correct_answer']);
            return $row;
        }, $rows);
    }
}
