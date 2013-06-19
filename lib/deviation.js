/**
 * Child process worker that implements QueueWorker interface
 */
var ls = require('./ls.js')
  , Runner = require('./runner.js')
  , fs = require('fs')
  , lines = fs.readFileSync("./samples/blink.txt", "utf-8").split('\n')
  , testset = require('../test/testset.js')
  , QueueWorker = require('./queue.js').QueueWorker

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

function Worker() {
    QueueWorker.call(this);
}

Worker.prototype.doWork = function(m) {
    ls.config = m.config;
    return {idx: m.idx, deviation: totalDeviation(testset)};
}

// Start worker
new Worker();
