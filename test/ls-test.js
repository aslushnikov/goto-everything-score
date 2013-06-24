var Runner = require('../lib/runner.js')
  , fs = require('fs')
  , testset = require('./testset.js')
  , ls = require('../lib/ls.js')

var lines = fs.readFileSync("samples/blink.txt", "utf-8").split("\n");
var runner = new Runner("lushnikov", ls);

function queryRunner(query) {
    return runner.run(query, Runner.filter(query, lines));
}

function gt(query, expected) {
    it("'" + expected + "' for '" + query + "' query", function() {
        var bestScore = ls(query, queryRunner(query));
        var expectedScore = ls(query, expected);
        bestScore.should.be.equal(expectedScore);
    });
}

describe("algorithm should return", function() {
    for(var i = 0; i < testset.length; ++i) {
        gt(testset[i][0], testset[i][1]);
    }
});
