<?php

class Validator
{
    public static function email(string $email): bool
    {
        return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function required(array $fields, object $data): array
    {
        $missing = [];
        foreach ($fields as $field) {
            if (!isset($data->$field) || trim((string) $data->$field) === '') {
                $missing[] = $field;
            }
        }
        return $missing;
    }

    public static function password(string $password): bool
    {
        return strlen($password) >= 6;
    }
}
