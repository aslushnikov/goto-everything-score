var fs = require('fs');

var lines = fs.readFileSync("fs.txt", "utf-8").split("\n");
console.log("Lines read: " + lines.length);

var d = [];
var lastData = "";

function score(query, data) {
    if (data.length === 0)
        return 0;
    var prefix = 0;
    var n = Math.min(data.length, lastData.length);
    while (prefix < n && data.charAt(prefix) === lastData.charAt(prefix))
        ++prefix;

    d.splice(prefix);
    for(var j = prefix; j < data.length; ++j) {
        d.push([]);
        for(var i = 0; i < query.length; ++i) {
            var a = i === 0 ? 0 : d[j][i - 1];
            var b = j === 0 ? 0 : d[j - 1][i];
            var c = i === 0 || j === 0 ? 0 : d[j - 1][i - 1];
            var m = match(query, data, i, j);
            d[j].push(Math.max(Math.max(a, b), c + m));
        }
    }
    return d[data.length - 1][query.length - 1];
}

function match(query, data, i, j) {
    if (query.charAt(i) === data.charAt(j)) {
        return 1;
    } else {
        return 0;
    }
}

function prepare(query) {
    d = [];
    lastData = "";
    for(var i = 0; i < query.length; ++i)
        d.push(0);
}

var query = "devtools/";
console.time("score");
prepare(query);
for(var i = 0; i < lines.length; ++i) {
    score(query, lines[i]);
}
console.timeEnd("score");
