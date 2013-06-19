var fs = require('fs')
  , lsconfig = require('./lib/ls.js').config
  , ProgressBar = require('progress')
  , program = require('commander')
  , Queue = require('./lib/queue.js').Queue;

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

var POPULATION_SIZE = 10;
function createInitialPopulation() {
    // Initial population
    var population = [];
    for(var i = 0; i < POPULATION_SIZE; ++i) {
        mutate(lsconfig);
        population.push(clone(lsconfig));
    }
    return population;
}

var queue;
var bestDeviation = Infinity;
function selection(population, callback) {
    var bar = new ProgressBar("Processing generation: [:bar] :percent :elapsed", {
        total: population.length + 1,
        complete: ".",
        incomplete: " ",
        width: Math.min(population.length + 1, 40)
    });
    var results = new Array(population.length);
    var unprocessed = population.length;
    function handler(m) {
        results[m.idx] = {idx: m.idx, deviation: m.deviation};
        --unprocessed;
        bar.tick();
        if (!unprocessed) {
            getSelected();
        }
    }
    bar.tick();
    queue.on("complete", handler);
    for(var i = 0; i < population.length; ++i) {
        queue.addTask({idx: i, config: population[i]});
    }
    function getSelected() {
        results.sort(function(a, b) {
            return b.deviation - a.deviation;
        });
        var selected = [];
        for(var i = 0; i < results.length / 2; ++i) {
            selected.push(population[results[i].idx]);
        }
        queue.removeListener("complete", handler);
        bestDeviation = results[0].deviation;
        callback(selected);
    }
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


function runGenerations(populations, generations) {
    if (!generations) {
        console.log("Deviation: " + bestDeviation);
        console.log(populations[0]);
        process.exit(0);
        return;
    }
    console.log("Training population %s of %s", program.generations - generations + 1, program.generations);
    selection(population, function(population) {
        addChildren(population);
        setTimeout(runGenerations.bind(this, population, generations - 1), 0);
    });
}

program
    .usage("-g generations")
    .option("-g, --generations <generations>", "number of generations", parseInt)
    .option("-j, --parallel <number>", "number of parallel threads", parseInt, 5)
    .option("-p, --population <number>", "initial population size", parseInt, 10)
    .parse(process.argv);

if (!program.generations) {
    program.outputHelp();
    process.exit(1);
}
POPULATION_SIZE =  program.population;

console.log("Parallelism: " + program.parallel);
console.log("Population: " + program.population);
queue = new Queue(program.parallel, "./lib/deviation.js");

var population = createInitialPopulation();
console.log("Initial population length = " + population.length);

runGenerations(population, program.generations);
