"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var debug = "G:/Code/Just For Fun Foundation/dependency-mapper/test/";
var Walker = /** @class */ (function () {
    function Walker() {
    }
    Walker.prototype.walk = function () {
        var data = this.dirLoop(debug);
        console.log(JSON.stringify(data.structure));
    };
    Walker.prototype.dirLoop = function (path, jsonStruct) {
        if (jsonStruct === void 0) { jsonStruct = {}; }
        var fileCount = 0;
        // If no directory structure passed get the base from the path
        var directoryStructure = fs.readdirSync(path);
        // Check for files and add to JSON
        var fileStructure = this.buildFileList(directoryStructure);
        if (fileStructure.length > 0) {
            jsonStruct = {
                files: fileStructure
            };
            fileCount = fileStructure.length;
        }
        // Loop through given structure to build JSON
        var i = directoryStructure.length;
        while (i--) {
            var entry = directoryStructure[i];
            // If the current entry is not a file
            // TODO: Use dirent.isDirectory?
            if (entry.indexOf(".") === -1) {
                jsonStruct[entry] = {};
                var nextPath = void 0;
                // Check if there is already a / at the end
                if (path[path.length - 1] === "/" || path[path.length - 1] === "\\") {
                    nextPath = "" + path + entry;
                }
                else {
                    nextPath = path + "/" + entry;
                }
                // Loop through checking for files and folders
                var subDirData = this.dirLoop(nextPath, jsonStruct[entry]);
                // If there are no sub directories don't add the structure
                if (Object.keys(subDirData.structure).length > 0 ||
                    subDirData.fileCount > 0) {
                    jsonStruct[entry] = {};
                    jsonStruct[entry] = subDirData.structure;
                }
                else {
                    // Delete empty structures as we initialise it earlier
                    delete jsonStruct[entry];
                }
            }
        }
        return { structure: jsonStruct, fileCount: fileCount };
    };
    Walker.prototype.buildFileList = function (directoryStructure) {
        var files = [];
        // TODO: Add regex check
        var i = directoryStructure.length;
        while (i--) {
            if (directoryStructure[i].indexOf(".ts") > -1) {
                files.push(directoryStructure[i]);
            }
        }
        return files;
    };
    return Walker;
}());
exports.Walker = Walker;
