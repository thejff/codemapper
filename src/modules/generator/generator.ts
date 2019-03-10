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

import { IWalkerStructure } from "../../shared/interface/walker.interface";
import { exit } from "shelljs";
import { IGenerator } from "../../shared/interface/generator.interface";

const exec = require("child_process").exec;
const fs = require("fs");

/**
 * The generator class uses the generated file structure in the walker class to
 * generate a .dot file which it passes to the dot software to generate a graph
 *
 * @export
 * @class Generator
 * @implements {IGenerator}
 */
export class Generator implements IGenerator {
  /**
   * Used to assign random colours to groups of lines
   *
   * @private
   * @memberof Generator
   */
  private colours = [
    "red",
    "orange",
    "darkgreen",
    "blue",
    "purple",
    "chocolate2",
    "gold",
    "black",
    "deeppink2",
    "firebrick2",
    "limegreen",
    "yellow",
    "turquoise1"
  ];

  /**
   * Used to pick a colour from the colours array
   *
   * @private
   * @memberof Generator
   */
  private colourSelector = 0;

  /**
   * Holds the connections code until it can be added to the main dot code
   *
   * @private
   * @memberof Generator
   */
  private connectionsCodeHolder = "";

  /**
   * The directory to save the output files to
   *
   * @private
   * @memberof Generator
   */
  private codemapperDirectory: string;

  /**
   * Creates an instance of Generator.
   * @param {IWalkerStructure} structure
   * @param {string} name
   * @param {string[]} pathedFileList
   * @memberof Generator
   */
  constructor(
    private directory: string,
    private structure: IWalkerStructure,
    private name: string,
    private pathedFileList: string[]
  ) {
    this.codemapperDirectory = this.checkDir();
  }

