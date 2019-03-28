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
import { Logger } from "../logger/logger";
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
  private connectionsCodeCache = "";

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
    private logger: Logger,
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
      this.logger.info("Beginning DOT code generation...");

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

  /**
   *
   *
   * @private
   * @returns {Promise<string>}
   * @memberof Generator
   */
  private convertStructToDot(): Promise<string> {
    return new Promise((resolve) => {
      const graphName = this.name
        .replace(new RegExp(`\\.`, "g"), "")
        .replace(new RegExp(`-`, "g"), "");

      this.logger.info(`Setting graph name to ${graphName}`);

      // Initialise the dot code with some global data
      let dotCode = `digraph ${graphName} {
        splines="curved";
        node [nodesep=0.1];
        graph [overlap=scalexy; splines=true];\n`;

      // Generate and add the sub graphs based on the pre generated structure
      dotCode = this.addSubgraphs(dotCode, this.structure);

      this.logger.info(`Adding edges`);
      // Add the connections between nodes
      dotCode += `${this.connectionsCodeCache}`;

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
    this.logger.info(`Current depth: ${depth}`);
    this.logger.info(
      `Parsing structure:\n ${JSON.stringify(structure, null, 4)}`
    );

    // If only one key, it's the file array
    if (keys.length === 1 && keys[0] === "files") {
      let files = (structure as any)[keys[0]];
      dotCode = this.addFiles(files, dotCode);
    } else {
      let files = (structure as any)[keys[0]];
      dotCode = this.addFiles(files, dotCode);

      // Create a new cluster for each entry in the structure

      // TODO: Make this a separate function
      let i = 0;
      while (i < keys.length) {
        if (keys[i] !== "files") {
          this.logger.info("Setting up data for subgraph cluster...");

          this.logger.info(`Adding folder: ${keys[i]}`);

          const charsToReplace = [`\\.`, "-", "_", "@"];
          let cleanKey = keys[i];

          let j = charsToReplace.length;
          while (j--) {
            cleanKey = cleanKey.replace(new RegExp(charsToReplace[j], "g"), "");
          }

          this.logger.info(`Cleaned key to use as cluser name: ${cleanKey}`);

          const clusterName = new RegExp(`cluster${cleanKey}`, "g");

          // Check if cluster name already used
          const existingClusterCount = (dotCode.match(clusterName) || [])
            .length;

          if (existingClusterCount > 0) {
            cleanKey += (existingClusterCount + 1).toString();
            this.logger.info(
              `Key already used, adding incremental value. New key: ${cleanKey}`
            );
          }

          dotCode += `
              subgraph cluster${cleanKey} {
              node [style="filled,rounded", fillcolor=deepskyblue, shape=box];`;

          const subStructure = (structure as any)[keys[i]];

          if (subStructure) {
            this.logger.info("Sub directories found, recursing...");
            dotCode = this.addSubgraphs(dotCode, subStructure, depth++);
          }

          dotCode += `
              label="${keys[i]}";
              style=rounded;
          }`;
          this.logger.info(`Finished adding cluster data for: ${keys[i]}`);
        }
        i++;
      }
    }

    return dotCode;
  }

  private addFiles(files: string[], dotCode: string): string {
    this.logger.info(`Adding files to DOT code...`);

    let f = 0;
    while (f < files.length) {
      if (this.allFiles || files[f].substring(files[f].length - 2) === "ts") {
        this.logger.info(`Adding file: ${files[f]}`);

        const charsToReplace = [`\\.`, "-", "_", "@"];

        let cleanFile = files[f];

        let j = charsToReplace.length;
        while (j--) {
          cleanFile = cleanFile.replace(new RegExp(charsToReplace[j], "g"), "");
        }

        this.logger.info(`Cleaned file name for DOT code: ${cleanFile}`);

        this.getFileLinks(files[f], cleanFile);

        // Check if node name already used
        this.logger.info("Checking if cleaned file name used");
        const existingNodeCount = (
          dotCode.match(new RegExp(cleanFile, "g")) || []
        ).length;

        if (existingNodeCount > 0) {
          cleanFile += (existingNodeCount + 1).toString();
          this.logger.info(
            `File name already used, adding increment: ${cleanFile}`
          );
        }

        // Starting an ID with a number is invalid so wrap in quotes
        // Wrap all to be safe
        cleanFile = `"${cleanFile}"`;

        this.logger.info(`Added ${files[f]}, using ${cleanFile} in DOT code`);

        dotCode += `${cleanFile}[label="${files[f]}"];`;
      }
      f++;
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
    this.logger.info(`Getting imports from ${filename}...`);

    const path = this.findPath(filename);
    const connections: string[] = [];
    let connectionsCode: string = `${nodeName} -> {`;

    if (path && !fs.statSync(path).isDirectory()) {
      this.logger.info(`File found, reading...`);
      const data = fs.readFileSync(path, "utf8");
      this.logger.info(`File read, processing...`);

      let lines = data.split(`\n`);

      lines = this.cleanLines(lines);

      // NOTE: Need to check for comments and ignore any lines after /* or /** until */ found (Maybe not anymore?)
      this.logger.info(`Building connecitons list...`);
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

          this.logger.info(
            `Adding (cleaned) ${importedFileName}ts to connections list.`
          );

          connections.push(importedFileName + "ts");
        }
      }
    }
    this.logger.info(`Connections list built, adding connections to code`);

    // Merge this into the loop above?
    let c = connections.length;
    while (c--) {
      connectionsCode += connections[c];

      if (c !== 0) {
        connectionsCode += ", ";
      }
    }

    this.logger.info(`Colouring edge`);
    connectionsCode += `} [color=${this.colours[this.colourSelector]}];`;
    if (this.colourSelector >= this.colours.length - 1) {
      this.colourSelector = 0;
    } else {
      this.colourSelector++;
    }

    if (!connectionsCode.match(new RegExp("{}"))) {
      this.logger.info(`Adding connection code to cache`);
      this.connectionsCodeCache += `\n${connectionsCode}`;
    }
    return;
  }

  private cleanLines(lines: string[]): string[] {
    const clean: string[] = [];

    let i = 0;
    while (i < lines.length) {
      if (
        lines[i].indexOf('} from ".') > -1 &&
        lines[i].indexOf("//") === -1 &&
        lines[i].indexOf("/*") === -1 &&
        lines[i].indexOf("*/") === -1
      ) {
        this.logger.info(`Line verified clean: ${lines[i]}`);
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
    this.logger.info(`Finding full path of ${filename}`);
    let i = this.pathedFileList.length;
    while (i--) {
      const currentPath = this.pathedFileList[i];

      if (currentPath.indexOf(filename) > -1) {
        this.logger.info(`Full path of ${filename} is ${currentPath}`);
        return currentPath;
      }
    }

    this.logger.info(`Full path of ${filename} was not found.`);
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
      this.logger.info("Beginning DOT processing...");
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
          this.logger.error(err);
        }

        if (stderr) {
          this.logger.error(stderr);
        }

        if (stdout) {
          this.logger.important(stdout);
        }
      });

      dotChild.on("message", (message) => {
        this.logger.important("message");
        this.logger.important(message);
      });

      dotChild.on("close", (code: number) => {
        this.logger.info("DOT processing finished. Exited with code: " + code);
        resolve();
      });

      dotChild.on("error", (err) => {
        this.logger.error("DOT processing errored. Error: \n" + err);
        reject(err);
      });

      dotChild.on("disconnect", (code: number) => {
        this.logger.warning(
          "DOT processing disconnected. Exited with code: " + code
        );
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
      this.logger.info(
        `Writing file: ${name}\n Full path: ${
          this.codemapperDirectory
        }/${name}.dot`
      );
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
    this.logger.info(`Checking directory path ${directory} for / or \\`);

    const lastChar = directory[directory.length - 1];

    if (lastChar === "/" || lastChar === "\\") {
      directory = directory.slice(0, -1);
    }

    directory = `${directory}/codemapper`;

    this.logger.info(`Checking if ${directory} exists...`);
    // Check codemapper dir exists
    const baseExists = fs.existsSync(directory);

    if (!baseExists) {
      this.logger.info(`${directory} does not exist, attempting to create...`);
      try {
        fs.mkdirSync(directory);
        this.logger.info(`${directory} created.`);
      } catch (err) {
        this.logger.error(err);
        this.logger.error("Unable to create codemapper directory! Quitting...");
        exit(1);
      }
    } else {
      this.logger.info(`${directory} exists.`);
    }

    return directory;
  }
}
