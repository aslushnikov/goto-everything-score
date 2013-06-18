var colors = require("colors");

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

function Runner(name, scoringFunction) {
    this._name = name;
    this._scoringFunction = scoringFunction;
}

Runner.prototype = {
    render: function(query, match, colors) {
        var indexes = [];
        var score = this._scoringFunction(query, match, indexes);
        var output = ("[" + score + "]").white.bold;
        for(var i = 0; i < match.length; ++i) {
            if (colors && indexes.indexOf(i) >= 0)
                output += match[i].green.bold;
            else
                output += match[i];
        }
        return output;
    },

    run: function(query, lines) {
        var best = -1;
        var bestLine = -1;
        for (var i = 0; i < lines.length; ++i) {
            var s = this._scoringFunction(query, lines[i]);
            if (s > best) {
                best = s;
                bestLine = lines[i];
            }
        }
        return bestLine;
    },

    name: function() {
        return this._name;
    }
}

Runner.filter = function(query, lines) {
    var m = [];
    var regex = filterRegex(query);
    for(var i = 0; i < lines.length; ++i) {
        if (regex.test(lines[i]))
            m.push(lines[i]);
    }
    return m;
}

module.exports = Runner;

