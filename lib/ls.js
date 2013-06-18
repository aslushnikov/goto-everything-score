var upQuery, upData, fileNameIndex;

function testWordStart(data, j) {
    var prevChar = data.charAt(j - 1);
    return isWordStart = prevChar === "_" || prevChar === "-" || prevChar === "/" ||
        (data[j - 1] !== upData[j - 1] && data[j] === upData[j]);
}

function restoreMatchIndexes(p, out) {
    var j = p.length - 1, i = p[j].length - 1;
    while (i >= 0 && j >= 0) {
        switch (p[j][i]) {
        case -1: --i; break;
        case -2: --j; break;
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
    for(var j = 0; j < data.length; ++j) {
        d.push([]);
        p.push([]);
        for(var i = 0; i < query.length; ++i) {
            var a = i === 0 ? 0 : d[j][i - 1];
            var b = j === 0 ? 0 : d[j - 1][i];
            var c = i === 0 || j === 0 ? 0 : d[j - 1][i - 1];
            var consequtiveMatch = i === 0 || j === 0 ? 0 : Math.max(0, p[j - 1][i - 1]);
            var m = match(query, data, i, j, consequtiveMatch);
            var max = Math.max(Math.max(a, b), c + m);
            if (max === a) {
                p[j].push(-1);
            } else if (max === b) {
                p[j].push(-2);
            } else if (max === c + m) {
                p[j].push(consequtiveMatch + 1);
            }
            d[j].push(max);
        }
    }
    if (matchIndexes)
        restoreMatchIndexes(p, matchIndexes);
    return d[data.length - 1][query.length - 1];
}

function match(query, data, i, j, consequtiveMatch) {
    if (upQuery[i] !== upData[j])
        return 0;
    var isWordStart = testWordStart(data, j);
    var isPathTokenStart = data[j - 1] === "/";
    var isFileName = j > fileNameIndex;

    var score = GENOME_INITIAL;
    if (isFileName)
        score += GENOME_ISFILENAME;
    if (isWordStart)
        score += GENOME_ISWORDSTART;
    if (isPathTokenStart)
        score += GENOME_ISPATHTOKENSTART;
    if (consequtiveMatch) {
        if (testWordStart(data, j - consequtiveMatch) ||
            data[j - consequtiveMatch - 1] === "/")
            score += GENOME_WORDCONTINUATION * (consequtiveMatch + 1);
        score += GENOME_CONTINUATION * (consequtiveMatch + 1);
    }
    return score;
}

module.exports = score;

const GENOME_INITIAL = 10;
const GENOME_ISFILENAME = 3;
const GENOME_ISWORDSTART = 8;
const GENOME_ISPATHTOKENSTART = 2;
const GENOME_WORDCONTINUATION = 2;
const GENOME_CONTINUATION = 2;
