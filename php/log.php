<?php
function fail($status, $message) {
    http_response_code($status);
    exit($message);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    fail(405, 'POST required');
}
$guesses = json_decode($_POST['guesses'] ?? '', true);
if (!is_array($guesses) || count($guesses) !== 6) fail(400, 'Expected six guesses');
foreach ($guesses as $g) {
    if (!is_array($g) || !is_string($g['fullName'] ?? null)) fail(400, 'Invalid city');
    foreach (['time', 'points', 'distance'] as $key) {
        if (!is_numeric($g[$key] ?? null) || !is_finite((float)$g[$key]) || $g[$key] < 0) fail(400, 'Invalid score');
    }
    foreach (['lat' => 90, 'lng' => 180] as $key => $limit) {
        $v = $g['guess'][$key] ?? null;
        // Timeouts in the existing client submit null coordinates.
        if ($v !== null && (!is_numeric($v) || !is_finite((float)$v) || abs($v) > $limit)) fail(400, 'Invalid position');
    }
}
try {
    $db = new PDO('sqlite:' . getenv('QUIZZITY_DB'), null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $db->exec('PRAGMA busy_timeout = 5000');
    $db->beginTransaction();
    $db->exec('INSERT INTO games DEFAULT VALUES');
    $game = $db->lastInsertId();
    $find = $db->prepare('SELECT id FROM cities WHERE name = ?');
    $insert = $db->prepare('INSERT INTO guesses (game, city, lat, lng, duration, points, distance) VALUES (?, ?, ?, ?, ?, ?, ?)');
    foreach ($guesses as $g) {
        $find->execute([$g['fullName']]);
        $city = $find->fetchColumn();
        if ($city === false) { $db->rollBack(); fail(400, 'Unknown city'); }
        $insert->execute([$game, $city, $g['guess']['lat'] ?? null, $g['guess']['lng'] ?? null, $g['time'], $g['points'], $g['distance']]);
    }
    $db->commit();
} catch (Throwable $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    error_log('Quizzity logging failed: ' . $e->getMessage());
    fail(503, 'Logging temporarily unavailable');
}
