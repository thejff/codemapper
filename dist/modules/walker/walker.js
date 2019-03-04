"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
/**
 * The walker class provides functions for walking the specified directory
 * and provides a JSON structure of sub directories and files found.
 *
 * @export
 * @class Walker
 */
var Walker = /** @class */ (function () {
    /**
     * Creates an instance of Walker and builds JSON structure.
     * @param {string} [directory=__dirname]
     * @memberof Walker
     */
    function Walker(directory, excludeNodeModules, customRegex) {
        if (directory === void 0) { directory = __dirname; }
        if (excludeNodeModules === void 0) { excludeNodeModules = true; }
        this.excludeNodeModules = excludeNodeModules;
        this.customRegex = customRegex;
        /**
         * Holds a complete list of all file names cleaned.
         * Cleaned meaning any . and - removed
         *
         * @private
         * @type {string[]}
         * @memberof Walker
         */
        this.completeCleanedFileList = [];
        /**
         * Holds a complete list of all file paths
         *
         * @private
         * @type {string[]}
         * @memberof Walker
         */
        this.completePathedFileList = [];
        this._structure = this.dirLoop(directory).structure;
    }
    Object.defineProperty(Walker.prototype, "structure", {
        /**
         * Returns the built structure
         *
         * @readonly
         * @type {IWalkerStructure}
         * @memberof Walker
         */
        get: function () {
            return this._structure;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Walker.prototype, "cleanedFileList", {
        /**
         * Returns an array of the cleaned file names
         *
         * @readonly
         * @type {string[]}
         * @memberof Walker
         */
        get: function () {
            return this.completeCleanedFileList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Walker.prototype, "pathedFileList", {
        /**
         * Returns an array of all file paths
         *
         * @readonly
         * @type {string[]}
         * @memberof Walker
         */
        get: function () {
            return this.completePathedFileList;
        },
        enumerable: true,
        configurable: true
    });
    Walker.prototype.dirLoop = function (path, jsonStruct) {
        if (!jsonStruct) {
            jsonStruct = {};
        }
        var fileCount = 0;
        // If no directory structure passed get the base from the path
        var directoryStructure = fs.readdirSync(path);
        // Check for files and add to JSON
        var fileStructure = this.buildFileList(directoryStructure);
        if (fileStructure.length > 0) {
            jsonStruct = {
                files: fileStructure
            };
            var f = fileStructure.length;
            while (f--) {
                this.completeCleanedFileList.push(fileStructure[f]
                    .replace(new RegExp("\\.", "g"), "")
                    .replace(new RegExp("-", "g"), ""));
                this.completePathedFileList.push(path + "/" + fileStructure[f]);
            }
            fileCount = fileStructure.length;
        }
        // Loop through given structure to build JSON
        var i = directoryStructure.length;
        while (i--) {
            var entry = directoryStructure[i];
            var nextPath = void 0;
            // Check if there is already a / at the end
            if (path[path.length - 1] === "/" || path[path.length - 1] === "\\") {
                nextPath = "" + path + entry;
            }
            else {
                nextPath = path + "/" + entry;
            }
            var isDir = fs.lstatSync(nextPath).isDirectory();
            // Check nextPath is a directory
            if ((isDir && !this.excludeNodeModules) ||
                (isDir && this.excludeNodeModules && entry !== "node_modules")) {
                jsonStruct[entry] = {};
                // Loop through checking for files and folders
                var subDirData = this.dirLoop(nextPath, jsonStruct[entry]);
                // If there are no sub directories don't add the structure
                if (Object.keys(subDirData.structure).length > 0 ||
                    subDirData.fileCount > 0) {
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
    /**
     * Create and return an array of just files, using a regex lookup to exclude
     * Definition files, specification files and map files
     *
     * @private
     * @param {string[]} directoryStructure
     * @returns {string[]}
     * @memberof Walker
     */
    Walker.prototype.buildFileList = function (directoryStructure) {
        var files = [];
        var regex = /.+(?<!\.d)(?<!\.spec)(\.ts)(?!\.map)/g;
        if (this.customRegex) {
            regex = this.customRegex;
        }
        var i = directoryStructure.length;
        while (i--) {
            if (directoryStructure[i].match(regex) !== null) {
                files.push(directoryStructure[i]);
            }
        }
        return files;
    };
    return Walker;
}());
exports.Walker = Walker;
