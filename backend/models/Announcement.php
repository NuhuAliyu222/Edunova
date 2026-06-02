<?php

class Announcement
{
    private PDO $conn;
    private string $table = 'announcements';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByCourse(int $courseId): array
    {
        $stmt = $this->conn->prepare("
            SELECT a.*, u.name as author_name, u.profile_image
            FROM {$this->table} a
            JOIN users u ON a.author_id = u.id
            WHERE a.course_id = :course_id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([':course_id' => $courseId]);
        return $stmt->fetchAll();
    }

    public function create(int $courseId, int $authorId, string $title, string $content): ?array
    {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (course_id, author_id, title, content)
            VALUES (:course_id, :author_id, :title, :content)
        ");
        $stmt->execute([
            ':course_id' => $courseId,
            ':author_id' => $authorId,
            ':title' => $title,
            ':content' => $content
        ]);
        
        $id = (int) $this->conn->lastInsertId();
        return $this->getById($id);
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->conn->prepare("
            SELECT a.*, u.name as author_name
            FROM {$this->table} a
            JOIN users u ON a.author_id = u.id
            WHERE a.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function update(int $id, string $title, string $content): bool
    {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET title = :title, content = :content, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        return $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':content' => $content
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}