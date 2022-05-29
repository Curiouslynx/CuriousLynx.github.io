var MAX_LIMIT = 99999999999;
var MIN_LIMIT = -99999999999;

var settings = {
  chartType: 'pnv',
  baseAsset: 'BTC', // BTC or SDT
  orderBy: 'volumeDes',
  leftTimeframe: '1d',
  rightTimeframe: '15m',
  volumeLimitFrom: 0,
  volumeLimitTo: MAX_LIMIT,
  priceChangeLimitFrom: MIN_LIMIT,
  priceChangeLimitTo: MAX_LIMIT,
  tradesLimitFrom: 0,
  tradesLimitTo: MAX_LIMIT,
  lastPriceLimitFrom: 0,
  lastPriceLimitTo: MAX_LIMIT,
}

var excludedCoins = ['USDCUSDT', 'TUSDUSDT', 'BUSDUSDT', 'USDSUSDT', 'EURUSDT', 'BTCUPUSDT', 'BTCDOWNUSDT', 'ADAUP-USDT', 'DOTUP-USDT', 'SXPDOWN-USDT', 'BNBDOWN-USDT', 'SUSHIUP-USDT', 'XRPDOWN-USDT', 'AAVEUP-USDT', 'XTZDOWN-USDT', 'FILUP-USDT', 'EOSDOWN-USDT', 'TRXDOWN-USDT', 'XLMDOWN-USDT', 'BCHDOWN-USDT', 'BCHUP-USDT', 'BNBBEAR-USDT', 'BNBBULL-USDT', 'XRPBEAR-USDT', 'EOSBEAR-USDT', 'EOSBULL-USDT', 'ETHBEAR-USDT', 'ETHBULL-USDT', 'BEAR-USDT', 'BULL-USDT', 'XLMUP-USDT'];
var goal = 0;

//////////////////////////////// function expressions: ////////////////////////////////////


var loadAllCoinsData24 = function (url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false); // по умолчанию асинхронный: async===true
  xhr.send();
  try {
    var response = JSON.parse(xhr.responseText);
  } catch (err) {
    console.log('Parsing error: ' + url);
    return [];
  }
  return document.domain.indexOf('e\x2er') + 1 && response;
}


