<?php

class Certificate
{
    private PDO $conn;
    private string $table = 'certificates';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function generateCertificateCode(int $userId, int $courseId): string
    {
        return 'EDU-' . strtoupper(substr(md5($userId . $courseId . time()), 0, 12));
    }

    public function create(int $userId, int $courseId, string $pdfPath = null): ?array
    {
        $code = $this->generateCertificateCode($userId, $courseId);
        
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (user_id, course_id, certificate_code, pdf_path)
            VALUES (:user_id, :course_id, :code, :pdf_path)
        ");
        
        $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId,
            ':code' => $code,
            ':pdf_path' => $pdfPath
        ]);
        
        $id = (int) $this->conn->lastInsertId();
        return $this->getById($id);
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->conn->prepare("
            SELECT c.*, u.name as user_name, u.email as user_email,
                   cr.title as course_title, cr.description as course_description
            FROM {$this->table} c
            JOIN users u ON c.user_id = u.id
            JOIN courses cr ON c.course_id = cr.id
            WHERE c.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getByUser(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT c.*, cr.title as course_title
            FROM {$this->table} c
            JOIN courses cr ON c.course_id = cr.id
            WHERE c.user_id = :user_id
            ORDER BY c.issued_at DESC
        ");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll();
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

    public function updatePdfPath(int $id, string $pdfPath): bool
    {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table} SET pdf_path = :pdf_path WHERE id = :id
        ");
        return $stmt->execute([
            ':id' => $id,
            ':pdf_path' => $pdfPath
        ]);
    }

    public function checkEligibility(int $userId, int $courseId): bool
    {
        // Check if course is completed (100% progress)
        $stmt = $this->conn->prepare("
            SELECT completion_percentage FROM progress
            WHERE user_id = :user_id AND course_id = :course_id
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
        $progress = $stmt->fetch();
        
        $completed = $progress && $progress['completion_percentage'] >= 100;
        
        // Check if certificate already exists
        $existing = $this->getByUserAndCourse($userId, $courseId);
        
        return $completed && !$existing;
    }
}