<?php
/* ini_set('display_errors', 1); */

function error($msg) {
    http_response_code(500);
    die($msg);
}

$db = new PDO('sqlite:db/games.db');

if (!$db) {
    error("Database error: could not open DB");
}

// parse input
$guesses = json_decode($_POST['guesses']);

if (!is_null($guesses) && count($guesses) == 6) {
    $db->beginTransaction();

    $db->exec('INSERT INTO games DEFAULT VALUES');
    $gameId = $db->lastInsertId();

    foreach ($guesses as $g) {
        $name = $g->fullName;

        $s = $db->prepare('SELECT id FROM cities WHERE name = :name');

        $ans = $s->execute(array(':name' => $name));
        $res = $s->fetchObject();

        if (!$ans || !$res) {
            $db->rollBack();
            error("Could not find city $name");
        }

        $cityId = $res->id;

        $s = $db->prepare('INSERT INTO guesses (game, city, lat, lng, duration, points, distance)
                           VALUES (:game, :city, :lat, :lng, :duration, :points, :distance)');

        $res = $s->execute(array(
            ':game' => $gameId,
            ':city' => $cityId,
            ':lat' => $g->guess->lat,
            ':lng' => $g->guess->lng,
            ':duration' => $g->time,
            ':points' => $g->points,
            ':distance' => $g->distance
        ));

        if (!$res) {
            $db->rollBack();
            error("Database error: could not execute query");
        }
    }

    $db->commit();
} else {
    error("Validation error");
}
?>
