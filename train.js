var ls = require('./lib/ls.js')
  , Runner = require('./lib/runner.js')
  , fs = require('fs')
  , lines = fs.readFileSync("./samples/blink.txt", "utf-8").split('\n')
  , testset = require('./test/testset.js')
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

const UNIVERSE_SIZE = 100;
function mutate(config) {
    for(var i in config) {
        config[i] = Math.random() * UNIVERSE_SIZE | 0;
    }
}

function clone(config) {
    var r = {};
    for(var i in config) r[i] = config[i];
    return r;
}

const POPULATION_SIZE = 10;
function createInitialPopulation() {
    // Initial population
    var population = [];
    for(var i = 0; i < POPULATION_SIZE; ++i) {
        mutate(ls.config);
        population.push(clone(ls.config));
    }
    return population;
}

function selection(population) {
    var results = [];
    for(var i = 0; i < population.length; ++i) {
        ls.config = population[i];
        var deviation = totalDeviation(testset);
        results.push({idx: i, deviation: deviation});
    }
    results.sort(function(a, b) {
        return b.deviation - a.deviation;
    });
    var selected = [];
    for(var i = 0; i < results.length / 2; ++i) {
        selected.push(population[results[i].idx]);
    }
    return selected;
}

function sex(config1, config2) {
    var r = {};
    for(var i in config1) {
        if (Math.random() * 10 >= 5)
            r[i] = config1[i];
        else
            r[i] = config2[i];
        // 20% mutation to the characteristic
        r[i] += r[i] * ((Math.random() * 20 * 2 | 0) - 20) / 100.0
        // boundings
        r[i] = Math.max(r[i], 0);
        r[i] = Math.min(r[i], UNIVERSE_SIZE);
    }
    return r;
}

function addChildren(population) {
    for(var i = 0, n = population.length; i < n; ++i) {
        population.push(sex(population[i], population[i + 1]));
    }
}

function bestFromPopulation(population) {
    var bestDev = Infinity;
    var bestIdx = 0;
    for(var i = 0; i < population.length; ++i) {
        ls.config = population[i];
        var deviation = totalDeviation(testset);
        if (deviation < bestDev) {
            bestDev = deviation;
            bestIdx = i;
        }
    }
    return {
        index: bestIdx,
        deviation: bestDev
    };
}

function runGenerations(generations) {
    var bar = new ProgressBar("Training: [:bar] :percent :elapsed", {
        total: generations + 1,
        complete: ".",
        incomplete: " ",
    });
    bar.tick();
    var population = createInitialPopulation();
    console.log("Initial population length = " + population.length);
    for(var i = 0; i < generations; ++i) {
        population = selection(population);
        console.log("Selected length = " + population.length);
        addChildren(population);
        console.log("Restored length = " + population.length);
        bar.tick();
    }
    var result = bestFromPopulation(population);
    console.log("deviation: " + result.deviation);
    console.log(population[result.index]);
}

program
    .usage("-g generations")
    .option("-g, --generations <generations>", "number of generations", parseInt)
    .parse(process.argv);

if (!program.generations) {
    program.outputHelp();
    process.exit(1);
}

runGenerations(program.generations);
process.exit(0);
