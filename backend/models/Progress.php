<?php

class Progress
{
    private PDO $conn;
    private string $table = 'progress';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getDashboardStats(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT 
                COUNT(DISTINCT course_id) AS enrolled,
                SUM(CASE WHEN completed = 1 AND lesson_id IS NOT NULL THEN 1 ELSE 0 END) AS completed_lessons,
                AVG(NULLIF(quiz_score, 0)) AS avg_score,
                COUNT(CASE WHEN quiz_score > 0 THEN 1 END) AS quizzes_taken,
                AVG(completion_percentage) AS overall_progress
            FROM {$this->table}
            WHERE user_id = :uid
        ");
        $stmt->execute([':uid' => $userId]);
        $row = $stmt->fetch() ?: [];

        return [
            'enrolledCourses' => (int) ($row['enrolled'] ?? 0),
            'completedLessons' => (int) ($row['completed_lessons'] ?? 0),
            'quizzesTaken' => (int) ($row['quizzes_taken'] ?? 0),
            'avgScore' => round((float) ($row['avg_score'] ?? 0)) . '%',
            'overallProgress' => (int) round($row['overall_progress'] ?? 0)
        ];
    }

    public function getCompletedLessonIds(int $userId, int $courseId): array
    {
        $stmt = $this->conn->prepare("
            SELECT lesson_id FROM {$this->table}
            WHERE user_id = :user_id AND course_id = :course_id
            AND lesson_id IS NOT NULL AND completed = 1
        ");
        $stmt->execute([':user_id' => $userId, ':course_id' => $courseId]);
        return array_map('intval', array_column($stmt->fetchAll(), 'lesson_id'));
    }

    public function getCourseProgressSummary(int $userId, int $courseId, int $totalLessons): array
    {
        $completedIds = $this->getCompletedLessonIds($userId, $courseId);
        $completed = count($completedIds);
        $percent = $totalLessons > 0 ? (int) round(($completed / $totalLessons) * 100) : 0;

        $quizStmt = $this->conn->prepare("
            SELECT quiz_score, quiz_attempts FROM {$this->table}
            WHERE user_id = :user_id AND course_id = :course_id AND lesson_id IS NULL
            ORDER BY id DESC LIMIT 1
        ");
        $quizStmt->execute([':user_id' => $userId, ':course_id' => $courseId]);
        $quizRow = $quizStmt->fetch();
        
        // Auto-mark course as completed at 100%
        if ($percent >= 100) {
            $this->markCourseCompleted($userId, $courseId);
        }

        return [
            'courseId' => $courseId,
            'completedLessonIds' => $completedIds,
            'completedLessons' => $completed,
            'totalLessons' => $totalLessons,
            'completionPercentage' => $percent,
            'quizScore' => $quizRow ? (int) $quizRow['quiz_score'] : null,
            'quizAttempts' => $quizRow ? (int) $quizRow['quiz_attempts'] : 0,
            'isCompleted' => $percent >= 100
        ];
    }

    public function markCourseCompleted(int $userId, int $courseId): bool
    {
        // This method is optional - you can implement if you have an enrollments table
        return true;
    }

    public function getMyCoursesProgress(int $userId): array
    {
        $stmt = $this->conn->prepare("
            SELECT 
                course_id,
                COUNT(DISTINCT CASE WHEN completed = 1 AND lesson_id IS NOT NULL THEN lesson_id END) AS completed_lessons,
                MAX(quiz_score) AS best_quiz_score
            FROM {$this->table}
            WHERE user_id = :uid
            GROUP BY course_id
            ORDER BY last_activity DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $rows = $stmt->fetchAll();

        return array_map(function ($row) {
            $total = $this->getTotalLessonsForCourse($row['course_id']);
            $completed = (int) $row['completed_lessons'];
            return [
                'course_id' => (int) $row['course_id'],
                'completedLessons' => $completed,
                'totalLessons' => $total,
                'completionPercentage' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'bestQuizScore' => $row['best_quiz_score'] ? (int) $row['best_quiz_score'] : null,
            ];
        }, $rows);
    }

    private function getTotalLessonsForCourse(int $courseId): int
    {
        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM lessons WHERE course_id = :course_id");
        $stmt->execute([':course_id' => $courseId]);
        return (int) $stmt->fetchColumn();
    }

    public function upsertLessonProgress(int $userId, int $courseId, int $lessonId, bool $completed = true): bool
    {
        $check = $this->conn->prepare("
            SELECT id FROM {$this->table} 
            WHERE user_id = :user_id AND course_id = :course_id AND lesson_id = :lesson_id 
            LIMIT 1
        ");
        $check->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId,
            ':lesson_id' => $lessonId,
        ]);
        $existing = $check->fetch();

        if ($existing) {
            $stmt = $this->conn->prepare("
                UPDATE {$this->table} 
                SET completed = :completed, 
                    completed_at = IF(:completed = 1, CURRENT_TIMESTAMP, completed_at),
                    last_activity = CURRENT_TIMESTAMP
                WHERE id = :id
            ");
            return $stmt->execute([
                ':id' => $existing['id'],
                ':completed' => $completed ? 1 : 0,
            ]);
        }

        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (user_id, course_id, lesson_id, completed, completed_at, last_activity)
            VALUES (:user_id, :course_id, :lesson_id, :completed, 
                    IF(:completed = 1, CURRENT_TIMESTAMP, NULL), CURRENT_TIMESTAMP)
        ");
        return $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId,
            ':lesson_id' => $lessonId,
            ':completed' => $completed ? 1 : 0,
        ]);
    }

    public function saveQuizScore(int $userId, int $courseId, int $score): bool
    {
        $check = $this->conn->prepare("
            SELECT id, quiz_attempts FROM {$this->table}
            WHERE user_id = :user_id AND course_id = :course_id AND lesson_id IS NULL
            LIMIT 1
        ");
        $check->execute([':user_id' => $userId, ':course_id' => $courseId]);
        $existing = $check->fetch();

        $attempts = ($existing ? (int) $existing['quiz_attempts'] : 0) + 1;
        
        // Only keep best score
        $bestScore = $existing ? max((int) $existing['quiz_score'], $score) : $score;

        if ($existing) {
            $stmt = $this->conn->prepare("
                UPDATE {$this->table} 
                SET quiz_score = :score, 
                    quiz_attempts = :attempts,
                    last_activity = CURRENT_TIMESTAMP
                WHERE id = :id
            ");
            return $stmt->execute([
                ':id' => $existing['id'],
                ':score' => $bestScore,
                ':attempts' => $attempts
            ]);
        }

        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (user_id, course_id, quiz_score, quiz_attempts, last_activity)
            VALUES (:user_id, :course_id, :score, :attempts, CURRENT_TIMESTAMP)
        ");
        return $stmt->execute([
            ':user_id' => $userId,
            ':course_id' => $courseId,
            ':score' => $bestScore,
            ':attempts' => $attempts
        ]);
    }

    public function countDistinctEnrollments(): int
    {
        $stmt = $this->conn->query("
            SELECT COUNT(DISTINCT CONCAT(user_id, '-', course_id)) 
            FROM {$this->table}
        ");
        return (int) $stmt->fetchColumn();
    }
}