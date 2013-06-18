var upQuery, upData, fileNameIndex;

function testWordStart(data, j) {
    var prevChar = data.charAt(j - 1);
    return isWordStart = prevChar === "_" || prevChar === "-" || prevChar === "/" ||
        (data[j - 1] !== upData[j - 1] && data[j] === upData[j]);
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
            var previousWasAMatch = i === 0 || j === 0 ? false : p[j - 1][i - 1] === 3;
            var m = match(query, data, i, j, previousWasAMatch);
            var max = Math.max(Math.max(a, b), c + m);
            if (max === a) {
                p[j].push(1);
            } else if (max === b) {
                p[j].push(2);
            } else if (max === c + m) {
                p[j].push(3);
            }
            d[j].push(max);
        }
    }
    if (matchIndexes)
        restoreMatchIndexes(p, matchIndexes);
    return d[data.length - 1][query.length - 1];
}

function restoreMatchIndexes(p, out) {
    var j = p.length - 1, i = p[j].length - 1;
    while (i >= 0 && j >= 0) {
        switch (p[j][i]) {
        case 1: --i; break;
        case 2: --j; break
        case 3:
            out.push(j);
            --i; --j;
            break;
        }
    }
    out.reverse();
}

function match(query, data, i, j, previousWasAMatch) {
    if (upQuery[i] !== upData[j])
        return 0;
    var dataChar = data.charAt(j);

    var isWordStart = testWordStart(data, j);
    var isCaptital = data[j] === upData[j];
    var score = 10;
    if (isWordStart)
        score += 2;
    if (isCaptital)
        score += 4;
    if (previousWasAMatch)
        score += 5;
    if (j > fileNameIndex)
        score += 4;
    return score;
}

module.exports = score;
