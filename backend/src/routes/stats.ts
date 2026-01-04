import { Router } from "express";
import { RouteLog } from "../models/RouteLog";
import { fn, col } from "sequelize";

const router = Router();

router.get("/", async (_req, res) => {
    try {
        /* -------------------------
           1️⃣ Overall requests per hour
        -------------------------- */
        const hourlyData = await RouteLog.findAll({
            attributes: [
                [
                    fn("strftime", "%Y-%m-%d %H:00", col("createdAt")),
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

        /* -------------------------
           2️⃣ Requests per route per hour
        -------------------------- */
        const routeHourlyData = await RouteLog.findAll({
            attributes: [
                [
                    fn("strftime", "%Y-%m-%d %H:00", col("createdAt")),
                    "hour",
                ],
                ["route", "route"],
                [fn("COUNT", col("id")), "count"],
            ],
            group: ["hour", "route"],
            order: [["hour", "ASC"]],
            raw: true,
        });

        // Get unique routes and hours
        const routes = [...new Set(routeHourlyData.map((d: any) => d.route))];
        const allHours = [...new Set(routeHourlyData.map((d: any) => d.hour))].sort();

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