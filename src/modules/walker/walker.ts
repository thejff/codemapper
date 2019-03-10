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

import {
  IWalkerStructure,
  IWalkerResponse
} from "../../shared/interface/walker.interface";

const fs = require("fs");

/**
 * The walker class provides functions for walking the specified directory
 * and provides a JSON structure of sub directories and files found.
 *
 * @export
 * @class Walker
 */
export class Walker {
  /**
   * Holds the built JSON structure of the give directory
   *
   * @private
   * @type {IWalkerStructure}
   * @memberof Walker
   */
  private _structure: IWalkerStructure;

  /**
   * Holds a complete list of all file names cleaned.
   * Cleaned meaning any . and - removed
   *
   * @private
   * @type {string[]}
   * @memberof Walker
   */
  // private completeCleanedFileList: string[] = [];

  /**
   * Holds a complete list of all file paths
   *
   * @private
   * @type {string[]}
   * @memberof Walker
   */
  private completePathedFileList: string[] = [];

  /**
   * Creates an instance of Walker and builds JSON structure.
   * @param {string} [directory=__dirname]
   * @memberof Walker
   */
  constructor(
    directory: string = __dirname,
    private excludeNodeModules: boolean = true,
    private customRegex?: RegExp
  ) {
    this._structure = this.dirLoop(directory).structure;
  }

  /**
   * Returns the built structure
   *
   * @readonly
   * @type {IWalkerStructure}
   * @memberof Walker
   */
  get structure(): IWalkerStructure {
    return this._structure;
  }

  /**
   * Returns an array of the cleaned file names
   *
   * @readonly
   * @type {string[]}
   * @memberof Walker
   */
  /* get cleanedFileList(): string[] {
    return this.completeCleanedFileList;
  } */

  /**
   * Returns an array of all file paths
   *
   * @readonly
   * @type {string[]}
   * @memberof Walker
   */
  get pathedFileList(): string[] {
    return this.completePathedFileList;
  }

  // TODO: Remove any
  /**
   * Loop through the give directory to build file structure
   *
   * @private
   * @param {string} path
   * @returns {IWalkerResponse}
   * @memberof Walker
   */
  private dirLoop(path: string): IWalkerResponse;
  private dirLoop(path: string, jsonStruct: IWalkerStructure): IWalkerResponse;
  private dirLoop(path: string, jsonStruct?: any): IWalkerResponse {
    if (!jsonStruct) {
      jsonStruct = {};
    }

    let fileCount = 0;

    // If no directory structure passed get the base from the path
    const directoryStructure = fs.readdirSync(path);

    // Check for files and add to JSON
    const fileStructure = this.buildFileList(directoryStructure);
    if (fileStructure.length > 0) {
      jsonStruct = {
        files: fileStructure
      };

      let f = fileStructure.length;
      while (f--) {
        this.completePathedFileList.push(`${path}/${fileStructure[f]}`);
      }

      fileCount = fileStructure.length;
    }

    // Loop through given structure to build JSON
    let i = directoryStructure.length;
    while (i--) {
      const entry = directoryStructure[i];

      let nextPath: string;

      // Check if there is already a / at the end
      if (path[path.length - 1] === "/" || path[path.length - 1] === "\\") {
        nextPath = `${path}${entry}`;
      } else {
        nextPath = `${path}/${entry}`;
      }

      const isDir = fs.lstatSync(nextPath).isDirectory();

      // Check nextPath is a directory
      if (
        (isDir && !this.excludeNodeModules) ||
        (isDir && this.excludeNodeModules && entry !== "node_modules")
      ) {
        jsonStruct[entry] = {};

        // Loop through checking for files and folders
        const subDirData = this.dirLoop(nextPath, jsonStruct[entry]);

        // If there are no sub directories don't add the structure
        if (
          Object.keys(subDirData.structure).length > 0 ||
          subDirData.fileCount > 0
        ) {
          jsonStruct[entry] = subDirData.structure;
        } else {
          // Delete empty structures as we initialise it earlier
          delete jsonStruct[entry];
        }
      }
    }

    return { structure: jsonStruct, fileCount };
  }

  /**
   * Create and return an array of just files, using a regex lookup to exclude
   * Definition files, specification files and map files
   *
   * @private
   * @param {string[]} directoryStructure
   * @returns {string[]}
   * @memberof Walker
   */
  private buildFileList(directoryStructure: string[]): string[] {
    const files: string[] = [];

    let regex = /.+(?<!\.d)(?<!\.spec)(\.ts)(?!\.map)/g;

    if (this.customRegex) {
      regex = this.customRegex;
    }

    let i = directoryStructure.length;
    while (i--) {
      if (directoryStructure[i].match(regex) !== null) {
        files.push(directoryStructure[i]);
      }
    }

    return files;
  }
}
