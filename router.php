<?php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$root = __DIR__;

if ($uri === '/' || $uri === '') {
    header('Location: /frontend/index.html');
    exit;
}

if (strpos($uri, '/backend/routes/api.php') === 0 || $uri === '/api') {
    require $root . '/backend/routes/api.php';
    exit;
}

$file = $root . $uri;
if ($uri !== '/' && is_file($file)) {
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $types = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'html' => 'text/html',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'svg' => 'image/svg+xml',
        'woff2' => 'font/woff2',
    ];
    if (isset($types[$ext])) {
        header('Content-Type: ' . $types[$ext]);
    }
    readfile($file);
    exit;
}

http_response_code(404);
echo 'Not Found';
