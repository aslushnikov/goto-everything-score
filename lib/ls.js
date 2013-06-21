var upQuery, upData, fileNameIndex;
var config = {};

function testWordStart(data, j) {
    var prevChar = data.charAt(j - 1);
    return j === 0 || prevChar === "_" || prevChar === "-" || prevChar === "/" ||
        (data[j - 1] !== upData[j - 1] && data[j] === upData[j]);
}

function restoreMatchIndexes(p, out) {
    var i = p.length - 1, j = p[i].length - 1;
    while (i >= 0 && j >= 0) {
        switch (p[i][j]) {
        case 1: --i; break;
        case 2: --j; break;
        default:
            out.push(j);
            --i; --j;
            break;
        }
    }
    out.reverse();
}

function score(query, data, matchIndexes) {
    upQuery = query.toUpperCase();
    upData = data.toUpperCase();
    fileNameIndex = data.lastIndexOf("/");
    if (data.length === 0)
        return 0;
    var d = [];
    var p = [];
    var backTrack = [];
    for(var i = 0; i < query.length; ++i) {
        d.push([]);
        p.push([]);
        backTrack.push([]);
        for(var j = 0; j < data.length; ++j) {
            var b = j === 0 ? 0 : d[i][j - 1];
            var c = i === 0 || j === 0 ? 0 : d[i - 1][j - 1];
            var consequtiveMatch = i === 0 || j === 0 ? 0 : p[i - 1][j - 1];
            var m = match(query, data, i, j, consequtiveMatch);
            var max = Math.max(b, c + m);
            if (max === c + m && m !== 0) {
                backTrack[i].push(3);
                p[i].push(consequtiveMatch + 1);
            } else {
                backTrack[i].push(2);
                p[i].push(0);
            }
            d[i].push(max);
        }
    }
    if (matchIndexes) {
        restoreMatchIndexes(backTrack, matchIndexes);
    }
    return d[query.length - 1][data.length - 1];
}

function logm(d) {
    for(var i = d.length - 1; i >= 0; --i) {
        var s = "";
        for(var j = 0; j < d[i].length; ++j) {
           s += d[i][j] + " ";
        }
        console.log(s);
    }
}

function charScore(query, data, i, j) {
    var isWordStart = testWordStart(data, j);
    var isPathTokenStart = data[j - 1] === "/";
    var isFileName = j > fileNameIndex;
    var isCapsMatch = query[i] === data[j] && query[i] == upQuery[i];
    var score = 1;
    if (isFileName && isWordStart)
        score += 7;
    else if (isWordStart)
        score += 3;
    if (isPathTokenStart)
        score += 2;
    if (isCapsMatch)
        score += 5;
    return score;
}

function singleCharScore(query, data, i, j) {
    var isWordStart = testWordStart(data, j);
    var isFileName = j > fileNameIndex;
    var isCapsMatch = query[i] === data[j] && query[i] == upQuery[i];
    var score = 1;
    if (isWordStart)
        score += 2;
    if (isCapsMatch)
        score += 2;
    if (isFileName)
        score += 2;
    return score;
}

function match(query, data, i, j, consequtiveMatch) {
    if (upQuery[i] !== upData[j])
        return 0;

    if (!consequtiveMatch)
        return singleCharScore(query, data, i, j);

    var headScore = charScore(query, data, i, j - consequtiveMatch);
    return headScore * data.length / (data.length - consequtiveMatch) | 0;
}

module.exports = score;

