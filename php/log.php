<?php
$db = new PDO('sqlite:db/games.db');

if (!$db) {
    die();
}

// 'validate' input
$guesses = json_decode($_POST['guesses']);

if (!is_null($guesses)) {
    $stmt = $db->prepare('INSERT INTO games (entry) VALUES (:entry)');

    if ($stmt->execute(array(':entry' => json_encode($guesses)))) {
        print 'okay';
    } else {
        die("Database error");
    }
} else {
    die("Validation error");
}
?>
