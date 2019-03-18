/*
 * MIT License (MIT)
 * Copyright (c) 2019 The Just for Fun Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { exit } from "shelljs";
import { Mapper } from "../mapper/mapper";
import { IMapper } from "../../shared/interface/mapper.interface";
import { ICLI } from "../../shared/interface/cli.interface";
const figlet = require("figlet");
const readline = require("readline");
const fs = require("fs");

/**
 * Handles input from the command line
 *
 * @export
 * @class CLI
 * @implements {ICLI}
 */
export class CLI implements ICLI {
  /**
   * Holds custom regex (NOT YET IMPLEMENTED)
   *
   * @private
   * @type {(null | RegExp)}
   * @memberof CLI
   */
  private regex: null | RegExp = null;

  /**
   * Holds an instance of the mapper class
   *
   * @private
   * @type {(null | IMapper)}
   * @memberof CLI
   */
  private mapper: null | IMapper = null;

  /**
   * Flag to exclude node modules
   *
   * @private
   * @memberof CLI
   */
  private excludeNodeModules = true;

  /**
   * Holds the output name
   *
   * @private
   * @type {string}
   * @memberof CLI
   */
  private outputName: string = "";

  private args: string[] = [];

  private isCLI = false;

  private setDefaultOutputName(): void {
    const date = new Date(Date.now());
    let month = this.fixDate((date.getMonth() + 1).toString());
    let dayOfMonth = this.fixDate(date.getDate().toString());

    this.outputName = `codemapper-${date.getFullYear()}${month}${dayOfMonth}`;
  }

  /**
   * Used for generating the default output name
   *
   * @private
   * @param {string} toFix
   * @returns {string}
   * @memberof CLI
   */
  private fixDate(toFix: string): string {
    if (toFix.length === 1) {
      toFix = "0" + toFix;
    }

    return toFix;
  }

  /**
   * Main entry point, shows welcome message and menu
   *
   * @memberof CLI
   */
  public start(): void {
    this.args = process.argv.slice(2);
    this.setDefaultOutputName();

    /*
    --help displays help
    -o = Output path/name; If not provided use current dir
    -t = Output type; If not provided use PNG
    -r = regex; If not provided use default
    */

    if (this.args.length === 0) {
      this.menu();
    } else {
      this.isCLI = true;
      this.processCLIArguments();
    }
  }

  private processCLIArguments(): void {
    let i = this.args.length;
    while (i--) {
      switch (this.args[i].substr(0, 2)) {
        case "--":
          if (this.args[i].substr(2, 6) === "help") {
            this.showHelp();
          }
          break;
      }
    }
  }

  private menu(): void {
    console.clear();
    console.log(figlet.textSync("Just For Fun", { font: "doom" }));
    console.log("\n");

    console.log(
      "Welcome to the Just For Fun foundation's Typescript and Angular dependency mapper.\n For more projects check out: https:\\\\thejustforfun.foundation"
    );
    console.log("\n");
    console.log("You can use the following commands to generate a map:");
    console.log(`
    1. Input a directory to map
    2. Map from current directory
    `);
    console.log("Or use one the following commands at any time:");
    console.log(`
      q: Quit
      menu: Return here
    `);

    console.log("\n");
    this.inputHandler();
  }

