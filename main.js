var fs = require('fs')
  , colors = require("colors")
  , Runner = require("./lib/runner.js")
  , program = require("commander")

program
    .usage("-q QUERY [options] [entry1, entry2, ...]")
    .option("-s, --score <scoring function path>", "run specific scoring function only")
    .option("-q, --query <query>", "pass query to run")
    .parse(process.argv);

if (!program.query) {
    program.outputHelp();
    process.exit(1);
}

var lines;
if (program.args.length > 0) {
    lines = program.args.length;
} else {
    lines = fs.readFileSync("samples/blink.txt", "utf-8").split('\n');
}

console.log("Initial lines size: " + lines.length);
lines = Runner.filter(program.query, lines);
console.log("Filtered lines size: " + lines.length);

function executeRunner(runner, query, lines) {
    console.time(runner.name());
    var best = runner.run(query, lines);
    console.timeEnd(runner.name());
    console.log(runner.render(query, best, true));
}

if (program.score) {
    var r = new Runner(program.score, require(program.score));
    executeRunner(r, program.query, lines);
} else {
    var pf = new Runner("pfeldman", require("./lib/pf.js"));
    var ls = new Runner("lushnikov", require("./lib/ls.js"));
    executeRunner(pf, program.query, lines);
    executeRunner(ls, program.query, lines);
}
