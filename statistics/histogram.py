# Create a plot of the score distribution

import sqlite3
import numpy as np
import matplotlib.pyplot as plt

conn = sqlite3.connect("../php/db/games.db")
points = [row[0] for row in conn.execute("SELECT SUM(points) FROM guesses GROUP BY game")]

print("Creating histogram for {} games".format(len(points)))

hist, bins = np.histogram(points, bins=50)

width = 0.7 * (bins[1] - bins[0])
center = (bins[:-1] + bins[1:]) / 2

plt.bar(center, hist, align="center", width=width)
plt.ylim([0, 3000])
plt.xlabel("Points")
plt.ylabel("No. of games")

plt.gcf().tight_layout()

plt.savefig("histogram.png", dpi=50)
