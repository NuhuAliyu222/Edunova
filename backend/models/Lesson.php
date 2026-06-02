<?php

class Lesson
{
    private PDO $conn;
    private string $table = 'lessons';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByCourse(int $courseId): array
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE course_id = :course_id ORDER BY id ASC");
        $stmt->bindValue(':course_id', $courseId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function countByCourse(int $courseId): int
    {
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM {$this->table} WHERE course_id = :course_id");
        $stmt->bindValue(':course_id', $courseId, PDO::PARAM_INT);
        $stmt->execute();
        return (int) $stmt->fetchColumn();
    }

    public function create(array $data): ?int
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (course_id, title, video_url, pdf_url, duration)
             VALUES (:course_id, :title, :video_url, :pdf_url, :duration)"
        );
        $stmt->execute([
            ':course_id' => $data['course_id'],
            ':title' => $data['title'],
            ':video_url' => $data['video_url'] ?? '',
            ':pdf_url' => $data['pdf_url'] ?? '',
            ':duration' => $data['duration'] ?? '',
        ]);
        return (int) $this->conn->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET course_id = :course_id, title = :title,
             video_url = :video_url, pdf_url = :pdf_url, duration = :duration WHERE id = :id"
        );
        return $stmt->execute([
            ':id' => $id,
            ':course_id' => $data['course_id'],
            ':title' => $data['title'],
            ':video_url' => $data['video_url'] ?? '',
            ':pdf_url' => $data['pdf_url'] ?? '',
            ':duration' => $data['duration'] ?? '',
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
