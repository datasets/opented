var request = require('request');
var cheerio = require('cheerio');

url = 'http://resources.opendatalabs.org/datasets/opented/cache/dumps/98116-2011.html'

request(url, function(err, resp, body){
  $ = cheerio.load(body);
  var data = {};

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

  return data;
});

function cleanAmount(amount) {
  amount = amount.replace('Value ', '');
  var parts = amount.split(' ');
  var currency = parts[parts.length - 1];
  amount = parts.slice(0, (parts.length -1)).join('');
  amount = parseFloat(amount.replace(',', '.'))
  return {amount: amount, currency: currency};
}

