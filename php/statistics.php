<?php
$db = new PDO('sqlite:db/games.db');
if (!$db) {
    die('Could not connect to database');
}

$s = $db->query('SELECT COUNT(id) as cnt FROM games');
$count = $s->fetchObject()->cnt;

$s = $db->query('SELECT SUM(points) AS total FROM guesses');
$total = $s->fetchObject()->total;

$s = $db->query('SELECT MAX(score) AS highscore FROM (SELECT SUM(points) as score FROM guesses GROUP BY game)');
$highscore = $s->fetchObject()->highscore;

$s = $db->query('SELECT COUNT(score) AS countHigh FROM (SELECT SUM(points) as score FROM guesses GROUP BY game) WHERE score > 10000');
$over_10000 = $s->fetchObject()->countHigh;
?>
<table border="1">
    <tr><td>No. of games      </td><td><?=$count?></td></tr>
    <tr><td>Average score     </td><td><?=round($total / $count)?></td></tr>
    <tr><td>Highscore         </td><td><?=$highscore?></td></tr>
    <tr><td>Scores over 10000 </td><td><?=$over_10000?> (<?=round($over_10000 / $count * 100, 2)?>%)</td></tr>
</p>