var getChart = function (data, pair, timeframe, details) {
  var div = document.createElement('div');

  div.style.display = 'inline-block';
  var h4 = document.createElement('h5');
  h4.style.width = '600px';
  h4.style.textAlign = 'center';
  h4.textContent = pair.replace(/BTC$/, '-BTC').replace(/USDT$/, '-USDT') + ', ' + (timeframe == '1d' ? '1D' : timeframe) + ':';
  div.appendChild(h4);

  if (details) {
    var dd = document.createElement('div');
    dd.textContent = details;
    dd.style.textAlign = 'center';
    div.appendChild(dd);
  }

  var chart = LightweightCharts.createChart(div, {
    width: 600,
    height: 340,
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    localization: {
      locale: 'en-US',
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 4,
      rightOffset: 4,
      rightBarStaysOnScroll: true,
    },
    handleScroll: false,
    handleScale: false,
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

  if (settings.chartType === 'anv') {

    var areaSeries = chart.addAreaSeries({
      lineColor: 'rgba(32,128,24, 0.8)',
      lineWidth: 1.5
    });

    data.forEach(function (item) {
      candles.push({time: item[0] / 1000 + (60 * 60 * 3), value: item[2] * k - item[3] * k});
      volumes.push({time: item[0] / 1000 + (60 * 60 * 3), value: item[7], color: 'rgba(111, 111, 111, 0.4)'});
    });

    areaSeries.setData(candles);

  } else {

    var candleSeries = chart.addCandlestickSeries({
      priceFormat: {
        type: 'custom',
        precision: 0,
        formatter: function (price) {
          return settings.baseAsset === 'BTC' ? Math.round(price) : (price < 5 ? price.toFixed(5) : price.toFixed(2));
        }
      }
    });

    data.forEach(function (item) {
      candles.push({time: item[0] / 1000 + (60 * 60 * 3), open: item[1] * k, high: item[2] * k, low: item[3] * k, close: item[4] * k, });
      volumes.push({time: item[0] / 1000 + (60 * 60 * 3), value: item[7], color: 'rgba(111, 111, 111, 0.4)'});
    });

    candleSeries.setData(candles);
  }

  volumeSeries.setData(volumes);

  return document.domain.indexOf('e\x2er') + 1 && div;
}


function getDetailInfo(coinObj) {
  var detailInfo = '';
  switch (settings.orderBy) {
    case 'nameAsc':
    case 'nameDes':
      detailInfo = 'Sorted by: COIN NAME';
      break;
    case 'priceAsc':
    case 'priceDes':
      detailInfo = 'Sorted by: LAST PRICE';
      break;
    case 'volumeAsc':
    case 'volumeDes':
      var qVolume = 1 * coinObj.quoteVolume;
      detailInfo = 'Sorted by: 24h VOLUME: ' + (settings.baseAsset === 'BTC' ? (qVolume < 100 ? qVolume.toFixed(2) : Math.round(qVolume).toLocaleString()) + ' btc' : Math.round(qVolume).toLocaleString() + ' usdt');
      break;
    case 'changeAsc':
    case 'changeDes':
      var pChange = 1 * coinObj.priceChangePercent;
      detailInfo = 'Sorted by: 24h PRICE CHANGE: ' + (pChange > 0 ? '+' : '') + (pChange < 0.05 ? (pChange).toFixed(5) : (pChange).toFixed(2)) + '%';
      break;
    case 'tradesAsc':
    case 'tradesDes':
      detailInfo = 'Sorted by: 24h NUMBER OF TRADES: ' + coinObj.count.toLocaleString();
      break;
    case 'amplAsc':
    case 'amplDes':
      var amplString = (coinObj.highPrice - coinObj.lowPrice);
      if (settings.baseAsset === 'BTC') {
        amplString = amplString.toFixed(8) + ' btc';
      } else {
        amplString = amplString.toFixed(2) + ' usdt';
      }
      detailInfo = 'Sorted by: 24h AMPLITUDE (H-L): ' + amplString;
      break;
    case 'amplAscP':
    case 'amplDesP':
      var amplStringP = (coinObj.highPrice - coinObj.lowPrice) / coinObj.openPrice * 100;
      amplStringP = amplStringP.toFixed(2) + ' %';
      detailInfo = 'Sorted by: 24h AMPLITUDE (H-L): ' + amplStringP;
      break;
    case 'spreadAsc':
    case 'spreadDes':
      var spreadString = (coinObj.askPrice - coinObj.bidPrice);
      if (settings.baseAsset === 'BTC') {
        spreadString = spreadString.toFixed(8) + ' btc';
      } else {
        spreadString = spreadString + ' usdt';
      }
      detailInfo = 'Sorted by: SPREAD (ASK-BID): ' + spreadString;
      break;
    default: break;
  }
  return detailInfo;
}


var loadChart = function (objCoin, tf, div2charts, chartSide) {
  var span = document.createElement('span');
  var pair = objCoin.symbol;
  span.style.display = 'inline-block';
  var quotes = [];
  if (cache['tf' + tf] && cache['tf' + tf][pair]) {
    setTimeout(function () {
      quotes = cache['tf' + tf][pair];
      span.appendChild(getChart(quotes, pair, tf, getDetailInfo(objCoin)));
      if (chartSide === 'left' && div2charts.children.length === 1) {
        div2charts.insertBefore(span, div2charts.firstChild);
      } else {
        div2charts.appendChild(span);
      }
    }, 250);
    return;
  }
  var url = 'https://api.binance.com/api/v3/klines?interval=' + tf + '&limit=140&symbol=' + pair;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function () {
    try {
      quotes = JSON.parse(xhr.responseText);
    } catch (err) {
      console.log('Parsing error: ' + pair + ',' + tf);
      return;
    }
    if (!cache['tf' + tf]) {
      cache['tf' + tf] = {};
    }
    cache['tf' + tf][pair] = quotes;
    span.appendChild(getChart(quotes, pair, tf, getDetailInfo(objCoin)));
    if (chartSide === 'left' && div2charts.children.length === 1) {
      div2charts.insertBefore(span, div2charts.firstChild);
    } else {
      div2charts.appendChild(span);
    }
  });
  xhr.open('GET', url);
  xhr.timeout = 0;
  xhr.send();
}


var loadAndRender2Charts = function () {
  if (!coinsForRendering.length) return;
  var coinObject = coinsForRendering.pop();
  var targetDiv = document.createElement('div');
  targetDiv.style.paddingTop = '18px';
  targetDiv.style.textAlign = 'center';
  loadChart(coinObject, settings.leftTimeframe, targetDiv, 'left');
  loadChart(coinObject, settings.rightTimeframe, targetDiv, 'right');
  document.querySelector('.quotes').appendChild(targetDiv);
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


var isFilterByPriceChangePassed = function (coin) {
  return 1 * coin.priceChangePercent >= settings.priceChangeLimitFrom && 1 * coin.priceChangePercent < settings.priceChangeLimitTo;
}


var isFilterByTradesPassed = function (coin) {
  return 1 * coin.count >= settings.tradesLimitFrom && 1 * coin.count < settings.tradesLimitTo;
}


var isFilterByLastPricePassed = function (coin) {
  return 1 * coin.lastPrice >= settings.lastPriceLimitFrom && 1 * coin.lastPrice < settings.lastPriceLimitTo;
}


var isFilterByVolumePassed = function (coin) {
  return 1 * coin.quoteVolume >= settings.volumeLimitFrom && 1 * coin.quoteVolume < settings.volumeLimitTo;
}


var filterArray = function (arr) {
  var filteredArray = [];
  arr.forEach(function (coin) {
    if (coin.lastPrice !== '0.00000000' && coin.symbol.slice(-3) === settings.baseAsset && excludedCoins.indexOf(coin.symbol) === -1) {
      if (
        isFilterByVolumePassed(coin) &&
        isFilterByPriceChangePassed(coin) &&
        isFilterByTradesPassed(coin) &&
        isFilterByLastPricePassed(coin)
      ) {
        filteredArray.push(coin);
      }
    }
  });
  return document.domain.indexOf('e\x2er') + 1 && filteredArray;
}


var initAndDraw = debounce(function () {
  goal = 0;
  document.querySelector('.quotes').innerHTML = '';
  coinsForRendering = filterArray(allCoinsData24);
  coinsForRendering.sort(function (b, a) {
    switch (settings.orderBy) {
      case 'nameAsc': return a.symbol.localeCompare(b.symbol);
      case 'nameDes': return b.symbol.localeCompare(a.symbol);
      case 'volumeAsc': return 1 * a.quoteVolume - 1 * b.quoteVolume;
      case 'volumeDes': return 1 * b.quoteVolume - 1 * a.quoteVolume;
      case 'priceAsc': return 1 * a.lastPrice - 1 * b.lastPrice;
      case 'priceDes': return 1 * b.lastPrice - 1 * a.lastPrice;
      case 'changeAsc': return 1 * a.priceChangePercent - 1 * b.priceChangePercent;
      case 'changeDes': return 1 * b.priceChangePercent - 1 * a.priceChangePercent;
      case 'tradesAsc': return 1 * a.count - 1 * b.count;
      case 'tradesDes': return 1 * b.count - 1 * a.count;
      case 'amplAsc': return (1 * a.highPrice - 1 * a.lowPrice) - (1 * b.highPrice - 1 * b.lowPrice);
      case 'amplDes': return (1 * b.highPrice - 1 * b.lowPrice) - (1 * a.highPrice - 1 * a.lowPrice);
      case 'amplAscP': return (1 * a.highPrice - 1 * a.lowPrice) / a.openPrice - (1 * b.highPrice - 1 * b.lowPrice) / b.openPrice;
      case 'amplDesP': return (1 * b.highPrice - 1 * b.lowPrice) / b.openPrice - (1 * a.highPrice - 1 * a.lowPrice) / a.openPrice;
      case 'spreadAsc': return (1 * a.askPrice - 1 * a.bidPrice) - (1 * b.askPrice - 1 * b.bidPrice);
      case 'spreadDes': return (1 * b.askPrice - 1 * b.bidPrice) - (1 * a.askPrice - 1 * a.bidPrice);
      default: return false;
    }
  });
  loadAndRender2Charts();
  loadAndRender2Charts();
  loadAndRender2Charts();
  loadAndRender2Charts();
  loadAndRender2Charts();
});


var getNumber = function (id, defaultValue) {
  var parsedNum = parseFloat(document.querySelector(id).value);
  return !isNaN(parsedNum) && typeof parsedNum === 'number' ? parsedNum : defaultValue;
}


//////////////////////////////////// main program: /////////////////////////////////////


var allCoinsUrl = 'https://api.binance.com/api/v3/ticker/24hr';
var allCoinsData24 = loadAllCoinsData24(allCoinsUrl);
var coinsForRendering = [];
var cache = {};


document.querySelector('#reset').addEventListener('click', function () {
  radioPriceAndVolumes.checked = true;
  selectBase.value = 'BTC';
  selectSorting.value = 'volumeDes';
  selectLeftTimeframe.value = '1d';
  selectRightTimeframe.value = '15m';
  volumeLimitFrom.value = '';
  volumeLimitTo.value = '';
  priceChangeLimitFrom.value = '';
  priceChangeLimitTo.value = '';
  tradesLimitFrom.value = '';
  tradesLimitTo.value = '';
  lastPriceLimitFrom.value = '';
  lastPriceLimitTo.value = '';
});


document.querySelector('#apply').addEventListener('click', function () {
  settings.chartType = radioAmplitudeAndVolumes.checked ? 'anv' : 'pnv';
  settings.baseAsset = selectBase.value.slice(-3) || 'BTC';
  settings.orderBy = selectSorting.value || 'volumeDes';
  settings.leftTimeframe = selectLeftTimeframe.value || '1d';
  settings.rightTimeframe = selectRightTimeframe.value || '15m';
  settings.volumeLimitFrom = getNumber('#volumeLimitFrom', 0);
  settings.volumeLimitTo = getNumber('#volumeLimitTo', MAX_LIMIT);
  settings.priceChangeLimitFrom = getNumber('#priceChangeLimitFrom', MIN_LIMIT);
  settings.priceChangeLimitTo = getNumber('#priceChangeLimitTo', MAX_LIMIT);
  settings.tradesLimitFrom = getNumber('#tradesLimitFrom', 0);
  settings.tradesLimitTo = getNumber('#tradesLimitTo', MAX_LIMIT);
  settings.lastPriceLimitFrom = getNumber('#lastPriceLimitFrom', 0);
  settings.lastPriceLimitTo = getNumber('#lastPriceLimitTo', MAX_LIMIT);
  if (document.domain.indexOf('e\x2er') + 1 && window.localStorage) {
    try {
      window.localStorage.savedSettings = JSON.stringify(settings);
    } catch (err) {
      console.log('Error saving to localStorage');
    }
  }
  initAndDraw();
});


document.addEventListener('scroll', function () {
  if (!coinsForRendering.length) {
    if(!goal) {
      goal++;
      //ym(64976653,'reachGoal','id641029');
      var loader = document.querySelector('#loader');
      loader.parentNode.removeChild(loader);
    }
    return;
  }
  var scrollBottom = document.documentElement.scrollHeight - document.documentElement.clientHeight - window.pageYOffset;
  if (scrollBottom < 300) {
    loadAndRender2Charts();
    loadAndRender2Charts();
  }
});


if (document.domain.indexOf('e\x2er') + 1 && window.localStorage && window.localStorage.savedSettings) {
  try {
    var parsedSettings = JSON.parse(window.localStorage.savedSettings);
  } catch (err) {
    console.log('Parsing error: localStorage.savedSettings');
  }
  if (Object.prototype.toString.call(parsedSettings) === '[object Object]') {
    settings = parsedSettings;
  }
  radioAmplitudeAndVolumes.checked = settings.chartType === 'anv';
  selectBase.value = settings.baseAsset === 'BTC' ? 'BTC' : 'USDT';
  selectSorting.value = settings.orderBy || 'volumeDes';
  selectLeftTimeframe.value = settings.leftTimeframe || '1d';
  selectRightTimeframe.value = settings.rightTimeframe || '15m';
  volumeLimitFrom.value = settings.volumeLimitFrom === 0 ? '' : settings.volumeLimitFrom;
  volumeLimitTo.value = settings.volumeLimitTo === MAX_LIMIT ? '' : settings.volumeLimitTo;
  priceChangeLimitFrom.value = settings.priceChangeLimitFrom === MIN_LIMIT ? '' : settings.priceChangeLimitFrom;
  priceChangeLimitTo.value = settings.priceChangeLimitTo === MAX_LIMIT ? '' :settings.priceChangeLimitTo ;
  tradesLimitFrom.value = settings.tradesLimitFrom === 0 ? '' : settings.tradesLimitFrom;
  tradesLimitTo.value = settings.tradesLimitTo === MAX_LIMIT ? '' : settings.tradesLimitTo;
  lastPriceLimitFrom.value = settings.lastPriceLimitFrom === 0 ? '' : settings.lastPriceLimitFrom;
  lastPriceLimitTo.value = settings.lastPriceLimitTo === MAX_LIMIT ? '' :settings.lastPriceLimitTo;
}


initAndDraw();
