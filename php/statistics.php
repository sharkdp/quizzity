<?php
// error_reporting(E_ALL);

$db = new PDO('sqlite:db/games.db');
if (!$db) {
    die('Could not connect to database');
}

$stmt = $db->prepare('SELECT * FROM games');

$games = array();
$count = 0;
$total = 0;
$highscore = 0;
$over_10000 = 0;

if ($stmt->execute()) {
    while ($row = $stmt->fetch()) {
        $guesses = json_decode($row['entry']);

        $points = 0;
        foreach ($guesses as $guess) {
            $points += $guess->points;
        }
        $total += $points;
        $count += 1;
        if ($points > $highscore) {
            $highscore = $points;
        }

        if ($points > 10000) {
            array_push($games,
                $game = array(
                    'time' => $row['time'],
                    'guesses' => $guesses,
                    'points' => $points
                )
            );

            $over_10000 += 1;
        }
    }
}
?>
<p>
    <b>No. of games:</b> <?=$count?><br>
    <b>Average score:</b> <?=round($total / $count)?><br>
    <b>Highscore:</b> <?=$highscore?><br>
    <b>Games over 10000:</b> <?=$over_10000?> (<?=round($over_10000 / $count * 100, 2)?>%)
</p>

<table border="1">
    <thead>
        <th>Time</th>
        <th>City 1</th>
        <th>City 2</th>
        <th>City 3</th>
        <th>City 4</th>
        <th>City 5</th>
        <th>City 6</th>
        <th>Score</th>
    </thead>
    <tbody>
<?php
function cmp($a, $b) {
    return ($a['points'] > $b['points']) ? -1 : 1;
}

usort($games, 'cmp');

foreach ($games as $game) {
    print '<tr>';
    print '<td>'.$game['time'].'</td>';
    foreach ($game['guesses'] as $guess) {
        print '<td>'.htmlentities($guess->fullName).'<br>';
        $col = '';
        if ($guess->time > 12000) {
            $col = ' style="color: red"';
        }
        print '<span'.$col.'>'.($guess->time / 1000).'s</span>';
        print ', '.$guess->distance.'km';
        print '</td>';
    }
    print '<td>'.$game['points'].'</td>';
    print '</tr>';
}
?>
    </tbody>
</table>
