var upQuery, upData, fileNameIndex;

function testWordStart(data, j) {
    var prevChar = data.charAt(j - 1);
    return j === 0 || prevChar === "_" || prevChar === "-" || prevChar === "/" ||
        (data[j - 1] !== upData[j - 1] && data[j] === upData[j]);
}

function restoreMatchIndexes(sequence, out) {
    var i = sequence.length - 1, j = sequence[i].length - 1;
    while (i >= 0 && j >= 0) {
        switch (sequence[i][j]) {
        case 0: --j; break;
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
    if (data.length === 0 || query.length === 0)
        return 0;
    var score = [];
    var sequence = [];
    var scoreRow, sequenceRow;
    for(var i = 0; i < query.length; ++i) {
        score.push(scoreRow = []);
        sequence.push(sequenceRow = []);
        for(var j = 0; j < data.length; ++j) {
            var b = j === 0 ? 0 : scoreRow[j - 1];
            var c = i === 0 || j === 0 ? 0 : score[i - 1][j - 1];
            var consequtiveMatch = i === 0 || j === 0 ? 0 : sequence[i - 1][j - 1];
            var m = match(query, data, i, j, consequtiveMatch);
            if (c + m > b && m !== 0) {
                sequenceRow.push(consequtiveMatch + 1);
                scoreRow.push(c + m);
            } else {
                sequenceRow.push(0);
                scoreRow.push(b);
            }
        }
    }
    if (matchIndexes) {
        restoreMatchIndexes(sequence, matchIndexes);
    }
    return score[query.length - 1][data.length - 1];
}

function singleCharScore(query, data, i, j) {
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

function sequenceCharScore(query, data, i, j, sequenceLength) {
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

function match(query, data, i, j, consequtiveMatch) {
    if (upQuery[i] !== upData[j])
        return 0;

    if (!consequtiveMatch)
        return singleCharScore(query, data, i, j);
    else
        return sequenceCharScore(query, data, i, j - consequtiveMatch, consequtiveMatch);

    var headScore = charScore(query, data, i, j - consequtiveMatch);
    return headScore * data.length / (data.length - consequtiveMatch) | 0;
}

module.exports = score;

