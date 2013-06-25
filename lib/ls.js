var upQuery, upData, fileNameIndex;
var score, sequence;

function testWordStart(data, j)
{
    var prevChar = data.charAt(j - 1);
    return j === 0 || prevChar === "_" || prevChar === "-" || prevChar === "/" ||
        (data[j - 1] !== upData[j - 1] && data[j] === upData[j]);
}

function restoreMatchIndexes(sequence, n, m, out)
{
    var i = n - 1, j = m - 1;
    while (i >= 0 && j >= 0) {
        switch (sequence[i * m + j]) {
        case 0:
            --j;
            break;
        default:
            out.push(j);
            --i;
            --j;
            break;
        }
    }
    out.reverse();
}

function scoreToken(query, data, matchIndexes)
{
    if (!data.length || !query.length)
        return 0;
    var n = query.length;
    var m = data.length;
    if (!score || score.length < n * m) {
        score = new Int32Array(n * m * 2);
        sequence = new Int32Array(n * m * 2);
    }
    upQuery = query.toUpperCase();
    upData = data.toUpperCase();
    fileNameIndex = data.lastIndexOf("/");
    for (var i = 0; i < n; ++i) {
        for (var j = 0; j < m; ++j) {
            var skipCharScore = j === 0 ? 0 : score[i * m + j - 1];
            var prevCharScore = i === 0 || j === 0 ? 0 : score[(i - 1) * m + j - 1];
            var consecutiveMatch = i === 0 || j === 0 ? 0 : sequence[(i - 1) * m + j - 1];
            var pickCharScore = match(query, data, i, j, consecutiveMatch);
            if (pickCharScore && prevCharScore + pickCharScore > skipCharScore) {
                sequence[i * m + j] = consecutiveMatch + 1;
                score[i * m + j] = (prevCharScore + pickCharScore);
            } else {
                sequence[i * m + j] = 0;
                score[i * m + j] = skipCharScore;
            }
        }
    }
    if (matchIndexes)
        restoreMatchIndexes(sequence, n, m, matchIndexes);
    return score[(query.length - 1) * m + data.length - 1];
}

function singleCharScore(query, data, i, j)
{
    var isWordStart = testWordStart(data, j);
    var isFileName = j > fileNameIndex;
    var isPathTokenStart = j === 0 || data[j - 1] === "/";
    var isCapsMatch = query[i] === data[j] && query[i] == upQuery[i];
    var score = 10;
    if (isPathTokenStart)
        score += 4;
    if (isWordStart)
        score += 2;
    if (isCapsMatch)
        score += 6;
    if (isFileName)
        score += 4;
    // promote the case of making the whole match in the filename
    if (j === fileNameIndex + 1 && i === 0)
        score += 5;
    if (isFileName && isWordStart)
        score += 3;
    return score;
}

function sequenceCharScore(query, data, i, j, sequenceLength)
{
    var isFileName = j > fileNameIndex;
    var isPathTokenStart = j === 0 || data[j - 1] === "/";
    var score = 10;
    if (isFileName)
        score += 4;
    if (isPathTokenStart)
        score += 5;
    score += sequenceLength * 4;
    return score;
}

function match(query, data, i, j, consecutiveMatch)
{
    if (upQuery[i] !== upData[j])
        return 0;

    if (!consecutiveMatch)
        return singleCharScore(query, data, i, j);
    else
        return sequenceCharScore(query, data, i, j - consecutiveMatch, consecutiveMatch);
}

module.exports = scoreToken;

