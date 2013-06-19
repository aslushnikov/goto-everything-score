var ls = require('./lib/ls.js')
  , Runner = require('./lib/runner.js')
  , fs = require('fs')
  , lines = fs.readFileSync("./samples/blink.txt", "utf-8").split('\n')
  , testSet = require('./test/testset.js')
  , ProgressBar = require('progress')
  , program = require('commander')

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
        config[i] = Math.random() * 100 | 0;
    }
}

function clone(config) {
    var r = {};
    for(var i in config) r[i] = config[i];
    return r;
}

process.on("SIGUSR2", function() {
    results();
});

program
    .usage("-n RUNS")
    .option("-n, --numruns <runs>", "number of runs", parseInt)
    .parse(process.argv);

if (!program.numruns) {
    program.outputHelp();
    process.exit(1);
}

console.log("Process ID: " + process.pid);
var bar = new ProgressBar("Training: [:bar] :percent :elapsed", {
    total: program.numruns + 1,
    complete: ".",
    incomplete: " ",
    width: 80
});
bar.tick();

var best = null;
var bestDeviation = Infinity;
function iteration(amountLeft) {
    if (!amountLeft) {
        results();
        process.exit(0);
        return;
    }
    mutate(ls.config);
    var tmp = totalDeviation(testSet);
    if (tmp < bestDeviation) {
        best = clone(ls.config);
        bestDeviation = tmp;
    }
    bar.tick();
    setTimeout(iteration.bind(this, amountLeft - 1), 0);
}
iteration(program.numruns);

function results() {
    console.log(best);
}

