
document.querySelector('#generate').addEventListener('click', function () {
  var g = new Dygraph(document.getElementById("g"), getData(),
    {
      showLabelsOnHighlight: parseInt(document.getElementById("lines").value) > 300 ? false : true,
      width: 720,
      height: 480,
      highlightCircleSize: 0,
      strokeWidth: 1,
      strokeBorderWidth: document.getElementById("ch1").checked ? 1 : 0,
      legend: document.getElementById("ch2").checked ? 'follow' : 'onmouseover',
      highlightSeriesOpts: {
        strokeWidth: 2,
        strokeBorderWidth: 1,
        highlightCircleSize: 4
      }
    }
  )
});


document.querySelector('#generate').click();
//function getData_test() {return "Date,Value\n" + "2008-05-07,75\n" + "2008-05-08,70\n" + "2008-05-09,80\n"}


function getData() {
  var data = [];

  var i, j, val, rnd = Math.random, r = Math.round;
  var lines = parseInt(document.getElementById("lines").value);
  var trades = 1 + parseInt(document.getElementById("trades").value);
  var avgWin = 1 * document.getElementById("avgWin").value;
  var avgLoss = 1 * document.getElementById("avgLoss").value;
  var winPerc = parseInt(document.getElementById("winperc").value);
  var startdepo = parseInt(document.getElementById("startDepo").value);
  var mathExp = avgWin * winPerc / 100 - avgLoss * (1 - winPerc / 100);

  for (i = 0; i < trades; i++) data[i] = [i];
  for (i = 1; i < lines + 1; i++) data[0][i] = startdepo;

  for (i = 1; i < lines; i++) {
    val = startdepo;
    for (j = 1; j < trades; j++) {
      data[j][i] = val += (rnd() > winPerc / 100) ? r(-2 * avgLoss * rnd()) : r(2 * avgWin * rnd());
    }
  }
  val = startdepo;
  for (j = 1; j < trades; j++) {
    data[j][i] = val += mathExp;
  }

  return data;
};