  /**
   * Handles main menu input
   *
   * @private
   * @memberof CLI
   */
  private inputHandler(): void {
    let input: string;

    this.getInput("What do you want to do: ")
      .then((_input: string) => {
        input = _input;

        return this.inputOutputType();
      })
      .then((outputType: string) => {
        switch (input) {
          case "1":
            this.inputDirectory(outputType);
            break;
          case "2":
            this.mapCurrentDirectory(outputType);
            break;
          /* Debug input for quickly running everything
              case "d":
                this.debug();
                break; */
          default:
            console.log("Please select an option...");
            this.inputHandler();
            break;
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  /**
   * Handles getting the directory from the user
   *
   * @private
   * @memberof CLI
   */
  private async inputDirectory(outputType: string) {
    await this.getName();
    this.getInput("Please enter the directory to map: ")
      .then((directory: string) => {
        fs.stat(directory, (err: Error, data: any) => {
          if (err) {
            console.log("The path entered is not a directory!");
            this.inputDirectory(outputType);
          } else {
            if (data.isDirectory()) {
              if (this.regex) {
                this.mapper = new Mapper(
                  directory,
                  this.excludeNodeModules,
                  this.outputName,
                  this.regex,
                  outputType
                );
              } else {
                this.mapper = new Mapper(
                  directory,
                  this.excludeNodeModules,
                  this.outputName,
                  undefined,
                  outputType
                );
              }

              this.mapper.startProcessing();
            } else {
              console.log("The path entered is not a directory!");
              this.inputDirectory(outputType);
            }
          }
        });
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  private inputOutputType(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`
      Image output
      ----------------
      1. PNG (.png)
      2. JPEG (.jpeg)
      3. Photoshop (PSD)
      4. SVG (.svg)
      5. PDF (.pdf)
  
      Non image output
      ----------------
      6. Plain Text (.plain)
      7. JSON (.json)
      8. DOT (.dot)
      `);
      this.getInput("What output type would you like to use? (blank = png): ")
        .then((input: string) => {
          switch (input.trim()) {
            case "1":
              resolve("png");
              break;

            case "2":
              resolve("jpeg");
              break;

            case "3":
              resolve("psd");
              break;

            case "4":
              resolve("svg");
              break;

            case "5":
              resolve("pdf");
              break;

            case "6":
              resolve("plain");
              break;

            case "7":
              resolve("json");
              break;

            case "8":
              resolve("dot");
              break;

            case "":
              resolve("png");
              break;
            default:
              this.inputOutputType();
              break;
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  /**
   * Get the user to enter a name for the output or use the default
   *
   * @private
   * @returns {Promise<void>}
   * @memberof CLI
   */
  private getName(): Promise<void> {
    return new Promise(async (resolve) => {
      const tempNameHolder = await this.getInput(
        `Please enter an output name (default=${this.outputName}): `
      );

      if (tempNameHolder.trim() === "") {
        // Use default
        resolve();
      } else {
        this.outputName = tempNameHolder;
        resolve();
      }
    });
  }

  /**
   * Debug function
   *
   * @private
   * @memberof CLI
   */
  private debug(): void {
    console.log(`${__dirname}/../../../test`);

    this.mapper = new Mapper(
      `${__dirname}/../../../test`,
      this.excludeNodeModules,
      "test"
    );

    this.mapper.startProcessing();
  }

  /**
   * Handles mapping the current directory
   *
   * @private
   * @memberof CLI
   */
  private async mapCurrentDirectory(outputType: string) {
    await this.getName();
    console.log("This will map from: " + process.cwd());
    this.getInput("Continue? (Y/n): ")
      .then((input: string) => {
        switch (input) {
          case "n":
            this.start();
            break;
          default:
            const directory = process.cwd();
            console.log("Mapping current directory...");
            if (this.regex) {
              this.mapper = new Mapper(
                directory,
                this.excludeNodeModules,
                this.outputName,
                this.regex,
                outputType
              );
            } else {
              this.mapper = new Mapper(
                directory,
                this.excludeNodeModules,
                this.outputName,
                undefined,
                outputType
              );
            }

            this.mapper
              .startProcessing()
              .then((result: string) => {
                this.handleEnd(result);
              })
              .catch((err: Error) => {
                this.handleEnd("An error occured during mapping!", err);
              });
            break;
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  /**
   * Handle reaching the end
   *
   * @private
   * @param {string} output
   * @param {Error} [error]
   * @memberof CLI
   */
  private handleEnd(output: string, error?: Error): void {
    if (error) {
      console.error(error);
    }
    console.log(output);

    this.getInput(
      "Process is finished, thank you for using the JFF Foundations code mapper!\nPress return to continue or q to quit... "
    )
      .then(() => {
        this.start();
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  /**
   * WIP: Handles setting options for the generation
   *
   * @private
   * @memberof CLI
   */
  private setOptions(): void {
    this.getInput("Do you want to map node_modules? (y/N): ")
      .then((input: string) => {
        switch (input) {
        }

        return this.getInput("Custom regex (blank for default): ");
      })
      .then((regex: string) => {
        if (regex !== "" || regex !== undefined || regex !== null) {
          this.regex = new RegExp(regex);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  /**
   * General use input handler
   *
   * @private
   * @param {string} request
   * @returns {Promise<string>}
   * @memberof CLI
   */
  private getInput(request: string): Promise<string> {
    return new Promise((resolve) => {
      const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readlineInterface.question(request, (answer: string) => {
        readlineInterface.close();
        switch (answer) {
          case "q":
            exit(0);
            break;
          case "menu":
            this.start();
            break;
          default:
            resolve(answer);
            break;
        }
      });
    });
  }
}
