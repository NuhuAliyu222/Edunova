<?php

class EmailHelper
{
    private PDO $conn;
    
    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }
    
    public function queueEmail(string $to, string $toName, string $subject, string $body): bool
    {
        $stmt = $this->conn->prepare("
            INSERT INTO email_queue (to_email, to_name, subject, body, status)
            VALUES (:to, :to_name, :subject, :body, 'pending')
        ");
        return $stmt->execute([
            ':to' => $to,
            ':to_name' => $toName,
            ':subject' => $subject,
            ':body' => $body
        ]);
    }
    
    public function sendWelcomeEmail(string $to, string $name): bool
    {
        $subject = "Welcome to Edunova - Smart Learning!";
        $body = "
            <html>
            <head>
                <style>
                    body { font-family: 'Poppins', sans-serif; color: #111827; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #5130e5 0%, #7c5cf5 100%); color: white; padding: 30px; text-align: center; border-radius: 18px 18px 0 0; }
                    .content { background: #f5f4fb; padding: 30px; border-radius: 0 0 18px 18px; }
                    .btn { background: #5130e5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 12px; display: inline-block; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Welcome to Edunova! 🎓</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {$name},</h2>
                        <p>Thank you for joining Edunova - Smart Learning System!</p>
                        <p>You now have access to:</p>
                        <ul>
                            <li>✓ Quality courses from expert instructors</li>
                            <li>✓ Interactive quizzes and assessments</li>
                            <li>✓ Track your learning progress</li>
                            <li>✓ Earn certificates upon completion</li>
                        </ul>
                        <p>Start your learning journey today!</p>
                        <a href='http://localhost:8080/frontend/pages/student/dashboard.html' class='btn'>Go to Dashboard</a>
                        <p style='margin-top: 30px; font-size: 12px; color: #6b7280;'>© 2024 Edunova - Smart Learning. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
        return $this->queueEmail($to, $name, $subject, $body);
    }
    
    public function sendQuizResultEmail(string $to, string $name, string $courseTitle, int $score, int $total): bool
    {
        $percentage = round(($score / $total) * 100);
        $subject = "Quiz Result: {$courseTitle}";
        $body = "
            <html>
            <head>
                <style>
                    body { font-family: 'Poppins', sans-serif; color: #111827; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #5130e5 0%, #7c5cf5 100%); color: white; padding: 30px; text-align: center; border-radius: 18px 18px 0 0; }
                    .content { background: #f5f4fb; padding: 30px; border-radius: 0 0 18px 18px; }
                    .score { font-size: 48px; font-weight: bold; color: #5130e5; text-align: center; }
                    .btn { background: #5130e5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 12px; display: inline-block; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Quiz Completed! 📝</h1>
                    </div>
                    <div class='content'>
                        <h2>Hello {$name},</h2>
                        <p>You've completed the quiz for <strong>{$courseTitle}</strong>!</p>
                        <div class='score'>{$percentage}%</div>
                        <p style='text-align: center;'>Your Score: {$score}/{$total}</p>
                        " . ($percentage >= 70 ? "<p>Great job! Keep up the excellent work! 🎉</p>" : "<p>Keep practicing! You'll do better next time! 💪</p>") . "
                        <a href='http://localhost:8080/frontend/pages/student/courses.html' class='btn'>Continue Learning</a>
                    </div>
                </div>
            </body>
            </html>
        ";
        return $this->queueEmail($to, $name, $subject, $body);
    }
    
    public function sendCertificateEmail(string $to, string $name, string $courseTitle, string $certificateCode): bool
    {
        $subject = "Congratulations! You've earned a certificate! 🎉";
        $body = "
            <html>
            <head>
                <style>
                    body { font-family: 'Poppins', sans-serif; color: #111827; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #5130e5 0%, #7c5cf5 100%); color: white; padding: 30px; text-align: center; border-radius: 18px 18px 0 0; }
                    .content { background: #f5f4fb; padding: 30px; border-radius: 0 0 18px 18px; }
                    .code { background: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; color: #5130e5; border-radius: 10px; margin: 20px 0; }
                    .btn { background: #5130e5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 12px; display: inline-block; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Certificate of Completion! 🏆</h1>
                    </div>
                    <div class='content'>
                        <h2>Congratulations {$name}!</h2>
                        <p>You've successfully completed <strong>{$courseTitle}</strong>!</p>
                        <p>Your certificate code:</p>
                        <div class='code'>{$certificateCode}</div>
                        <p>You can download your certificate from your profile page.</p>
                        <a href='http://localhost:8080/frontend/pages/student/profile.html#certificates' class='btn'>View Certificate</a>
                    </div>
                </div>
            </body>
            </html>
        ";
        return $this->queueEmail($to, $name, $subject, $body);
    }
}