  /**
   * Main entry point
   *
   * @returns {Promise<string>}
   * @memberof Generator
   */
  public generate(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.convertStructToDot()
        .then((dotCode: string) => {
          return this.writeFile(dotCode, this.name);
        })
        .then(() => {
          return this.runDot();
        })
        .then(() => {
          resolve();
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  private convertStructToDot(): Promise<string> {
    return new Promise((resolve, reject) => {
      const graphName = this.name
        .replace(new RegExp(`\\.`, "g"), "")
        .replace(new RegExp(`-`, "g"), "");

      // Initialise the dot code with some global data
      let dotCode = `digraph ${graphName} {
        splines="curved";
        node [nodesep=1000.0];
        graph [overlap=scalexy; splines=true];\n`;

      // Generate and add the sub graphs based on the pre generated structure
      dotCode = this.addSubgraphs(dotCode, this.structure);

      // Add the connections between nodes
      dotCode += `${this.connectionsCodeHolder}`;

      // Close of the code and return it
      dotCode += "}";
      resolve(dotCode);
    });
  }

  /**
   * Add subgraphs to the code
   *
   * @private
   * @param {string} dotCode
   * @param {object} structure
   * @param {number} [depth=0]
   * @returns {string}
   * @memberof Generator
   */
  private addSubgraphs(
    dotCode: string,
    structure: object,
    depth: number = 0
  ): string {
    const keys = Object.keys(structure);

    // If only one key, it's the file array
    if (keys.length === 1 && keys[0] === "files") {
      let files = (structure as any)[keys[0]];

      let f = files.length;
      while (f--) {
        let cleanFile = files[f]
          .replace(new RegExp(`\\.`, "g"), "")
          .replace(new RegExp(`-`, "g"), "");

        this.getFileLinks(files[f], cleanFile);

        // Check if node name already used
        const existingNodeCount = (
          dotCode.match(new RegExp(cleanFile, "g")) || []
        ).length;

        if (existingNodeCount > 0) {
          cleanFile += (existingNodeCount + 1).toString();
        }

        dotCode += `${cleanFile}[label="${files[f]}"];`;
      }
    } else {
      let i = keys.length;

      // Create a new cluster for each entry in the structure
      while (i--) {
        if (keys[i] !== "files") {
          let cleanKey = keys[i].replace(new RegExp("-", "g"), "");

          const clusterName = new RegExp(`cluster${cleanKey}`, "g");

          // Check if cluster name already used
          const existingClusterCount = (dotCode.match(clusterName) || [])
            .length;

          if (existingClusterCount > 0) {
            cleanKey += (existingClusterCount + 1).toString();
          }

          dotCode += `
            subgraph cluster${cleanKey} {
            node [style="filled,rounded", fillcolor=deepskyblue, shape=box];`;

          const subStructure = (structure as any)[keys[i]];

          if (subStructure) {
            dotCode = this.addSubgraphs(dotCode, subStructure, depth++);
          }

          dotCode += `
            label="${keys[i]}";
            style=rounded;
        }`;
        }
      }
    }

    return dotCode;
  }

  // TODO: Check for require
  // TODO: Flag to allow for all imports
  // TODO: Ignore commented imports/require
  // TODO: For angular: check what the constructor is using
  /**
   * Parse a file to find its imports
   *
   * @private
   * @param {string} filename
   * @param {string} nodeName
   * @returns {void}
   * @memberof Generator
   */
  private getFileLinks(filename: string, nodeName: string): void {
    const path = this.findPath(filename);
    const connections: string[] = [];
    let connectionsCode: string = `${nodeName} -> {`;

    if (path) {
      const data = fs.readFileSync(path, "utf8");
      const lines = data.split(`\n`);

      // NOTE: Need to check for comments and ignore any lines after /* or /** until */ found

      let i = lines.length;
      while (i--) {
        if (
          lines[i].indexOf("import") > -1 &&
          lines[i].indexOf('from ".') > -1
        ) {
          const importLineSplit = lines[i].match(/(").*(")/g)[0].split("/");
          const importedFileName = importLineSplit[importLineSplit.length - 1]
            .replace(new RegExp('"', "g"), "")
            .replace(new RegExp("-", "g"), "")
            .replace(new RegExp("\\.", "g"), "");
          connections.push(importedFileName + "ts");
        }
      }
    }

    let c = connections.length;
    while (c--) {
      connectionsCode += connections[c];

      if (c !== 0) {
        connectionsCode += ", ";
      }
    }

    connectionsCode += `} [color=${this.colours[this.colourSelector]}];`;
    if (this.colourSelector >= this.colours.length - 1) {
      this.colourSelector = 0;
    } else {
      this.colourSelector++;
    }

    if (!connectionsCode.match(new RegExp("{}"))) {
      this.connectionsCodeHolder += `${connectionsCode}`;
    }
    return;
  }

  /**
   *
   *
   * @private
   * @param {string} filename
   * @returns {(string | undefined)}
   * @memberof Generator
   */
  private findPath(filename: string): string | undefined {
    let i = this.pathedFileList.length;
    while (i--) {
      const currentPath = this.pathedFileList[i];

      if (currentPath.indexOf(filename) > -1) {
        return currentPath;
      }
    }

    return;
  }

  // TODO: Flag to set output type
  // TODO: Add custom HTML output
  /**
   * Run DOT to generate png
   *
   * @private
   * @returns {Promise<void>}
   * @memberof Generator
   */
  private runDot(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `dot -Tpng "${this.codemapperDirectory}/${this.name}.dot" -o "${
          this.codemapperDirectory
        }/${this.name}.png" -Kfdp`,
        (err: Error, stdout: unknown, stderr: unknown) => {
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
        }
      );
    });
  }

  /**
   * Write the dot code to file
   *
   * @private
   * @param {string} data
   * @param {string} name
   * @returns {Promise<void>}
   * @memberof Generator
   */
  private writeFile(data: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        `${this.codemapperDirectory}/${name}.dot`,
        data,
        (err: Error) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  }

  /**
   * Remove the last / or \ from the directory string if found
   *
   * @private
   * @param {string} [directory]
   * @returns {string}
   * @memberof Generator
   */
  private checkDir(directory?: string): string {
    if (!directory) {
      directory = this.directory;
    }

    const lastChar = directory[directory.length - 1];

    if (lastChar === "/" || lastChar === "\\") {
      directory = directory.slice(0, -1);
    }

    directory = `${directory}/codemapper`;

    // Check codemapper dir exists
    const baseExists = fs.existsSync(directory);

    if (!baseExists) {
      try {
        fs.mkdirSync(directory);
      } catch (err) {
        console.error(err);
        console.log("Unable to create codemapper directory! Quitting...");
        exit(1);
      }
    }

    return directory;
  }
}
