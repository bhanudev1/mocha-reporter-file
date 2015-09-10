var fs = require('fs');
var d = new Date();
var dir = './logs';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

var logFilePath = dir + '/log-' + d.toString().replace(/ /g, '-').replace(/:/g, '') + '.txt';

var fileStream = fs.createWriteStream(logFilePath);
var reporter = function (runner) {
  this.initialize.call(this, runner);
};

var console = {
  log: function (message) {
    fileStream.write(message + '\r\n');
  },
  failed: function () {
    var failedFileStream = fs.createWriteStream(dir + '/failed.txt');
    failedFileStream.write('test failed');
  }
};


function title(test) {
  return test.fullTitle().replace(/#/g, '');
}

reporter.prototype.initialize = function (runner) {

  var n = 1;
  var passes = 0;
  var failures = 0;
  runner.on('start', function () {
    console.log("Starting tests");
    var total = runner.grepTotal(runner.suite);
    console.log(1 + ".." + total);
  });

  runner.on('test end', function () {
    ++n;
  });

  runner.on('pending', function (test) {
    console.log('ok' + n + 'SKIP -' + title(test));
  });

  runner.on('pass', function (test) {
    passes++;
    console.log('ok' + n + title(test));
  });

  runner.on('fail', function (test, err) {
    failures++;
    console.log('not ok' + n + title(test));
    if (err.stack) {
      console.log(err.stack.replace(/^/gm, '  '));
    }
  });

  runner.on('end', function () {
    console.log('# tests ' + (passes + failures));
    console.log('# pass ' + passes);
    console.log('# fail ' + failures);
    if (failures > 0) {
      console.failed();
    }
  });
};

module.exports = reporter;