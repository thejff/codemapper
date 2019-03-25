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
import * as child from "child_process";
const fs = require("fs");

// TODO: Remove subgraphs with no nodes

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
    private pathedFileList: string[],
    private allFiles: boolean,
    private outputType?: string,
    private verbose?: boolean
  ) {
    if (!outputType) {
      this.outputType = "png";
    }
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

  private removeEmptySubgraphs() {
    // Check for subgraphs with not child subgraphs and remove them
    // How to track if there are any? If no deletes on last pass then end?
  }

  /**
   *
   *
   * @private
   * @returns {Promise<string>}
   * @memberof Generator
   */
  private convertStructToDot(): Promise<string> {
    return new Promise((resolve, reject) => {
      const graphName = this.name
        .replace(new RegExp(`\\.`, "g"), "")
        .replace(new RegExp(`-`, "g"), "");

      // Initialise the dot code with some global data
      let dotCode = `digraph ${graphName} {
        splines="curved";
        node [nodesep=0.1];
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

    /* console.log("\n------------- STRUCT\n");
    console.log(keys[0]);
    console.log(structure); */

    // If only one key, it's the file array
    if (keys.length === 1 && keys[0] === "files") {
      // this.addFiles((structure as any)[keys[0]], dotCode);
      let files = (structure as any)[keys[0]];
      this.addFiles(files, dotCode);

      /* let f = 0;
      while (f < files.length) {
        const charsToReplace = [`\\.`, "-", "_", "@"];

        let cleanFile = files[f];

        let j = charsToReplace.length;
        while (j--) {
          cleanFile = cleanFile.replace(new RegExp(charsToReplace[j], "g"), "");
        }

        if (
          this.allFiles ||
          cleanFile.substring(cleanFile.length - 2, cleanFile.length) === "ts"
        ) {
          this.getFileLinks(files[f], cleanFile);

          // Check if node name already used
          const existingNodeCount = (
            dotCode.match(new RegExp(cleanFile, "g")) || []
          ).length;

          if (existingNodeCount > 0) {
            cleanFile += (existingNodeCount + 1).toString();
          }

          // Starting an ID with a number is invalid so wrap in quotes
          // Wrap all to be safe
          cleanFile = `"${cleanFile}"`;

          dotCode += `${cleanFile}[label="${files[f]}"];`;
        }
        f++;
      } */
    } else {
      let files = (structure as any)[keys[0]];
      /* let f = 0;
      while (f < files.length) {
        const charsToReplace = [`\\.`, "-", "_", "@"];

        let cleanFile = files[f];

        let j = charsToReplace.length;
        while (j--) {
          cleanFile = cleanFile.replace(new RegExp(charsToReplace[j], "g"), "");
        }

        if (
          this.allFiles ||
          cleanFile.substring(cleanFile.length - 2, cleanFile.length) === "ts"
        ) {
          this.getFileLinks(files[f], cleanFile);

          // Check if node name already used
          const existingNodeCount = (
            dotCode.match(new RegExp(cleanFile, "g")) || []
          ).length;

          if (existingNodeCount > 0) {
            cleanFile += (existingNodeCount + 1).toString();
          }

          // Starting an ID with a number is invalid so wrap in quotes
          // Wrap all to be safe
          cleanFile = `"${cleanFile}"`;

          dotCode += `${cleanFile}[label="${files[f]}"];`;
        }
        f++;
      } */
      // this.addFiles(files, dotCode);

      let i = 0;

      // Create a new cluster for each entry in the structure
      while (i < keys.length) {
        if (keys[i] !== "files") {
          const charsToReplace = [`\\.`, "-", "_", "@"];
          let cleanKey = keys[i];

          let j = charsToReplace.length;
          while (j--) {
            cleanKey = cleanKey.replace(new RegExp(charsToReplace[j], "g"), "");
          }

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
        i++;
      }
    }

    return dotCode;
  }

  private addFiles(files: string[], dotCode: string): void {
    let f = 0;
    while (f < files.length) {
      const charsToReplace = [`\\.`, "-", "_", "@"];

      let cleanFile = files[f];

      let j = charsToReplace.length;
      while (j--) {
        cleanFile = cleanFile.replace(new RegExp(charsToReplace[j], "g"), "");
      }

      if (
        this.allFiles ||
        cleanFile.substring(cleanFile.length - 2, cleanFile.length) === "ts"
      ) {
        this.getFileLinks(files[f], cleanFile);

        // Check if node name already used
        const existingNodeCount = (
          dotCode.match(new RegExp(cleanFile, "g")) || []
        ).length;

        if (existingNodeCount > 0) {
          cleanFile += (existingNodeCount + 1).toString();
        }

        // Starting an ID with a number is invalid so wrap in quotes
        // Wrap all to be safe
        cleanFile = `"${cleanFile}"`;

        dotCode += `${cleanFile}[label="${files[f]}"];`;
      }
      f++;
    }
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

    if (path && !fs.statSync(path).isDirectory()) {
      const data = fs.readFileSync(path, "utf8");
      let lines = data.split(`;\r\n`);

      lines = this.cleanLines(lines);

      // NOTE: Need to check for comments and ignore any lines after /* or /** until */ found

      /* console.log("\n ----------------- " + filename);
      console.log(lines); */

      let i = lines.length;
      while (i--) {
        /* if (filename === "cli.ts") {
          console.log("\n----------------- PATH");
          console.log(filename);
          console.log(lines[i]);
        } */

        if (
          // lines[i] &&
          lines[i].indexOf("import") > -1 &&
          lines[i].indexOf('from ".') > -1
        ) {
          const importLineSplit = lines[i].match(/(").*(")/g)[0].split("/");
          const importedFileName = importLineSplit[importLineSplit.length - 1]
            .replace(new RegExp('"', "g"), "")
            .replace(new RegExp("-", "g"), "")
            .replace(new RegExp("\\.", "g"), "");

          /* console.log("\n--------------- FILE NAME");
          console.log(importedFileName);
          console.log(importLineSplit); */

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
      this.connectionsCodeHolder += `\n${connectionsCode}`;
    }
    return;
  }

  private cleanLines(lines: string[]): string[] {
    const ignores = ["//", "/*", "*/"];
    const includes = ['} from ".'];

    const clean: string[] = [];

    let i = 0;
    while (i < lines.length) {
      if (
        lines[i].indexOf('} from ".') > -1 &&
        lines[i].indexOf("//") <= -1 &&
        lines[i].indexOf("/*") <= -1 &&
        lines[i].indexOf("*/") <= -1
      ) {
        clean.push(lines[i]);
      }

      i++;
    }

    return clean;
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
      console.log("Beginning DOT processing...");
      let dotCommand = `dot -T${this.outputType} "${this.codemapperDirectory}/${
        this.name
      }.dot" -o "${this.codemapperDirectory}/${this.name}.${
        this.outputType
      }" -Kfdp`;

      if (this.verbose) {
        dotCommand += " -v";
      }

      const dotChild = child.exec(dotCommand, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
        }

        if (stderr) {
          console.log(stderr);
        }

        if (stdout) {
          console.log(stdout);
        }
      });

      dotChild.on("message", (message) => {
        console.log("message");
        console.log(message);
      });

      dotChild.on("close", (code: number) => {
        console.log("DOT processing finished. Exited with code: " + code);
        resolve();
      });

      dotChild.on("error", (err) => {
        console.log("DOT processing errored. Error: \n" + err);
        reject(err);
      });

      dotChild.on("disconnect", (code: number) => {
        console.log("DOT processing disconnected. Exited with code: " + code);
        reject("DOT Process disconnected");
      });
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
