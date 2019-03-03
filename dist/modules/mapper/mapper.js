"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var walker_1 = require("../walker/walker");
var generator_1 = require("../generator/generator");
var Mapper = /** @class */ (function () {
    function Mapper(directory, excludeNodeModules, regex) {
        if (excludeNodeModules === void 0) { excludeNodeModules = true; }
        this.directory = directory;
        this.excludeNodeModules = excludeNodeModules;
        this.regex = regex;
    }
    Mapper.prototype.startProcessing = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.runWalker()
                .then(function (data) {
                _this.runGenerator(data);
            })
                .then(function () {
                resolve("Mapping complete");
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    Mapper.prototype.runWalker = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var walker;
            if (_this.regex) {
                walker = new walker_1.Walker(_this.directory, _this.excludeNodeModules, _this.regex);
            }
            else {
                walker = new walker_1.Walker(_this.directory, _this.excludeNodeModules);
            }
            resolve({
                structure: walker.structure,
                cleanedFileList: walker.cleanedFileList,
                pathedFileList: walker.pathedFileList
            });
        });
    };
    Mapper.prototype.runGenerator = function (data) {
        return new Promise(function (resolve, reject) {
            var generator = new generator_1.Generator(data.structure, "test", data.cleanedFileList, data.pathedFileList);
        });
    };
    return Mapper;
}());
exports.Mapper = Mapper;
