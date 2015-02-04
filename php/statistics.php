<?php
$db = new PDO('sqlite:db/games.db');

if (!$db) {
    die();
}

$stmt = $db->prepare('SELECT * FROM games');

$games = array();
if ($stmt->execute()) {
    while ($row = $stmt->fetch()) {
        $game = array(
            "time" => $row['time'],
            "guesses" => json_decode($row['entry'])
        );
        array_push($games, $game);
    }
}

$count = 0;
$total = 0;
$max = 0;
foreach ($games as $game) {
    $points = 0;
    foreach ($game['guesses'] as $guess) {
        $points += $guess->points;
    }
    $total += $points;
    $count += 1;
    if ($points > $max) {
        $max = $points;
    }
}

?>
<p>
    <b>Total games:</b> <?=$count?><br>
    <b>Average score:</b> <?=round($total / $count)?><br>
    <b>Highscore:</b> <?=$max?>
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
foreach ($games as $game) {
    $points = 0;
    foreach ($game['guesses'] as $guess) {
        $points += $guess->points;
    }
    if ($points < 10000) {
        continue;
    }
    print '<tr>';
    print '<td>'.$game['time'].'</td>';
    foreach ($game['guesses'] as $guess) {
        print '<td>'.htmlentities($guess->fullName).'<br>';
        if ($guess->time > 12000) {
            $col = 'red';
        } else {
            $col = 'black';
        }
        print '<span style="color:'.$col.'">'.($guess->time / 1000).'s</span></td>';
    }
    print '<td>'.$points.'</td>';
    print '<tr>';
}
?>
    </tbody>
</table>
