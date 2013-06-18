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
            var previousWasAMatch = i === 0 || j === 0 ? false : p[j - 1][i - 1];
            var m = match(query, data, i, j, previousWasAMatch);
            d[j].push(Math.max(Math.max(a, b), c + m));
            p[j].push(c + m === d[j][i]);
        }
    }
    return d[data.length - 1][query.length - 1];
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
