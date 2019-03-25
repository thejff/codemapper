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
import {
  ICLI,
  IInputMap,
  IMapData
} from "../../shared/interface/cli.interface";
import { OutputType } from "../../shared/enum/outputType.enum";
import { CLIParameters } from "../../shared/enum/cli.enum";
const figlet = require("figlet");
const readline = require("readline");
const fs = require("fs");

// TODO: Put strings in separate store for easier modification

/**
 * Handles input from the command line
 *
 * @export
 * @class CLI
 * @implements {ICLI}
 */
export class CLI implements ICLI {
  /**
   * Holds an instance of the mapper class
   *
   * @private
   * @type {(null | IMapper)}
   * @memberof CLI
   */
  private mapper: null | IMapper = null;

  private verbose = false;

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

  private mapData: IMapData = {};

  private args: string[] = [];

  private isCLI = false;

  private allFiles = false;

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

    if (this.args.length === 0) {
      this.menu();
    } else {
      this.isCLI = true;
      this.processCLIArguments()
        .then(() => {
          return this.runMapper();
        })
        .catch((err: unknown) => {
          console.error(err);
        });
    }
  }

  private runMapper(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mapper = new Mapper(
        this.mapData[CLIParameters.INPUT] || process.cwd(),
        this.excludeNodeModules,
        this.mapData[CLIParameters.OUTPUTNAME] || this.outputName,
        this.verbose,
        this.allFiles,
        this.mapData[CLIParameters.REGEX],
        this.mapData[CLIParameters.TYPE] || OutputType.SVG,
        this.mapData[CLIParameters.OUTPUT]
      );

      this.mapper
        .startProcessing()
        .then((result: string) => {
          this.handleEnd(result);
          resolve();
        })
        .catch((err: Error) => {
          this.handleEnd("An error occured during mapping!", err);
          reject();
        });
    });
  }

  private processCLIArguments(): Promise<void> {
    let i = this.args.length;
    while (i--) {
      const currentArg = this.args[i];

      let endIndex;
      currentArg.indexOf("=") > -1
        ? (endIndex = currentArg.indexOf("="))
        : (endIndex = currentArg.length);

      const param = currentArg.substring(0, endIndex);

      const argMap: IInputMap = {
        "-d": CLIParameters.DEFAULT,
        "--default": CLIParameters.DEFAULT,
        "-i": CLIParameters.INPUT,
        "--input": CLIParameters.INPUT,
        "-o": CLIParameters.OUTPUT,
        "--output": CLIParameters.OUTPUT,
        "-oN": CLIParameters.OUTPUTNAME,
        "--outputName": CLIParameters.OUTPUTNAME,
        "-t": CLIParameters.TYPE,
        "--type": CLIParameters.TYPE,
        "-r": CLIParameters.REGEX,
        "--regex": CLIParameters.REGEX,
        "-iN": CLIParameters.INCLUDENODE,
        "--includeNode": CLIParameters.INCLUDENODE,
        "-v": CLIParameters.VERBOSE,
        "--verbose": CLIParameters.VERBOSE,
        "-aF": CLIParameters.ALLFILES,
        "--allFiles": CLIParameters.ALLFILES,
        "-h": CLIParameters.HELP,
        "--help": CLIParameters.HELP
      };

      if (
        Object.keys(argMap).indexOf(param) === -1 ||
        argMap[param] === CLIParameters.HELP
      ) {
        this.showHelp();
        exit(0);
      } else {
        if (argMap[param] === CLIParameters.DEFAULT) {
          return Promise.resolve();
        }

        if (argMap[param] === CLIParameters.VERBOSE) {
          this.verbose = true;
        } else if (argMap[param] === CLIParameters.INCLUDENODE) {
          this.excludeNodeModules = false;
        } else if (argMap[param] === CLIParameters.ALLFILES) {
          this.allFiles = true;
        } else {
          this.mapData[argMap[param]] = currentArg.substring(
            currentArg.indexOf("=") + 1,
            currentArg.length
          );
        }
      }
    }
    return Promise.resolve();
  }

  private showHelp(): void {
    console.log(`
    Welcome to the Just for Fun foundation's Code mapper.

    CLI Options:
      Full    |  Shorthand
      =============================
      --default     -d                 Run codemapper using the default settings
      --input       -i=<Input Path>    The input path of the project to map
      --output      -o=<Output Path>   The output path of the graph data and the name you want to use
      --outName     -oN=<Output name>  The name of the graph file, this should not include the file extension
      --type        -t=<Output Type>   Defaults to png. One of: png, jpeg, psd, svg, pdf, plain (for plain text), json, or dot
      --regex       -r=<Regex>         The regex used to exclude files, this will bypass the default regex.
      --includeNode -iN                Include node_modules in the graph. This can take a very long time.
      --allFiles    -aF                Include all file typs in the graph. 
      --verbose     -v                 Output verbose information whilst processing
      --help        -h                 Display this

    To run the interactive version of the code mapper simply run "codemapper" with no CLI parameters.
    `);
  }

  private menu(): void {
    console.clear();
    console.log(figlet.textSync("Just For Fun", { font: "doom" }));
    console.log("\n");

    console.log(
      "Welcome to the Just For Fun foundation's code mapper.\n For more projects check out: https:\\\\thejustforfun.foundation"
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
        this.mapData[CLIParameters.TYPE] = outputType;
        switch (input) {
          case "1":
            this.inputDirectory();
            break;
          case "2":
            this.mapCurrentDirectory();
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
  private async inputDirectory() {
    await this.getName();
    this.getInput("Please enter the directory to map: ")
      .then((directory: string) => {
        fs.stat(directory, (err: Error, data: any) => {
          if (err) {
            console.log("The path entered is not a directory!");
            this.inputDirectory();
          } else {
            if (data.isDirectory()) {
              this.mapData[CLIParameters.INPUT] = directory;
              this.runMapper();
            } else {
              console.log("The path entered is not a directory!");
              this.inputDirectory();
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
      3. Photoshop (.psd)

      Data Output
      ----------------
      4. SVG (.svg)
      5. PDF (.pdf)
  
      Text/Code output
      ----------------
      6. Plain Text (.plain)
      7. JSON (.json)
      8. DOT (.dot)
      `);
      this.getInput("What output type would you like to use? (blank = png): ")
        .then((input: string) => {
          const inputMap: IInputMap = {
            1: OutputType.PNG,
            2: OutputType.JPEG,
            3: OutputType.PSD,
            4: OutputType.SVG,
            5: OutputType.PDF,
            6: OutputType.PLAIN,
            7: OutputType.JSON,
            8: OutputType.DOT
          };

          if (input.trim() !== "") {
            resolve(inputMap[input]);
          } else {
            this.inputOutputType();
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
   * Handles mapping the current directory
   *
   * @private
   * @memberof CLI
   */
  private async mapCurrentDirectory() {
    await this.getName();
    console.log("This will map from: " + process.cwd());
    this.getInput("Continue? (Y/n): ")
      .then((input: string) => {
        switch (input) {
          case "n":
            this.start();
            break;
          default:
            console.log("Mapping current directory...");
            this.mapData[CLIParameters.INPUT] = process.cwd();
            this.runMapper();
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

    if (this.isCLI) {
      console.log(
        "Process is finished, thank you for using the JFF Foundations code mapper!"
      );
    } else {
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
          this.mapData[CLIParameters.REGEX] = regex;
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
