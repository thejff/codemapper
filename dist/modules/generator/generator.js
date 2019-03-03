"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exec = require("child_process").exec;
var fs = require("fs");
var Generator = /** @class */ (function () {
    function Generator(structure, name, cleanedFileList, pathedFileList) {
        this.structure = structure;
        this.name = name;
        this.cleanedFileList = cleanedFileList;
        this.pathedFileList = pathedFileList;
        this.cleanNameHolder = [];
        this.generate();
    }
    Generator.prototype.generate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.convertStructToDot()
                .then(function (dotCode) {
                return _this.writeFile(dotCode, _this.name);
            })
                .then(function () {
                return _this.runDot();
                resolve();
            })
                .then(function () {
                resolve();
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    Generator.prototype.convertStructToDot = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var dotCode = "digraph " + _this.name + " {\n";
            dotCode = _this.addSubgraphs(dotCode, _this.structure);
            dotCode += "}";
            resolve(dotCode);
        });
    };
    Generator.prototype.addSubgraphs = function (dotCode, structure, depth) {
        if (depth === void 0) { depth = 0; }
        var keys = Object.keys(structure);
        var tabs = "";
        var j = depth;
        while (j--) {
            tabs += "\t";
        }
        // If only one key, it's the file array
        if (keys.length === 1 && keys[0] === "files") {
            var files = structure[keys[0]];
            var f = files.length;
            while (f--) {
                var cleanFile = files[f]
                    .replace(new RegExp(/\./s, "g"), "")
                    .replace(new RegExp(/-/s, "g"), "");
                var links = this.getFileLinks(files[f]);
                dotCode += "\n" + tabs + cleanFile + "[label=\"" + files[f] + "\"];\n" + tabs + links + "\n";
            }
        }
        else {
            var i = keys.length;
            while (i--) {
                if (keys[i] !== "files") {
                    var cleanKey = keys[i].replace(new RegExp("-", "g"), "");
                    dotCode += "\n" + tabs + "subgraph cluster" + cleanKey + " {\n" + tabs + "\t" + tabs + "\tnode [style=\"filled,rounded\", fillcolor=deepskyblue, shape=box];";
                    var subStructure = structure[keys[i]];
                    // console.log(keys[i]);
                    if (subStructure) {
                        dotCode = this.addSubgraphs(dotCode, subStructure, depth++);
                    }
                    dotCode += "\n\n" + tabs + "\tlabel=\"" + keys[i] + "\";\n" + tabs + "\tstyle=rounded;\n\n" + tabs + "}\n";
                }
            }
        }
        return dotCode;
    };
    Generator.prototype.getFileLinks = function (filename) {
        var path = this.findPath(filename);
        if (path) {
            var data = fs.readFileSync(path, "utf8");
            console.log(data);
        }
        return "";
    };
    Generator.prototype.findPath = function (filename) {
        var i = this.pathedFileList.length;
        while (i--) {
            var currentPath = this.pathedFileList[i];
            if (currentPath.indexOf(filename) > -1) {
                return currentPath;
            }
        }
        return;
    };
    Generator.prototype.addNode = function () {
        return "";
    };
    Generator.prototype.runDot = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            exec("dot -Tpng " + _this.name + ".dot -o " + _this.name + ".png -Kfdp", function (err, stdout, stderr) {
                if (err) {
                    reject(err);
                }
                if (stderr) {
                    reject(stderr);
                }
                if (stdout) {
                    console.log(stdout);
                }
                resolve();
            });
        });
    };
    Generator.prototype.writeFile = function (data, name) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(name + ".dot", data, function (err) {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    };
    return Generator;
}());
exports.Generator = Generator;
