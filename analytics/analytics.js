const mysqlExecute = require("../util/mysqlConnexion");
const {
  Chart,
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
} = require("chart.js");

Chart.register(LinearScale, BarController, CategoryScale, BarElement);

async function progressiveProfiling() {
  try {
    const sql = "SELECT tools, preferredBrands FROM freelancer";
    const rows = await mysqlExecute(sql);

    // Crear una matriz de datos con las herramientas y marcas de cada freelancer
    const dataMatrix = rows.map((row) => [row.tools, row.preferredBrands]);

    const toolsCount = {};
    const brandsCount = {};

    dataMatrix.forEach((data) => {
      // Obtener herramientas y marcas de la fila actual
      const [tools, brands] = data;

      if ((tools && brands) != null) {
        const toolsList = tools.split(",");
        const brandsList = brands.split(",");

        // Contar herramientas
        toolsList.forEach((tool) => {
          if (tool.trim() !== "") {
            toolsCount[tool.trim()] = (toolsCount[tool.trim()] || 0) + 1;
          }
        });

        // Contar marcas preferidas
        brandsList.forEach((brand) => {
          if (brand.trim() !== "") {
            brandsCount[brand.trim()] = (brandsCount[brand.trim()] || 0) + 1;
          }
        });
      }
    });

    // Ordenar herramientas y marcas por cantidad
    const sortedTools = Object.entries(toolsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const sortedBrands = Object.entries(brandsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Crear gráfica de herramientas
    const toolsChart = createChart(
      "toolsChart",
      "bar",
      sortedTools.map((entry) => entry[0]),
      sortedTools.map((entry) => entry[1]),
      "Herramientas más utilizadas"
    );

    // Crear gráfica de marcas preferidas
    const brandsChart = createChart(
      "brandsChart",
      "bar",
      sortedBrands.map((entry) => entry[0]),
      sortedBrands.map((entry) => entry[1]),
      "Marcas preferidas"
    );

    // Guardar las gráficas como archivos de imagen
    saveChartImage(toolsChart, "analytics/tools_chart.png");
    saveChartImage(brandsChart, "analytics/brands_chart.png");
  } catch (error) {
    console.error("Error al obtener datos de la base de datos:", error);
    throw error;
  }
}
const plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#FFFFF';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};
function createChart(id, type, labels, data, title) {
  const ctx = createCanvasContext(id);
  return new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        customCanvasBackgroundColor: {
          color: 'white',
        }
      },
    },
    plugins: [plugin],
  });
}

// Función para crear un contexto de lienzo utilizando node-canvas
function createCanvasContext(id) {
  const { createCanvas } = require("canvas");
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return ctx;
}


function saveChartImage(chart, filename) {
  const fs = require("fs");

  const buffer = chart.canvas.toBuffer("image/png");

  fs.writeFileSync(filename, buffer);

  console.log(`La gráfica se ha guardado como ${filename}`);
}

module.exports = progressiveProfiling;

progressiveProfiling().catch((error) => console.error(error));
