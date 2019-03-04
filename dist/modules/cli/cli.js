"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shelljs_1 = require("shelljs");
var mapper_1 = require("../mapper/mapper");
var figlet = require("figlet");
var readline = require("readline");
var fs = require("fs");
var CLI = /** @class */ (function () {
    function CLI() {
        this.regex = null;
        this.mapper = null;
        this.excludeNodeModules = true;
    }
    CLI.prototype.start = function () {
        console.clear();
        console.log(figlet.textSync("Just For Fun", { font: "doom" }));
        console.log("\n");
        console.log("Welcome to the Just For Fun foundation's Typescript and Angular dependency mapper.\n For more projects check out: https:\\\\thejustforfun.foundation");
        console.log("\n");
        console.log("You can use the following commands to generate a map:");
        console.log("\n    1. Input a directory to map\n    2. Map from current directory\n    ");
        console.log("Or use one the following commands:");
        console.log("\n      q: Quit\n      menu: Return here\n    ");
        console.log("\n");
        this.inputHandler();
    };
    CLI.prototype.inputHandler = function () {
        var _this = this;
        this.getInput("What do you want to do: ")
            .then(function (input) {
            switch (input) {
                case "1":
                    _this.inputDirectory();
                    break;
                case "2":
                    _this.mapCurrentDirectory();
                    break;
                case "d":
                    _this.debug();
                    break;
                default:
                    console.log("Please select an option...");
                    _this.inputHandler();
                    break;
            }
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    CLI.prototype.inputDirectory = function () {
        // "G:/Code/Just For Fun Foundation/dependency-mapper/test/"
        var _this = this;
        this.getInput("Please enter the directory to map: ")
            .then(function (directory) {
            fs.stat(directory, function (err, data) {
                if (err) {
                    console.log("The path entered is not a directory!");
                    _this.inputDirectory();
                }
                else {
                    if (data.isDirectory()) {
                        if (_this.regex) {
                            _this.mapper = new mapper_1.Mapper(directory, _this.excludeNodeModules, _this.regex);
                        }
                        else {
                            _this.mapper = new mapper_1.Mapper(directory, _this.excludeNodeModules);
                        }
                        _this.mapper.startProcessing();
                    }
                    else {
                        console.log("The path entered is not a directory!");
                        _this.inputDirectory();
                    }
                }
            });
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    CLI.prototype.debug = function () {
        console.log(__dirname + "/../../../test");
        this.mapper = new mapper_1.Mapper(
        // "G:/Code/Just For Fun Foundation/dependency-mapper/test/",
        __dirname + "/../../../test", this.excludeNodeModules);
        this.mapper.startProcessing();
    };
    CLI.prototype.mapCurrentDirectory = function () {
        console.log("This will map from: " + __dirname);
        this.getInput("Continue? (Y/n): ")
            .then(function (input) {
            switch (input) {
                case "n":
                    break;
                default:
                    console.log("Mapping current directory...");
                    break;
            }
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    CLI.prototype.setOptions = function () {
        var _this = this;
        this.getInput("Do you want to map node_modules? (y/N): ")
            .then(function (input) {
            switch (input) {
            }
            return _this.getInput("Custom regex (blank for default): ");
        })
            .then(function (regex) {
            if (regex !== "" || regex !== undefined || regex !== null) {
                _this.regex = new RegExp(regex);
            }
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    CLI.prototype.getInput = function (request) {
        var _this = this;
        return new Promise(function (resolve) {
            var readlineInterface = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            readlineInterface.question(request, function (answer) {
                readlineInterface.close();
                switch (answer) {
                    case "q":
                        shelljs_1.exit(0);
                        break;
                    case "menu":
                        _this.start();
                        break;
                    default:
                        resolve(answer);
                        break;
                }
            });
        });
    };
    return CLI;
}());
exports.CLI = CLI;
