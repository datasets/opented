var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

var baseurl = 'http://files.opented.org.s3.amazonaws.com/scraped/';
var indexurl = 'http://files.opented.org.s3.amazonaws.com/scraped/index.json'
var outdir = 'cache/dumps/';

request(indexurl, function(err, resp, body) {
  if (err) {
    throw err;
  }
  var docs = JSON.parse(body);
  var idx = 0;
  var active = [];
  for (var docid in docs) {
    var files = docs[docid];
    if (files.indexOf('summary') != -1) {
      var url = baseurl + docid + '/summary.html';
      scrapeSummary(url, docid, function(err, data) {
        if (err) {
          console.log('Error processing ' + docid + ': ' + err);
          return;
        }
        var ouroutdir = outdir + data.docid;
        if (!fs.existsSync(ouroutdir)) {
          fs.mkdirSync(ouroutdir, { recursive: true });
        }
        var outpath = ouroutdir + '/extracted.json';
        if (data.finalamount) {
          // console.log(data.finalamount);
        }
        fs.writeFile(outpath, JSON.stringify(data, null, 2), function() {
          console.log('Processed ' + data.docid);
        });
      });
    } else {
      console.log('No summary to extract info from: ' + docid);
    }
    // if (idx > 10) break;
    idx += 1;
  }
});

function scrapeSummary(url, docid, cb) {
  request(url, function(err, resp, body){
    if (err) {
      cb(err);
      return;
    }
    $ = cheerio.load(body);
    var data = {docid: docid};

    data.winnerDetails = $('.txtmark .addr').html();

    $('.mlioccur .txtmark').each(function(i, html) {
      var spans = $(html).find('span');
      var span0 = $(spans[0]);
      if (span0.text() == 'Initial estimated total value of the contract ') {
        var amount = $(spans[4]).text()
        data.finalamount = cleanAmount(amount);
        data.initialamount = cleanAmount($(spans[1]).text());
      }
    });

    cb(null, data);
  });
}

function cleanAmount(amount) {
  amount = amount.replace('Value ', '');
  var parts = amount.split(' ');
  var currency = parts[parts.length - 1];
  amount = parts.slice(0, (parts.length -1)).join('');
  amount = parseFloat(amount.replace(',', '.'))
  return {amount: amount, currency: currency};
}
