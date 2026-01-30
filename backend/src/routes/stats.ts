import { Router } from "express";
import { RouteLog } from "../lib/models/RouteLog";
import { VisitorLog } from "../lib/models/VisitorLog";
import { fn, col, Op } from "sequelize";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const range = _req.query.range || "30d" as string;
    let startDate: Date | null = null;
    const now = new Date();

    switch (range) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "full":
      default:
        startDate = null;
        break;
    }

    const whereClause = startDate ? { createdAt: { [Op.gte]: startDate } } : {};

    const hourlyData = await RouteLog.findAll({
      where: whereClause,
      attributes: [
        [
          fn(
            "strftime",
            "%Y-%m-%d %H:00",
            col("createdAt"),
            "+5 hours",
            "+30 minutes"
          ),
          "hour",
        ],
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["hour"],
      order: [["hour", "ASC"]],
      raw: true,
    });

    const hourLabels = hourlyData.map((d: any) => d.hour);
    const hourCounts = hourlyData.map((d: any) => Number(d.count));

    const routeHourlyData = await RouteLog.findAll({
      where: whereClause,
      attributes: [
        [
          fn(
            "strftime",
            "%Y-%m-%d %H:00",
            col("createdAt"),
            "+5 hours",
            "+30 minutes"
          ),
          "hour",
        ],
        ["route", "route"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["hour", "route"],
      order: [["hour", "ASC"]],
      raw: true,
    });

    const sourceHourlyData = await RouteLog.findAll({
      where: whereClause,
      attributes: [
        [
          fn(
            "strftime",
            "%Y-%m-%d %H:00",
            col("createdAt"),
            "+5 hours",
            "+30 minutes"
          ),
          "hour",
        ],
        ["source", "source"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["hour", "source"],
      order: [["hour", "ASC"]],
      raw: true,
    });

    const globalFirstSeen = await VisitorLog.findAll({
      attributes: [
        [fn("COALESCE", col("hashedIP"), "unknown"), "user"],
        [
          fn(
            "strftime",
            "%Y-%m-%d %H:00",
            fn("MIN", col("createdAt")),
            "+5 hours",
            "+30 minutes"
          ),
          "firstHour",
        ],
      ],
      group: ["user"],
      raw: true,
    });

    const firstSeenHourPerUser = new Map<string, string>();
    globalFirstSeen.forEach((row: any) => {
      firstSeenHourPerUser.set(row.user, row.firstHour);
    });

    const uniqueUsersHourly = await VisitorLog.findAll({
      where: whereClause,
      attributes: [
        [
          fn(
            "strftime",
            "%Y-%m-%d %H:00",
            col("createdAt"),
            "+5 hours",
            "+30 minutes"
          ),
          "hour",
        ],
        [
          fn(
            "COUNT",
            fn("DISTINCT", fn("COALESCE", col("hashedIP"), "unknown"))
          ),
          "uniqueUsers",
        ],
      ],
      group: ["hour"],
      order: [["hour", "ASC"]],
      raw: true,
    });

    const sourceHours = [...new Set(sourceHourlyData.map((d: any) => d.hour))].sort();
    const sources = [...new Set(sourceHourlyData.map((d: any) => d.source || "unknown"))];

    const uniqueUserHours = uniqueUsersHourly.map((d: any) => d.hour);
    const uniqueUserCounts = uniqueUsersHourly.map((d: any) => Number(d.uniqueUsers));

    const usersPerHour = await VisitorLog.findAll({
      where: whereClause,
      attributes: [
        [
          fn(
            "strftime",
            "%Y-%m-%d %H:00",
            col("createdAt"),
            "+5 hours",
            "+30 minutes"
          ),
          "hour",
        ],
        [fn("COALESCE", col("hashedIP"), "unknown"), "user"],
      ],
      group: ["hour", "user"],
      raw: true,
    });

    const usersByHour = new Map<string, Set<string>>();

    usersPerHour.forEach((row: any) => {
      const hour = row.hour;
      const user = row.user;

      if (!usersByHour.has(hour)) {
        usersByHour.set(hour, new Set());
      }
      usersByHour.get(hour)!.add(user);
    });
    const newUserCounts: number[] = [];
    const returningUserCounts: number[] = [];

    const sortedHours = [...uniqueUserHours].sort();

    sortedHours.forEach((hour) => {
      const usersThisHour = usersByHour.get(hour) || new Set();

      let newUsers = 0;
      let returningUsers = 0;

      for (const user of usersThisHour) {
        const firstHour = firstSeenHourPerUser.get(user);

        if (!firstHour) continue;

        if (firstHour === hour) {
          newUsers++;
        } else if (firstHour < hour) {
          returningUsers++;
        }
      }

      newUserCounts.push(newUsers);
      returningUserCounts.push(returningUsers);
    });

    let totalNewUsers = 0;
    let totalReturningUsers = 0;

    const seenUsers = new Set<string>();

    firstSeenHourPerUser.forEach((_firstHour, user) => {
      seenUsers.add(user);
    });

    usersPerHour.forEach((row: any) => {
      const user = row.user;
      const hour = row.hour;
      const firstHour = firstSeenHourPerUser.get(user);

      if (!firstHour) return;

      if (hour !== firstHour) {
        totalReturningUsers++;
      }
    });

    totalNewUsers = seenUsers.size - totalReturningUsers;

    const sourceColors = [
      "rgb(54, 162, 235)",
      "rgb(255, 99, 132)",
      "rgb(75, 192, 192)",
      "rgb(255, 206, 86)",
      "rgb(153, 102, 255)",
      "rgb(255, 159, 64)",
    ];

    const sourceDatasets = sources.map((source, index) => {
      const color = sourceColors[index % sourceColors.length] || 'rgb(100, 100, 100)';

      const data = sourceHours.map(hour => {
        const entry: any = sourceHourlyData.find(
          (d: any) => d.hour === hour && (d.source || "unknown") === source
        );
        return entry ? Number(entry.count) : 0;
      });

      return {
        label: source,
        data,
        borderColor: color,
        backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.15)"),
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      };
    });

    const routes = [...new Set(routeHourlyData.map((d: any) => d.route))];
    const allHours = [...new Set(routeHourlyData.map((d: any) => d.hour))].sort();

    const routeDatasets = routes.map((route, index) => {
      const colors = [
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(199, 199, 199)',
        'rgb(83, 102, 255)',
        'rgb(255, 99, 255)',
        'rgb(99, 255, 132)',
      ];

      const color = colors[index % colors.length] || 'rgb(100, 100, 100)';

      const data = allHours.map(hour => {
        const entry: any = routeHourlyData.find(
          (d: any) => d.hour === hour && d.route === route
        );
        return entry ? Number(entry.count) : 0;
      });

      return {
        label: route,
        data: data,
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 2,
        tension: 0.3,
        fill: false
      };
    });

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>API Usage Stats</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
  :root {
    --bg: #0f1115;
    --card: #151821;
    --border: #2a2f3a;
    --text-primary: #e5e7eb;
    --text-secondary: #9ca3af;
    --accent: #38bdf8;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 20px;
    background: var(--bg);
    color: var(--text-primary);
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    background: var(--card);
    padding: 30px;
    border-radius: 12px;
    border: 1px solid var(--border);
    height: fit-content;
  }

  h1 {
    color: var(--text-primary);
    margin-bottom: 30px;
  }

  h2 {
    color: var(--text-secondary);
    margin-top: 40px;
    margin-bottom: 20px;
    font-weight: 500;
  }

  .chart-container {
    position: relative;
    height: 400px;
    margin-bottom: 50px;
    background: #11141b;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid var(--border);
  }

  canvas {
    max-width: 100%;
  }

  .range-btn {
  background: #11141b;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

  .range-btn:hover {
    color: var(--text-primary);
    border-color: var(--accent);
  }

  .range-btn.active {
    background: var(--accent);
    color: #000;
    border-color: var(--accent);
  }

</style>
</head>
<body>
  <div class="container">
    <div style="display:flex; gap:12px; margin-bottom:20px;">
      <button class="range-btn" data-range="24h">Last 24 Hours</button>
      <button class="range-btn" data-range="7d">Last 7 Days</button>
      <button class="range-btn" data-range="30d">Last 30 Days</button>
      <button class="range-btn" data-range="full">To Date</button>
    </div>

    <h2>Total Requests Per Hour</h2>
    <div class="chart-container">
      <canvas id="hourChart"></canvas>
    </div>
    
    <h2>Requests Per Route Per Hour</h2>
    <div class="chart-container" style="height: 500px;">
      <canvas id="routeHourChart"></canvas>
    </div>
    <h2>Requests by Source Domain</h2>
    <div class="chart-container" style="height: 500px;">
      <canvas id="sourceChart"></canvas>
    </div>
    <h2>Users Over Time</h2>
    <div style="display:flex; gap:20px; margin-bottom:30px;">
      <div style="background:#11141b;padding:16px;border-radius:10px;border:1px solid var(--border);">
        <strong>New Users</strong><br/>
        ${totalNewUsers}
      </div>
      <div style="background:#11141b;padding:16px;border-radius:10px;border:1px solid var(--border);">
        <strong>Returning Users</strong><br/>
        ${totalReturningUsers}
      </div>
    </div>
    <div class="chart-container" style="height: 500px;">
      <canvas id="userChart"></canvas>
    </div>
</div>

  </div>
  
  <script>
  Chart.defaults.color = "#9ca3af";
  Chart.defaults.borderColor = "#2a2f3a";
  Chart.defaults.font.family =
    "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  </script>
  <script>
    new Chart(document.getElementById("hourChart"), {
      type: "line",
      data: {
        labels: ${JSON.stringify(hourLabels)},
        datasets: [{
          label: "Total Requests",
          data: ${JSON.stringify(hourCounts)},
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
    
    new Chart(document.getElementById("routeHourChart"), {
      type: "line",
      data: {
        labels: ${JSON.stringify(allHours)},
        datasets: ${JSON.stringify(routeDatasets)}
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });

new Chart(document.getElementById("sourceChart"), {
  type: "line",
  data: {
    labels: ${JSON.stringify(sourceHours)},
    datasets: ${JSON.stringify(sourceDatasets)}
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right"
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }
});
  </script>
  <script>
    const params = new URLSearchParams(window.location.search);
    const currentRange = params.get("range") || "30d";

    document.querySelectorAll(".range-btn").forEach(btn => {
      if (btn.dataset.range === currentRange) {
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        params.set("range", btn.dataset.range);
        window.location.search = params.toString();
      });
    });
  </script>
    <script>
  new Chart(document.getElementById("userChart"), {
    type: "line",
    data: {
      labels: ${JSON.stringify(sortedHours)},
      datasets: [
        {
          label: "Unique Users",
          data: ${JSON.stringify(uniqueUserCounts)},
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Returning Users",
          data: ${JSON.stringify(returningUserCounts)},
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: {
          mode: "index",
          intersect: false
        }
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
  </script>
</body>
</html>
`);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).send("Error generating stats");
  }
});

export default router;