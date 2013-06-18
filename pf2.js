function scoreToken(path, queryToUpperCase, matchIndexes) {
        var pathLength = path.length;
        var queryLength = queryToUpperCase.length;
        var totalLength = pathLength * queryLength;
        var dynamics = new Array(totalLength * 2);
 
        /**
         * @param {number} pathIndex
         * @param {number} queryIndex
         * @param {boolean} previousWasAMatch
         * @param {?Array.<number>} indexes
         */
        function score(pathIndex, queryIndex, previousWasAMatch, indexes)
        {
            var key = pathIndex * queryLength + queryIndex + (previousWasAMatch ? queryLength * pathLength : 0);
            if (key in dynamics)
                return dynamics[key];
            if (queryIndex >= queryLength)
                return 0;
 
            var match = -1;
            while (match === -1 && pathIndex < path.length) {
                var previousPathChar = path[pathIndex - 1];
                if ((!previousPathChar || previousPathChar === "/") && path[pathIndex].toUpperCase() === queryToUpperCase[queryIndex])
                    match = 3;
                else if ((previousPathChar === "_" || previousPathChar === "-") && path[pathIndex].toUpperCase() === queryToUpperCase[queryIndex])
                    match = 2;
                else if (path[pathIndex] === queryToUpperCase[queryIndex])
                    match = 2;
                else if (previousWasAMatch && path[pathIndex].toUpperCase() === queryToUpperCase[queryIndex])
                    match = 5;
                else if (path[pathIndex].toUpperCase() === queryToUpperCase[queryIndex])
                    match = 0;
                else
                    pathIndex++;
                previousWasAMatch = false;
            }
 
            if (pathIndex >= path.length) {
                dynamics[key] = -1;
                return -1;
            }
 
            var useIndexes = matchIndexes ? [] : null;
            var useScore = match + score(pathIndex + 1, queryIndex + 1, match > 0, useIndexes);
 
            var skipIndexes = matchIndexes ? [] : null;
            var skipScore = score(pathIndex + 1, queryIndex, false, skipIndexes);
 
            if (useScore < 0 && skipScore < 0) {
                dynamics[key] = -1;
                return -1;
            }
 
            if (skipScore > useScore) {
                if (matchIndexes) {
                    indexes.length = 0;
                    indexes.push.apply(indexes, skipIndexes);
                }
                dynamics[key] = skipScore;
                return skipScore;
            } else {
                if (matchIndexes) {
                    indexes.length = 0;
                    indexes.push(pathIndex);
                    indexes.push.apply(indexes, useIndexes);
                }
                dynamics[key] = useScore;
                return useScore;
            }
        }
	return score(0, 0, false, matchIndexes);
 }

 module.exports = function(q, p) { return scoreToken(p, q.toUpperCase()); }
