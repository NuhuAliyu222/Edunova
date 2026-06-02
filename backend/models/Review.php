<?php

class Review
{
    private PDO $conn;
    private string $table = 'reviews';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getByCourse(int $courseId): array
    {
        $stmt = $this->conn->prepare("
            SELECT r.*, u.name as user_name, u.profile_image
            FROM {$this->table} r
            JOIN users u ON r.user_id = u.id
            WHERE r.course_id = :course_id
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([':course_id' => $courseId]);
        return $stmt->fetchAll();
    }

    public function getAverageRating(int $courseId): float
    {
        $stmt = $this->conn->prepare("
            SELECT AVG(rating) as avg_rating, COUNT(*) as total
            FROM {$this->table}
            WHERE course_id = :course_id
        ");
        $stmt->execute([':course_id' => $courseId]);
        $result = $stmt->fetch();
        return round($result['avg_rating'] ?? 0, 1);
    }

    public function create(int $userId, int $courseId, int $rating, string $comment): ?array
    {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (user_id, course_id, rating, comment)
            VALUES (:user_id, :course_id, :rating, :comment)
            ON DUPLICATE KEY UPDATE 
                rating = :rating,
                comment = :comment,
                updated_at = CURRENT_TIMESTAMP
        ");
        
        $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId,
            ':rating' => $rating,
            ':comment' => $comment
        ]);
        
        return $this->getByUserAndCourse($userId, $courseId);
    }

    public function getByUserAndCourse(int $userId, int $courseId): ?array
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM {$this->table}
            WHERE user_id = :user_id AND course_id = :course_id
            LIMIT 1
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
        return $stmt->fetch() ?: null;
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->conn->prepare("
            DELETE FROM {$this->table}
            WHERE id = :id AND user_id = :user_id
        ");
        return $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }
}