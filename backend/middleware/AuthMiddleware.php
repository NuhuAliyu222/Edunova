<?php

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthMiddleware
{
    private string $secret_key;

    public function __construct()
    {
        $this->secret_key = env('JWT_SECRET', 'edunova_secret_key_change_in_production');
    }

    public function generateJWT(int $user_id, string $email, string $role, string $name = ''): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user_id,
            'email' => $email,
            'role' => $role,
            'name' => $name,
            'exp' => time() + (7 * 24 * 60 * 60),
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $this->secret_key, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
    }

    public function verifyJWT(?string $token)
    {
        if (!$token) {
            return false;
        }

        $token = preg_replace('/^Bearer\s+/i', '', trim($token));
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return false;
        }

        [$header, $payload, $signature] = $tokenParts;
        $expected = $this->base64UrlEncode(
            hash_hmac('sha256', $header . '.' . $payload, $this->secret_key, true)
        );

        if (!hash_equals($expected, $signature)) {
            return false;
        }

        $decoded = json_decode($this->base64UrlDecode($payload));
        if (!$decoded || !isset($decoded->exp) || $decoded->exp < time()) {
            return false;
        }

        return (array) $decoded;
    }

    public function requireAuth(?string $authorization, ?string $role = null)
    {
        $user = $this->verifyJWT($authorization);
        if (!$user) {
            Response::error('Unauthorized', 401);
        }
        if ($role !== null && ($user['role'] ?? '') !== $role) {
            Response::error('Forbidden', 403);
        }
        return $user;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $padding = 4 - (strlen($data) % 4);
        if ($padding < 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
