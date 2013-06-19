var ls = require('./lib/ls.js')
  , Runner = require('./lib/runner.js')
  , fs = require('fs')
  , lines = fs.readFileSync("./samples/blink.txt", "utf-8").split('\n')
  , testSet = require('./test/testset.js')
  , ProgressBar = require('progress')

function deviation(query, expected) {
    var runner = new Runner("genom", ls);
    var best = runner.run(query, Runner.filter(query, lines));
    if (best === expected)
        return 0;
    var sc1 = ls(query, best);
    var sc2 = ls(query, expected);
    return (Math.abs(sc1 - sc2) / sc1);
}

function totalDeviation(tests) {
    var total = 0;
    for(var i = 0; i < tests.length; ++i) {
        total += deviation(tests[i][0], tests[i][1]);
    }
    return total;
}

function mutate(config) {
    for(var i in config) {
        config[i] = Math.random() * 30 | 0;
    }
}

function clone(config) {
    var r = {};
    for(var i in config) r[i] = config[i];
    return r;
}

var best = null;
var bestDeviation = Infinity;
var NUMBER_OF_RUNS = 20;
var bar = new ProgressBar("Training: [:bar] :percent :elapsed", {
    total: NUMBER_OF_RUNS + 1
    complete: ".",
    incomplete: " "
});
bar.tick();
for(var i = 0; i < NUMBER_OF_RUNS; ++i) {
    mutate(ls.config);
    var tmp = totalDeviation(testSet);
    if (tmp < bestDeviation) {
        best = clone(ls.config);
        bestDeviation = tmp;
    }
    bar.tick();
}
console.log(best);

