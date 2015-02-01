<table border="1">
<?php
$db = new PDO('sqlite:db/games.db');

if (!$db) {
    die();
}

$stmt = $db->prepare('SELECT * FROM games');

if ($stmt->execute()) {
    while ($row = $stmt->fetch()) {
        $guesses = json_decode($row['entry']);
        $points = 0;
        print '<tr>';
        print '<td>'.$row['time'].'</td>';
        foreach ($guesses as $guess) {
            print '<td>'.$guess->fullName.'</td>';
            $points += $guess->points;
        }
        print '<td>'.$points.'</td>';
        print '<tr>';
    }
}
?>
</table>
