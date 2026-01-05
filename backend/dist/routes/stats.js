"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RouteLog_1 = require("../lib/models/RouteLog");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const hourlyData = await RouteLog_1.RouteLog.findAll({
            attributes: [
                [
                    (0, sequelize_1.fn)("strftime", "%Y-%m-%d %H:00", (0, sequelize_1.col)("createdAt"), "+5 hours", "+30 minutes"),
                    "hour",
                ],
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "count"],
            ],
            group: ["hour"],
            order: [["hour", "ASC"]],
            raw: true,
        });
        const hourLabels = hourlyData.map((d) => d.hour);
        const hourCounts = hourlyData.map((d) => Number(d.count));
        const routeHourlyData = await RouteLog_1.RouteLog.findAll({
            attributes: [
                [
                    (0, sequelize_1.fn)("strftime", "%Y-%m-%d %H:00", (0, sequelize_1.col)("createdAt"), "+5 hours", "+30 minutes"),
                    "hour",
                ],
                ["route", "route"],
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "count"],
            ],
            group: ["hour", "route"],
            order: [["hour", "ASC"]],
            raw: true,
        });
        const sourceData = await RouteLog_1.RouteLog.findAll({
            attributes: [
                ["source", "source"],
                [(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "count"],
            ],
            group: ["source"],
            order: [[(0, sequelize_1.fn)("COUNT", (0, sequelize_1.col)("id")), "DESC"]],
            raw: true,
        });
        const sourceLabels = sourceData.map((d) => d.source || "unknown");
        const sourceCounts = sourceData.map((d) => Number(d.count));
        // Get unique routes and hours
        const routes = [...new Set(routeHourlyData.map((d) => d.route))];
        const allHours = [...new Set(routeHourlyData.map((d) => d.hour))].sort();
        // Create datasets for each route
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
            // Fill in data for each hour
            const data = allHours.map(hour => {
                const entry = routeHourlyData.find((d) => d.hour === hour && d.route === route);
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
    body {
      font-family: system-ui, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
    }
    h2 {
      color: #555;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    canvas {
      max-width: 100%;
      margin-bottom: 50px;
    }
    .chart-container {
      position: relative;
      height: 400px;
      margin-bottom: 50px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Total Requests Per Hour</h2>
    <div class="chart-container">
      <canvas id="hourChart"></canvas>
    </div>
    
    <h2>Requests Per Route Per Hour</h2>
    <div class="chart-container" style="height: 500px;">
      <canvas id="routeHourChart"></canvas>
    </div>

    <h2>Requests by Source Domain</h2>
<div class="chart-container" style="height: 400px;">
  <canvas id="sourceChart"></canvas>
</div>

  </div>
  
  <script>
    // Total requests per hour
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
    
    // Requests per route per hour
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

    // Requests by source domain
new Chart(document.getElementById("sourceChart"), {
  type: "bar",
  data: {
    labels: ${JSON.stringify(sourceLabels)},
    datasets: [{
      label: "Requests",
      data: ${JSON.stringify(sourceCounts)},
      backgroundColor: "rgba(54, 162, 235, 0.6)",
      borderColor: "rgb(54, 162, 235)",
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: ctx => ' ' + ctx.raw + ' requests'
        }
      }
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
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }
});
  </script>
</body>
</html>
`);
    }
    catch (error) {
        console.error("Stats error:", error);
        res.status(500).send("Error generating stats");
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map