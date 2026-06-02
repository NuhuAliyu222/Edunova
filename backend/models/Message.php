<?php

class Message
{
    private PDO $conn;
    private string $table = 'messages';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function send(int $senderId, int $receiverId, string $message, ?int $courseId = null, ?string $subject = null): ?array
    {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (sender_id, receiver_id, course_id, subject, message)
            VALUES (:sender_id, :receiver_id, :course_id, :subject, :message)
        ");
        $stmt->execute([
            ':sender_id' => $senderId,
            ':receiver_id' => $receiverId,
            ':course_id' => $courseId,
            ':subject' => $subject,
            ':message' => $message
        ]);
        
        $id = (int) $this->conn->lastInsertId();
        return $this->getById($id);
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->conn->prepare("
            SELECT m.*, 
                   u1.name as sender_name, u1.email as sender_email,
                   u2.name as receiver_name, u2.email as receiver_email,
                   c.title as course_title
            FROM {$this->table} m
            JOIN users u1 ON m.sender_id = u1.id
            JOIN users u2 ON m.receiver_id = u2.id
            LEFT JOIN courses c ON m.course_id = c.id
            WHERE m.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getInbox(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT m.*, 
                   u.name as sender_name, u.email as sender_email,
                   c.title as course_title
            FROM {$this->table} m
            JOIN users u ON m.sender_id = u.id
            LEFT JOIN courses c ON m.course_id = c.id
            WHERE m.receiver_id = :user_id
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getOutbox(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT m.*, 
                   u.name as receiver_name, u.email as receiver_email,
                   c.title as course_title
            FROM {$this->table} m
            JOIN users u ON m.receiver_id = u.id
            LEFT JOIN courses c ON m.course_id = c.id
            WHERE m.sender_id = :user_id
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function markAsRead(int $id, int $userId): bool
    {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET is_read = 1
            WHERE id = :id AND receiver_id = :user_id
        ");
        return $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }

    public function getUnreadCount(int $userId): int
    {
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) FROM {$this->table}
            WHERE receiver_id = :user_id AND is_read = 0
        ");
        $stmt->execute([':user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }
}