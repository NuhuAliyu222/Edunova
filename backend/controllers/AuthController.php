<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthController
{
    private User $userModel;
    private AuthMiddleware $auth;

    public function __construct(PDO $db)
    {
        $this->userModel = new User($db);
        $this->auth = new AuthMiddleware();
    }

    public function register(string $name, string $email, string $password)
    {
        if (!Validator::email($email)) {
            return Response::error('Invalid email address', 422);
        }
        if (!Validator::password($password)) {
            return Response::error('Password must be at least 6 characters', 422);
        }

        $userId = $this->userModel->register(trim($name), trim($email), $password);
        if (!$userId) {
            return Response::error('Email already registered', 409);
        }

        $token = $this->auth->generateJWT($userId, $email, 'student', trim($name));
        return Response::success([
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => trim($name),
                'email' => trim($email),
                'role' => 'student',
            ],
        ], 'Registration successful', 201);
    }

    public function login(string $email, string $password, ?string $requiredRole = null)
    {
        $user = $this->userModel->login(trim($email), $password);
        if (!$user) {
            return Response::error('Invalid email or password', 401);
        }

        if ($requiredRole !== null && ($user['role'] ?? '') !== $requiredRole) {
            return Response::error('Access denied for this account type', 403);
        }

        unset($user['password']);
        $token = $this->auth->generateJWT(
            (int) $user['id'],
            $user['email'],
            $user['role'],
            $user['name'] ?? ''
        );

        return Response::success([
            'token' => $token,
            'user' => $user,
        ], 'Login successful');
    }

    public function profile(array $authUser)
    {
        $profile = $this->userModel->getProfile((int) $authUser['user_id']);
        if (!$profile) {
            return Response::error('User not found', 404);
        }
        return Response::success($profile);
    }

    public function updateProfile(array $authUser, string $name, string $email)
    {
        if (!Validator::email($email)) {
            return Response::error('Invalid email address', 422);
        }
        $ok = $this->userModel->updateProfile((int) $authUser['user_id'], trim($name), trim($email));
        if (!$ok) {
            return Response::error('Could not update profile', 500);
        }
        return Response::success($this->userModel->getProfile((int) $authUser['user_id']), 'Profile updated');
    }
}
