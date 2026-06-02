<?php

class Bookmark
{
    private PDO $conn;
    private string $table = 'bookmarks';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByUser(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT b.*, c.title, c.thumbnail, c.category, u.name as instructor_name
            FROM {$this->table} b
            JOIN courses c ON b.course_id = c.id
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE b.user_id = :user_id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function add(int $userId, int $courseId): bool
    {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (user_id, course_id)
            VALUES (:user_id, :course_id)
            ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
        ");
        return $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
    }

    public function remove(int $userId, int $courseId): bool
    {
        $stmt = $this->conn->prepare("
            DELETE FROM {$this->table}
            WHERE user_id = :user_id AND course_id = :course_id
        ");
        return $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
    }

    public function isBookmarked(int $userId, int $courseId): bool
    {
        $stmt = $this->conn->prepare("
            SELECT id FROM {$this->table}
            WHERE user_id = :user_id AND course_id = :course_id
            LIMIT 1
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
        return (bool) $stmt->fetch();
    }
}