CREATE TABLE cities (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT
);

CREATE TABLE games (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guesses (
    game     INTEGER,
    city     INTEGER,
    lat      REAL,
    lng      REAL,
    duration REAL,
    points   INTEGER,
    distance INTEGER,
    FOREIGN KEY (game) REFERENCES games(id),
    FOREIGN KEY (city) REFERENCES cities(id)
);
