const fs = require('fs').promises;

async function read_candlesticks_from_CSV(filePath) {
  try {
    const csv_data = await fs.readFile(filePath, 'utf-8');
    const candlesticks = csv_data.trim().split('\n').map(line => {
      const [timestamp, open, high, low, close] = line.split(',');
      return { timestamp: new Date(timestamp), open, high, low, close };
    });
    return candlesticks;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function filter_fractal_candlesticks(candlesticks) {
  const fractal_candlesticks = [];
  for (let i = 2; i < candlesticks.length - 2; i++) {
    const current = candlesticks[i];
    const prev_1 = candlesticks[i - 1];
    const prev_2 = candlesticks[i - 2];
    const next_1 = candlesticks[i + 1];
    const next_2 = candlesticks[i + 2];

    const is_higher = current.high > prev_1.high && current.high > prev_2.high &&
                     current.high > next_1.high && current.high > next_2.high;
    const is_lower = current.low < prev_1.low && current.low < prev_2.low &&
                    current.low < next_1.low && current.low < next_2.low;

    
    if (is_higher || is_lower) {
      fractal_candlesticks.push(current);
    }
  }
  return fractal_candlesticks;
}


async function generate_HTML(fractalCandlesticks) {
  let htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Candlestick Chart with Fractals</title>
  </head>
  <body>
    <h1>Candlestick Chart with Fractals</h1>
    <div id="chart-container"></div>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      const candlesticks = ${JSON.stringify(fractalCandlesticks)};
      // Initialize Chart.js and plot candlesticks and fractals here
    </script>
  </body>
  </html>
  `;
  await fs.writeFile('candlestick_chart_with_fractals.html', htmlContent);
  console.log('HTML file generated successfully.');
}

async function main() {
  const candlesticks = await read_candlesticks_from_CSV('eurusd.csv');
  const fractal_candlesticks = filter_fractal_candlesticks(candlesticks);
  await generate_HTML(fractal_candlesticks);
}
main();