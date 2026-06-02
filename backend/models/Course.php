<?php

class Course
{
    private PDO $conn;
    private string $table = 'courses';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array
    {
        $stmt = $this->conn->query("
            SELECT c.*, u.name as instructor_name 
            FROM {$this->table} c
            LEFT JOIN users u ON c.instructor_id = u.id
            ORDER BY c.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->conn->prepare("
            SELECT c.*, u.name as instructor_name, u.email as instructor_email
            FROM {$this->table} c
            LEFT JOIN users u ON c.instructor_id = u.id
            WHERE c.id = :id LIMIT 1
        ");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByInstructor(int $instructorId): array
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM {$this->table} 
            WHERE instructor_id = :instructor_id 
            ORDER BY created_at DESC
        ");
        $stmt->bindValue(':instructor_id', $instructorId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getEnrolledCourses(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT c.*, u.name as instructor_name,
                   e.status as enrollment_status, e.enrolled_at
            FROM {$this->table} c
            LEFT JOIN users u ON c.instructor_id = u.id
            INNER JOIN enrollments e ON e.course_id = c.id
            WHERE e.user_id = :user_id AND e.status = 'active'
            ORDER BY e.enrolled_at DESC
        ");
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create(array $data): ?int
    {
        $query = "INSERT INTO {$this->table} (title, description, thumbnail, category, instructor_id)
                  VALUES (:title, :description, :thumbnail, :category, :instructor_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':thumbnail' => $data['thumbnail'] ?? '',
            ':category' => $data['category'] ?? '',
            ':instructor_id' => $data['instructor_id'] ?? null,
        ]);
        return (int) $this->conn->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $query = "UPDATE {$this->table} SET 
                  title = :title, 
                  description = :description,
                  thumbnail = :thumbnail, 
                  category = :category,
                  instructor_id = :instructor_id
                  WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':thumbnail' => $data['thumbnail'] ?? '',
            ':category' => $data['category'] ?? '',
            ':instructor_id' => $data['instructor_id'] ?? null,
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

    public function isEnrolled(int $userId, int $courseId): bool
    {
        $stmt = $this->conn->prepare("
            SELECT id FROM enrollments 
            WHERE user_id = :user_id AND course_id = :course_id AND status = 'active'
            LIMIT 1
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
        return (bool) $stmt->fetch();
    }

    public function enrollStudent(int $userId, int $courseId): bool
    {
        $stmt = $this->conn->prepare("
            INSERT INTO enrollments (user_id, course_id, status)
            VALUES (:user_id, :course_id, 'active')
            ON DUPLICATE KEY UPDATE status = 'active'
        ");
        return $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId
        ]);
    }
}