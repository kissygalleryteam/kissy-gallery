var KISSY = require('KISSY');
var jasmine = require('jasmine-node');
var path = require('path');

KISSY.config({
    packages: [
        {
            name: 'form',
            path: path.resolve('.')+'/src',
            charset: 'gbk'
        }
    ]
});

for (var key in jasmine) {
  global[key] = jasmine[key];
}

global.prepare = function(mods, fn) {
    beforeEach(function() {
        var ok = 0;
        KISSY.use(mods, function() {
            ok = 1;
            var that = this, args = [].slice.call(arguments);
            runs(function() {
                fn.apply(that, args);
            });
        });
        waitsFor(function() {
            return ok;
        }, mods + ' is not loaded.', 10000);
    });
};

var isVerbose = false;
var showColors = true;
process.argv.forEach(function(arg) {
  switch (arg) {
  case '--color': showColors = true; break;
  case '--noColor': showColors = false; break;
  case '--verbose': isVerbose = true; break;
  }
});

var getTestFile = function() {
    var c = process.argv[2];
    return path.resolve(__dirname, c);
};

jasmine.executeSpecsInFolder(getTestFile(), function(runner, log) {
    console.log('Running on: ' + __dirname + getTestFile());
    process.exit(runner.results().failedCount == 0 ? 0 : 1);
}, isVerbose, showColors, undefined, undefined, /spec\.js$/, {});