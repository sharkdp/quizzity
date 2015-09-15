# Create a plot of the score distribution

import sqlite3
import numpy as np
import matplotlib.pyplot as plt

conn = sqlite3.connect("../php/db/games.db")
scores = [row[0] for row in conn.execute("SELECT SUM(points) FROM guesses GROUP BY game")]

hist, bins = np.histogram(scores, bins=50)

width = 0.7 * (bins[1] - bins[0])
center = (bins[:-1] + bins[1:]) / 2

plt.bar(center, hist, align="center", width=width)
plt.ylim([0, 3000])
plt.title("Score distribution after {} games".format(len(scores)))
plt.xlabel("Points")
plt.ylabel("No. of games")

highscore = max(scores)
plt.annotate("Highscore " + str(highscore), xy=(highscore, 0), xytext=(highscore - 2500, 1000),
             arrowprops=dict(facecolor='black', shrink=0.02))

plt.gcf().tight_layout()

plt.savefig("histogram.png", dpi=100)
