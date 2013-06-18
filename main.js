function filterRegex(query, isGlobal) {
    const toEscape = "^[]{}()\\.$*+?|-,";
    var regexString = "";
    for (var i = 0; i < query.length; ++i) {
        var c = query.charAt(i);
        if (toEscape.indexOf(c) !== -1)
            c = "\\" + c;
        if (i)
            regexString += "[^" + c + "]*";
        regexString += c;
    }
    return new RegExp(regexString, "i" + (isGlobal ? "g" : ""));
}

function filter(lines, query) {
    var m = [];
    var regex = filterRegex(query);
    for(var i = 0; i < lines.length; ++i) {
        if (regex.test(lines[i]))
            m.push(lines[i]);
    }
    return m;
}

function run(query, lines, fun) {
    var best = -1;
    var bestLine = -1;
    for (var i = 0; i < lines.length; ++i) {
        var s = fun(query, lines[i]);
        if (s > best) {
            best = s;
            bestLine = lines[i];
        }
    }
    return bestLine;
}

function render(query, fun, bestMatch) {
    var indexes = [];
    var score = fun(query, bestMatch, indexes);
    var output = "";
    for(var i = 0; i < bestMatch.length; ++i) {
        if (indexes.indexOf(i) >= 0)
            output += bestMatch[i].green.bold;
        else
            output += bestMatch[i];
    }
    console.log(score + ": " + output);
}

var fs = require('fs')
  , ls = require("./ls.js")
  , pf = require("./pf2.js")
  , colors = require("colors")

var query = process.argv[2];
if (!query || !query.length) {
    console.log("Error: pass query as an arg");
    process.exit(1);
}

var lines;
if (process.argv.length > 3) {
    lines = process.argv.slice(3);
} else {
    lines = fs.readFileSync("full.txt", "utf-8").split('\n');
}

console.log("Initial lines size: " + lines.length);
lines = filter(lines, query);
console.log("Filtered lines size: " + lines.length);

console.time("pfeldman");
var best = run(query, lines, pf);
console.timeEnd("pfeldman");
render(query, pf, best);

console.time("lushnikov");
best = run(query, lines, ls);
console.timeEnd("lushnikov");
render(query, ls, best);
