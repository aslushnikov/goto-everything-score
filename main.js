var fs = require('fs')
  , colors = require("colors")
  , Runner = require("./lib/runner.js")
  , program = require("commander")

program
    .usage("-q QUERY [options] [entry1, entry2, ...]")
    .option("-s, --score <path1:path2:path3>", "require functions from given paths", function(e) { return e.split(':'); })
    .option("-q, --query <query>", "pass query to run")
    .parse(process.argv);

if (!program.query) {
    program.outputHelp();
    process.exit(1);
}

var lines;
if (program.args.length > 0) {
    lines = program.args;
} else {
    lines = fs.readFileSync("samples/blink.txt", "utf-8").split('\n');
}

console.log("Initial lines size: " + lines.length);
console.time("filtering");
lines = Runner.filter(program.query, lines);
console.timeEnd("filtering");
console.log("Filtered lines size: " + lines.length);
if (!lines.length) {
    console.log("Dataset size is 0 after filtering");
    process.exit(1);
}

function executeRunner(runner, query, lines) {
    console.time(runner.name());
    var best = runner.run(query, lines);
    console.timeEnd(runner.name());
    console.log(runner.render(query, best, true));
}

if (program.score) {
    for(var i = 0; i < program.score.length; ++i) {
        var r = new Runner(program.score[i], require(program.score[i]));
        executeRunner(r, program.query, lines);
    }
} else {
    var ls = new Runner("lushnikov", require("./lib/ls.js"));
    executeRunner(ls, program.query, lines);
}

