//////////////////////////////// function expressions: ////////////////////////////////////


var loadCoinsNames = function (url) {
  var arr = [];

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false); // по умолчанию асинхронный: async===true
  xhr.send();
  try {
    var response = JSON.parse(xhr.responseText); // [{},{},{},..]
  } catch (err) {
    console.log('Parsing error: ' + url);
    return arr;
  }
  response.forEach(function (obj) {
    if (obj.symbol.slice(-3) === 'BTC') {
      arr.push(obj.symbol);
    }
  });
  arr.sort().reverse();

  return arr;
}


var getChart = function (data, pair, timeframe) {
  var div = document.createElement('div');

  div.style.display = 'inline-block';
  var h4 = document.createElement('h5');
  h4.style.width = '600px';
  h4.style.textAlign = 'center';
  h4.textContent = pair.replace('BTC', '-BTC') + ', ' + (timeframe == '1d' ? '1D' : timeframe) + ':';
  div.appendChild(h4);

  var chart = LightweightCharts.createChart(div, {
    width: 600,
    height: 340,
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 4,
      rightOffset: 6,
      rightBarStaysOnScroll: true,
    },
    handleScroll: false,
    handleScale: false,
  });

  var candleSeries = chart.addCandlestickSeries({
    priceFormat: {
      type: 'custom',
      precision: 0,
      formatter: function (price) {
        return Math.round(price); // + 's'; // satoshi
      }
    }
  });

  var volumeSeries = chart.addHistogramSeries({
    color: '#26a69a',
    lineWidth: 2,
    priceFormat: {
      type: 'volume',
    },
    overlay: true,
    scaleMargins: {
      top: 0.9,
      bottom: 0,
    }
  });

  var k = 1;
  if (pair.slice(-3) === 'BTC') {
    k = 100000000;
  }

  var candles = [];
  var volumes = [];

  data.forEach(function (item) {
    candles.push({time: item[0] / 1000 + (60 * 60 * 3), open: item[1] * k, high: item[2] * k, low: item[3] * k, close: item[4] * k, });
    volumes.push({time: item[0] / 1000 + (60 * 60 * 3), value: item[7], color: 'rgba(133, 133, 133, 0.4)'});
  });

  candleSeries.setData(candles);
  volumeSeries.setData(volumes);

  return div;
}


var loadChart = function (pair, tf) {
  var span = document.createElement('span');

  span.style.display = 'inline-block';
  var url = 'https://api.binance.com/api/v3/klines?interval=' + tf + '&limit=140&symbol=' + pair;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function () {
    try {
      var quotes = JSON.parse(xhr.responseText);
    } catch (err) {
      console.log('Parsing error: ' + pair + ',' + tf);
      return;
    }
    if (Date.now() - quotes[quotes.length - 1][6] < 1000 * 60 * 60 * 24 * 2) {
      span.appendChild(getChart(quotes, pair, tf));
    } else {
      if (delisted.indexOf(pair) === -1) {
        delisted.push(pair);
      }
    }
  });
  xhr.open('GET', url);
  xhr.timeout = 3000;
  xhr.send();

  return span;
}


var loadAndRender2charts = function () {
  if (!coinsForRendering.length) return;
  var pairName = coinsForRendering.pop();
  if (delisted.indexOf(pairName) !== -1) return;
  var div = document.createElement('div');
  div.style.outline = '1px solid silver';
  div.style.paddingTop = '15px';
  div.style.textAlign = 'center';
  var chart1 = loadChart(pairName, tf1);
  var chart2 = loadChart(pairName, tf2);
  if (chart1) div.appendChild(chart1);
  if (chart2) div.appendChild(chart2);
  if (chart1 && chart2) {
    document.querySelector('.quotes').appendChild(div);
  } else {
    coinsForRendering.push(pairName);
  }
}


var debounce = function (cb) {
  var lastTimeout = null;
  return function () {
    var parameters = arguments;
    if (lastTimeout) {
      window.clearTimeout(lastTimeout);
    }
    lastTimeout = window.setTimeout(function () {
      cb.apply(null, parameters);
    }, 555);
  };
};


var init = debounce(function () {
  coinsForRendering = coinsNames.slice(); // copy array
  if (sorting.value === 'reverse') coinsForRendering.reverse();
  tf1 = document.querySelector('#leftTimeframe').value;
  tf2 = document.querySelector('#rightTimeframe').value;
  document.querySelector('.quotes').innerHTML = '';
  loadAndRender2charts();
  loadAndRender2charts();
  loadAndRender2charts();
  loadAndRender2charts();
  loadAndRender2charts();
});


//////////////////////////////////// main program: /////////////////////////////////////


const coinsNames = loadCoinsNames('https://api.binance.com/api/v3/ticker/price');
var coinsForRendering = [];
var delisted = [];
var tf1 = document.querySelector('#leftTimeframe').value;
var tf2 = document.querySelector('#rightTimeframe').value;


document.querySelector('select#sorting').addEventListener('change', function () {
  init();
});

document.querySelector('select#leftTimeframe').addEventListener('change', function () {
  init();
});

document.querySelector('select#rightTimeframe').addEventListener('change', function () {
  init();
});


document.addEventListener('scroll', function () {
  if (!coinsForRendering.length) return;
  var scrollBottom = document.documentElement.scrollHeight - document.documentElement.clientHeight - document.documentElement.scrollTop;
  if (scrollBottom < 300) {
    loadAndRender2charts();
    loadAndRender2charts();
    loadAndRender2charts();
  }
});


init();
