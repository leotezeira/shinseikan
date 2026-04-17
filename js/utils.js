/* global window, document */
(function () {
  "use strict";

  var Shinseikan = (window.Shinseikan = window.Shinseikan || {});

  Shinseikan.qs = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  Shinseikan.qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  Shinseikan.uid = function () {
    return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  };

  Shinseikan.clamp = function (n, min, max) {
    return Math.max(min, Math.min(max, n));
  };

  Shinseikan.formatARS = function (value) {
    if (value === null || value === undefined || value === "") return "—";
    var number = Number(value);
    if (!isFinite(number)) return String(value);
    return "$ " + number.toLocaleString("es-AR");
  };

  Shinseikan.normalizePhone = function (raw) {
    return String(raw || "")
      .replace(/\s+/g, "")
      .replace(/[^\d]/g, "");
  };

  Shinseikan.buildWaLink = function (phoneRaw, message) {
    var phone = Shinseikan.normalizePhone(phoneRaw);
    var text = encodeURIComponent(message || "");
    return "https://wa.me/" + phone + "?text=" + text;
  };

  Shinseikan.safeText = function (value) {
    return String(value || "").trim();
  };

  Shinseikan.fileToDataUrl = function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve("");
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = function () {
        reject(reader.error || new Error("No se pudo leer el archivo"));
      };
      reader.readAsDataURL(file);
    });
  };

  Shinseikan.downloadTextFile = function (filename, text) {
    var blob = new Blob([text], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 500);
  };

  Shinseikan.defaultLogoDataUrl = function () {
    // SVG liviano, inspiración “sello” japonés (rojo + negro).
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#c1121f" stop-opacity=".22"/>' +
      '<stop offset="1" stop-color="#c8a24a" stop-opacity=".20"/>' +
      "</linearGradient></defs>" +
      '<rect x="6" y="6" width="84" height="84" rx="18" fill="url(#g)" stroke="rgba(0,0,0,.18)" />' +
      '<circle cx="48" cy="48" r="20" fill="rgba(193,18,31,.10)" stroke="rgba(0,0,0,.18)"/>' +
      '<path d="M48 30c6 0 10 4 10 10 0 8-10 16-10 16s-10-8-10-16c0-6 4-10 10-10z" fill="#0b0b0b"/>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
})();
