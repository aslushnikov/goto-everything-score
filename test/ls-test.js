var Runner = require('../lib/runner.js')
  , fs = require('fs')

var lines = fs.readFileSync("samples/full.txt", "utf-8").split("\n");
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
    gt("dte", "DefaultTextEditor.js");
    gt("dte", "DefaultTextEditor.js");
    gt("frodte", "DefaultTextEditor.js");
    gt("cmte", "CodeMirrorTextEditor.js");
    gt("setscr", "SettingsScreen.js");
});
