"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var walker_1 = require("../walker/walker");
var figlet = require("figlet");
var readline = require("readline");
var CLI = /** @class */ (function () {
    function CLI() {
    }
    CLI.prototype.start = function () {
        console.clear();
        console.log(figlet.textSync("Just For Fun", { font: "doom" }));
        console.log("\n");
        console.log("Welcome to the Just For Fun foundation's Typescript and Angular dependency mapper.\n For more projects check out: https:\\\\thejustforfun.foundation");
        console.log("\n");
        console.log("You can use the following commands to generate a map:");
        console.log("\n    1. Select directory to map\n    ");
        console.log("\n");
        this.getInput("What do you want to do: ")
            .then(function (input) {
            // console.log("You selected: " + input);
            var walker = new walker_1.Walker();
            walker.walk();
        })
            .catch(function (err) {
            console.error(err);
        });
    };
    CLI.prototype.getInput = function (request) {
        return new Promise(function (resolve, reject) {
            var readlineInterface = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            readlineInterface.question(request, function (answer) {
                resolve(answer);
                readlineInterface.close();
            });
        });
    };
    return CLI;
}());
exports.CLI = CLI;
