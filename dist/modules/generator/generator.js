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
        this.connections = [];
        this.tabs = "";
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
            var dotCode = "digraph " + _this.name + " {\n        splines=\"curved\";\n        K=200;\n";
            dotCode = _this.addSubgraphs(dotCode, _this.structure);
            dotCode = _this.addConnections(dotCode);
            dotCode += "}";
            resolve(dotCode);
        });
    };
    Generator.prototype.addSubgraphs = function (dotCode, structure, depth) {
        if (depth === void 0) { depth = 0; }
        var keys = Object.keys(structure);
        var j = depth;
        while (j--) {
            this.tabs += "\t";
        }
        // If only one key, it's the file array
        if (keys.length === 1 && keys[0] === "files") {
            var files = structure[keys[0]];
            var f = files.length;
            while (f--) {
                var cleanFile = files[f]
                    .replace(new RegExp("\\.", "g"), "")
                    .replace(new RegExp("-", "g"), "");
                this.getFileLinks(files[f], cleanFile);
                dotCode += "\n" + this.tabs + cleanFile + "[label=\"" + files[f] + "\"];";
            }
        }
        else {
            var i = keys.length;
            while (i--) {
                if (keys[i] !== "files") {
                    var cleanKey = keys[i].replace(new RegExp("-", "g"), "");
                    var clusterName = new RegExp("cluster" + cleanKey, "g");
                    var existingClusterCount = (dotCode.match(clusterName) || [])
                        .length;
                    if (existingClusterCount > 0) {
                        cleanKey += (existingClusterCount + 1).toString();
                    }
                    dotCode += "\n" + this.tabs + "subgraph cluster" + cleanKey + " {\n" + this.tabs + "\t" + this.tabs + "\tnode [style=\"filled,rounded\", fillcolor=deepskyblue, shape=box];";
                    var subStructure = structure[keys[i]];
                    if (subStructure) {
                        dotCode = this.addSubgraphs(dotCode, subStructure, depth++);
                    }
                    dotCode += "\n\n" + this.tabs + "\tlabel=\"" + keys[i] + "\";\n" + this.tabs + "\tstyle=rounded;\n\n" + this.tabs + "}\n";
                }
            }
        }
        return dotCode;
    };
    Generator.prototype.getFileLinks = function (filename, nodeName) {
        var path = this.findPath(filename);
        var connections = [];
        var connectionsCode = nodeName + " -> {";
        if (path) {
            var data = fs.readFileSync(path, "utf8");
            var lines = data.split("\n");
            // NOTE: Need to check for comments and ignore any lines after /* or /** until */ found
            var i = lines.length;
            while (i--) {
                if (lines[i].indexOf("import") > -1 &&
                    lines[i].indexOf('from ".') > -1) {
                    var importLineSplit = lines[i].match(/(").*(")/g)[0].split("/");
                    var importedFileName = importLineSplit[importLineSplit.length - 1]
                        .replace(new RegExp('"', "g"), "")
                        .replace(new RegExp("-", "g"), "")
                        .replace(new RegExp("\\.", "g"), "");
                    connections.push(importedFileName + "ts");
                }
            }
        }
        var c = connections.length;
        while (c--) {
            connectionsCode += connections[c];
            if (c !== 0) {
                connectionsCode += ", ";
            }
        }
        connectionsCode += "}";
        if (!connectionsCode.match(new RegExp("{}"))) {
            this.connections.push(connectionsCode);
        }
        return;
    };
    Generator.prototype.addConnections = function (dotCode) {
        var i = this.connections.length;
        while (i--) {
            dotCode += "\n" + this.tabs + this.connections[i] + "\n";
        }
        return dotCode;
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
