const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function stream_CSV(filePath, action) {
  const buffer = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  for await (const data of stream) {
    buffer.push(data);
    if (buffer.length > 4) {
      action(buffer.slice(buffer.length - 5));
      buffer.shift();
    }
  }
  if (buffer.length > 0) action(buffer);
}

function check_fractals(candlesticks) {
  console.log(candlesticks.length);
  return candlesticks.filter((candle, i, array) => {
    if (i >= 2 && i <= array.length - 3) {
      const prev_1 = array[i - 1];
      const prev_2 = array[i - 2];
      const next_1 = array[i + 1];
      const next_2 = array[i + 2];

      const is_higher = candle.high > prev_1.high && candle.high > prev_2.high && candle.high > next_1.high && candle.high > next_2.high;
      const is_lower = candle.low < prev_1.low && candle.low < prev_2.low && candle.low < next_1.low && candle.low < next_2.low;
      
      console.log(`Index ${i}: Checking ${candle.high} against ${prev_1.high}, ${prev_2.high}, ${next_1.high}, ${next_2.high}`);

      return is_higher || is_lower;
    }
    return false;
  });
}


async function main() {
  const file_path = path.join(__dirname, 'eurusd.csv');
  await stream_CSV(file_path, (data) => {
    const fractals = check_fractals(data);
    if (fractals.length) console.log('Fractal candles:', fractals);
  });
}
main();