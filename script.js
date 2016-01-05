var STOP_THRESHOLD = 3600; // seconds
var TIMER_INTERVAL = 1000; // mseconds

var watchTimer;
var fbClosed = false;
var isViewer = false;

var setup = function() {
  console.log('setup fbTiler');

  var storedTimestamp = Number(localStorage.getItem("storedTimestamp"));
  if (storedTimestamp == null) {
    console.log("initialize local storage");

    var cDate = new Date();
    storedTimestamp = Math.floor(cDate.getTime() / 1000);
    saveToStorage(storedTimestamp, 0);
  }

  // set loop timer
  watchTimer = setInterval(loop, TIMER_INTERVAL);

  // time limit view
  var mPattern = location.href.match("/messages/([0-9a-z\.\_\-]+)");
  if ((location.pathname == "/" || (mPattern.length > 0 && mPattern[1].length > 0)) &&
      document.title && document.title.length > 0) {
    var element = document.createElement('div');
    element.id = "timeLimitView";
    element.innerHTML = "&nbsp;";
    element.style.position = 'fixed';
    element.style.bottom = '5px';
    element.style.left = '5px';
    document.body.appendChild(element);

    isViewer = true;
  }
}

var loop = function() {
  // parse timestamp to date object
  var cDate = new Date();
  var cHash = getDateHash(Math.floor(cDate.getTime() / 1000));
  var storedTimestamp = Number(localStorage.getItem("storedTimestamp"));
  var sHash = getDateHash(storedTimestamp);

  // check stored date
  var keys = ['Y', 'M', 'D'];
  var isDifferentDate = false;
  for (var i in keys) {
    if (cHash[keys[i]] != sHash[keys[i]]) {
      isDifferentDate = true;
      break;
    }
  }

  // 24 hours elapsed
  if (isDifferentDate == true) {
    cTimestamp = Math.floor(cDate.getTime() / 1000);
    console.log("update stored data", cTimestamp);
    saveToStorage(cTimestamp, 0);
  }
  // check view time
  else {
    var storedViewSec = Number(localStorage.getItem("storedViewSec"));

    if (storedViewSec > STOP_THRESHOLD) {
      //console.log("shut down facebook");
      document.body.innerHTML = '<center><img src="http://serif.hatelabo.jp/images/cache/2b0a04a1636b501e0ad202e672039491b05690d9/f9d7755e1c8f7abead4c76b1a4c5e2225aba1080.gif" style="margin:10px auto;text-align:center;" /></center>';
      fbClosed = true;
    }
    else {
      if (isViewer == true) {
        document.getElementById('timeLimitView').innerHTML = (STOP_THRESHOLD - storedViewSec) + " sec";
      }

      //console.log("only " + (STOP_THRESHOLD - storedViewSec) + " second, you can enjoy facebook");
      saveToStorage(storedTimestamp, storedViewSec + (TIMER_INTERVAL / 1000));

      // TODO: test here
      //if (fbClosed == true) {
      //  location.reload();
      //}
    }
  }
}

var getDateHash = function(timestamp) {
  var d = new Date(timestamp * 1000);

  var hash = {
    Y  : d.getFullYear(), // year
    M : d.getMonth() + 1, // month
    D   : d.getDate(), // date
    h  : d.getHours(), // hour
    m   : d.getMinutes(), // min
    s   : d.getSeconds(), // sec
    t : Math.floor( d.getTime() / 1000 ), // unix time
  };

  for (var k in hash) {
    if (k != 'Y' && k != 't') {
      hash[k] = ('0' + hash[k]).slice(-2);
    }
  }

  return hash;
}

var saveToStorage = function(st, sv) {
  localStorage.setItem("storedTimestamp", st); // unix time
  localStorage.setItem("storedViewSec", sv); // sec
}

setup();
