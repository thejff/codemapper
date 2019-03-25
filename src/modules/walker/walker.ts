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
  IWalkerResponse,
  IDirectoryStructure
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
  private _structure: IWalkerStructure = { files: [] };

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

  private regex: RegExp;

  /**
   * Creates an instance of Walker and builds JSON structure.
   * @param {string} [directory=process.cwd()]
   * @memberof Walker
   */
  constructor(
    directory: string = process.cwd(),
    private excludeNodeModules: boolean = true,
    private allFiles: boolean = false,
    private verbose: boolean = false,
    regex?: string
  ) {
    if (regex) {
      this.regex = new RegExp(regex);
    } else {
      this.regex = new RegExp(/.+(?<!\.d)(?<!\.spec)(\.ts)(?!\.map)/g);
    }

    this._structure = this.buildStructure(directory);
    /* console.log("this._structure");
    console.log(JSON.stringify(this._structure)); */
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
    // return {};
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

  private buildStructure(
    path: string,
    jsonStruct?: IWalkerStructure
  ): IWalkerStructure {
    if (!jsonStruct) {
      jsonStruct = {
        files: []
      };
    }

    const directoryStructure: IDirectoryStructure = this.createDirectoryStructure(
      path
    );

    if (directoryStructure.files.length > 0) {
      jsonStruct.files = directoryStructure.files;
    }

    let i = 0;
    while (i < directoryStructure.folders.length) {
      const folder = directoryStructure.folders[i];

      let nextPath: string;

      // Check if there is already a / at the end
      if (path[path.length - 1] === "/" || path[path.length - 1] === "\\") {
        nextPath = `${path}${folder}`;
      } else {
        nextPath = `${path}/${folder}`;
      }

      const folderData: IWalkerStructure = this.buildStructure(
        nextPath,
        (jsonStruct[folder] = { files: [] })
      );

      if (folderData.files.length <= 0 && Object.keys(folderData).length <= 1) {
        /* console.log("Deleting folder: " + folder);
        console.log(jsonStruct);
        console.log(jsonStruct[folder]); */
        delete jsonStruct[folder];
      }

      i++;
    }

    return jsonStruct;
  }

  private createDirectoryStructure(path: string): IDirectoryStructure {
    const directoryData = fs.readdirSync(path);
    const structure: IDirectoryStructure = {
      files: [],
      folders: []
    };

    let i = 0;
    while (i < directoryData.length) {
      const pathCheck = `${path}/${directoryData[i]}`;

      if (fs.lstatSync(pathCheck).isFile()) {
        // Check if file passes parameters and regex
        if (this.acceptableFile(directoryData[i])) {
          structure.files.push(directoryData[i]);
          this.completePathedFileList.push(pathCheck);
        }
      } else {
        if (this.acceptableFolder(directoryData[i])) {
          structure.folders.push(directoryData[i]);
        }
      }

      i++;
    }

    return structure;
  }

  private acceptableFile(file: string): boolean {
    if (this.allFiles) {
      return true;
    } else {
      // NOTE: this.regex.test alternates between true and false when the global flag is used
      // using file specific matching instead
      const match = file.match(this.regex);
      if (match && match.indexOf(file) > -1) {
        return true;
      }
    }

    return false;
  }

  private acceptableFolder(folder: string): boolean {
    const notAcceptable = [".git", "node_modules", "codemapper"];

    // check if node_modules should be included
    if (folder === "node_modules" && !this.excludeNodeModules) {
      return true;
    }

    if (notAcceptable.indexOf(folder) > -1) {
      return false;
    } else {
      return true;
    }
  }
}
