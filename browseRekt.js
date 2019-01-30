#!/usr/bin/env node
// browseRekt.js
// Scriptless browser identification PoC
// Coded by n0ncetonic
// Blacksun Research Labs 2019

const http = require('http');

const server = http.createServer();

const skip = ["dnt", "cache-control", "pragma", "referer"];

const chrome = ["host","connection","upgrade-insecure-requests","user-agent","accept","accept-encoding","accept-language"];
const firefox = ["host","user-agent","accept","accept-language","accept-encoding","connection","upgrade-insecure-requests"];
const safari = ["host","connection","upgrade-insecure-requests","accept","user-agent","accept-language","accept-encoding"];

function isChrome(headers) {
  // Check for brotli support
  if (headers['accept-encoding'].includes('br')) {
    return true;
  }

  // Check for WEBP and APNG support
  if (headers['accept'].includes('image/webp,image/apng')) {
    return true;
  }

  // Check `q` value of language support
  // !!! This is potentially a very flimsy test    !!!
  // !!! which will more than likely fail in newer !!!
  // !!! versions of Chrome                        !!!
  if (headers['accept-language'].includes('q=0.9')) {
    return true;
  }

  return false;
}

function isSafari(headers) {
  // Check `Accept-Language` case
  if (headers['accept-language'].includes('en-us')) {
    return true;
  }

  return false;
}

// This just iterates through headers and stores them into an array
function getHeaderOrder(headers) {
  var keys = Object.keys(headers),
    len = keys.length,
    i = 0,
    prop,
    value;

  // Holds our fingerprint for later
  var fingerprint = [];

  while (i < len) {
    prop = keys[i];
    value = headers[prop];

    badLength = skip.length;
    skipHeader = false;

    // Makes sure the header isn't one of the headers we've designated to be skipped
    while(badLength--) {
      if (prop.indexOf(skip[badLength]) !=-1) {
        skipHeader = true;
      }
    }

    if (!skipHeader) {
      fingerprint.push(prop);
    }

    i += 1;
  }
  return fingerprint;
}

// Helper function to compare arrays based on content and order
function arraysEqual(a1, a2) {
  if (JSON.stringify(a1) === JSON.stringify(a2)) {
    return true;
  }
  return false;
}


function idHeaders(headers) {
  fingerprint = getHeaderOrder(headers);

  if (arraysEqual(fingerprint, chrome)) {
    return "Chrome";
  } else if (arraysEqual(fingerprint, safari)) {
    return "Safari";
  } else if (arraysEqual(fingerprint, firefox)) {
    return "Firefox";
  } else {
    return "";
  }
}

server.on('request', (req, res) => {
  headers = req.headers;
  res.writeHead(200);

  if (isChrome(headers)) {
    res.write('Browser Detected: Chrome');
    res.end();
    return;
  } else if (isSafari(headers)) {
    res.write('Browser Detected: Safari');
    res.end();
    return;
  } else {
      browserID = idHeaders(headers)
      if (browserID != "") {
        res.write('Browser Detected: ' + browserID);
      } else {
        res.write('Unabe To Detect Browser')
      }
      res.end();
      return;
    }
});

server.listen(10101);
