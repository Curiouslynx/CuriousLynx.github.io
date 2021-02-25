/*global window */
/*jslint browser: true */

// (function (root) {
//   "use strict";
//   var h = root ? root.location.hostname : "";
//   var p = root ? root.location.protocol : "";
//   if ("http:" === p && !(/^(localhost|127.0.0.1)/).test(h)) {
//     root.location.protocol = "https:";
//   }
// }("undefined" !== typeof window ? window : this));


// if (window.location.protocol != 'https:') location.href = location.href.replace("http://", "https://");

if (window.location.protocol === "http:") {
  window.location.protocol = "https:";
}
