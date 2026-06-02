<?php

class User {
    private $conn;
    private $table = "users";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function emailExists(string $email): bool
    {
        $stmt = $this->conn->prepare("SELECT id FROM {$this->table} WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return (bool) $stmt->fetch();
    }

    public function register($name, $email, $password, $role = 'student')
    {
        if ($this->emailExists($email)) {
            return false;
        }
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);
        $query = "INSERT INTO {$this->table} (name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashed_password);
        $stmt->bindParam(':role', $role);
        if (!$stmt->execute()) {
            return false;
        }
        return (int) $this->conn->lastInsertId();
    }

    public function getAllStudents(): array
    {
        $stmt = $this->conn->query(
            "SELECT id, name, email, role, profile_image, bio, created_at, last_login 
             FROM {$this->table} WHERE role = 'student' ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }
    
    public function getAllInstructors(): array
    {
        $stmt = $this->conn->query(
            "SELECT id, name, email, role, profile_image, bio, created_at 
             FROM {$this->table} WHERE role = 'instructor' ORDER BY created_at DESC"
        );
        return $stmt->fetchAll();
    }

    public function countStudents(): int
    {
        return (int) $this->conn->query("SELECT COUNT(*) FROM {$this->table} WHERE role = 'student'")->fetchColumn();
    }
    
    public function countInstructors(): int
    {
        return (int) $this->conn->query("SELECT COUNT(*) FROM {$this->table} WHERE role = 'instructor'")->fetchColumn();
    }

    public function deleteStudent(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id AND role = 'student'");
        return $stmt->execute([':id' => $id]);
    }
    
    public function deleteInstructor(int $id): bool
    {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id AND role = 'instructor'");
        return $stmt->execute([':id' => $id]);
    }
    
    public function login($email, $password) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($user && password_verify($password, $user['password'])) {
            // Update last login
            $update = $this->conn->prepare("UPDATE {$this->table} SET last_login = NOW() WHERE id = :id");
            $update->execute([':id' => $user['id']]);
            return $user;
        }
        return false;
    }
    
    public function getProfile($user_id) {
        $query = "SELECT id, name, email, role, profile_image, bio, created_at, last_login 
                  FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $user_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function updateProfile($user_id, $name, $email, $bio = null) {
        $query = "UPDATE " . $this->table . " SET name = :name, email = :email" . 
                 ($bio !== null ? ", bio = :bio" : "") . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        if ($bio !== null) {
            $stmt->bindParam(":bio", $bio);
        }
        $stmt->bindParam(":id", $user_id);
        return $stmt->execute();
    }
    
    public function updateProfileImage($user_id, $image_path) {
        $query = "UPDATE " . $this->table . " SET profile_image = :image WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":image", $image_path);
        $stmt->bindParam(":id", $user_id);
        return $stmt->execute();
    }
    
    public function searchUsers($query, $limit = 10) {
        $search = "%{$query}%";
        $stmt = $this->conn->prepare("
            SELECT id, name, email, role, profile_image 
            FROM {$this->table} 
            WHERE name LIKE :search OR email LIKE :search
            LIMIT :limit
        ");
        $stmt->bindParam(':search', $search);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
?>