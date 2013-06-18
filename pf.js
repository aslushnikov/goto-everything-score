function score2(path, queryToUpperCase) {
    var pathLength = path.length;
    var queryLength = queryToUpperCase.length;
    var totalLength = pathLength * queryLength;
    var dynamics = new Array(totalLength * 2);

    return score(0, 0, false);

    function score(pathIndex, queryIndex, previousWasAMatch, indexes)
    {
        if (queryIndex >= queryLength)
            return 0;
        var key = pathIndex * queryLength + queryIndex + (previousWasAMatch ? queryLength * pathLength : 0);
        if (key in dynamics)
            return dynamics[key];

        var match = doMatch(pathIndex, path, queryToUpperCase[queryIndex], previousWasAMatch);
        pathIndex = match[1];
        if (pathIndex >= path.length) {
            dynamics[key] = -1;
            return -1;
        }

        var useScore = match[0] + score(pathIndex + 1, queryIndex + 1, match[0] > 0);
        var skipScore = score(pathIndex + 1, queryIndex, false);
        var scoreValue =  Math.max(useScore, skipScore);
        dynamics[key] = scoreValue;
        return scoreValue;
    }
}

function doMatch(pathIndex, path, queryChar, previousWasAMatch) {
        var match = -1;
        while (match === -1 && pathIndex < path.length) {
            var previousPathChar = path[pathIndex - 1];
            if ((!previousPathChar || previousPathChar === "/") && path[pathIndex].toUpperCase() === queryChar)
                match = 2;
            else if ((previousPathChar === "_" || previousPathChar === "-") && path[pathIndex].toUpperCase() === queryChar)
                match = 1;
            else if (path[pathIndex] === queryChar)
                match = 1;
            else if (previousWasAMatch && path[pathIndex].toUpperCase() === queryChar)
                match = 1;
            else if (path[pathIndex].toUpperCase() === queryChar)
                match = 0;
            else
                pathIndex++;
            previousWasAMatch = false;
        }
    return [match, pathIndex];
}

module.exports = function(q, pa) { return score2(pa, q); }
