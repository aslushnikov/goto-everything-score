var fs = require('fs')
  , colors = require("colors")
  , Runner = require("./lib/runner.js")

var query = process.argv[2];
if (!query || !query.length) {
    console.log("Error: pass query as an arg");
    process.exit(1);
}

var lines;
if (process.argv.length > 3) {
    lines = process.argv.slice(3);
} else {
    lines = fs.readFileSync("samples/full.txt", "utf-8").split('\n');
}

console.log("Initial lines size: " + lines.length);
lines = Runner.filter(query, lines);
console.log("Filtered lines size: " + lines.length);

var pf = new Runner("pfeldman", require("./lib/pf.js"));
var ls = new Runner("lushnikov", require("./lib/ls.js"));

function executeRunner(runner, query, lines) {
    console.time(runner.name());
    var best = runner.run(query, lines);
    console.timeEnd(runner.name());
    console.log(runner.render(query, best, true));
}

executeRunner(pf, query, lines);
executeRunner(ls, query, lines);

