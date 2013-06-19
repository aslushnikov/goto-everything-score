var Runner = require('../lib/runner.js')
  , fs = require('fs')
  , testset = require('./testset.js')

var lines = fs.readFileSync("samples/blink.txt", "utf-8").split("\n");
var ls = new Runner("lushnikov", require("../lib/ls.js"));

function queryRunner(query) {
    return ls.run(query, Runner.filter(query, lines));
}

function gt(query, expected) {
    it("'" + expected + "' for '" + query + "' query", function() {
        queryRunner(query).should.include(expected);
    });
}

describe("algorithm should return", function() {
    for(var i = 0; i < testset.length; ++i) {
        gt(testset[i][0], testset[i][1]);
    }
});
