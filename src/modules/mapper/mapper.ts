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

import { Walker } from "../walker/walker";
import {
  IMapper,
  IWalkedProjectData
} from "../../shared/interface/mapper.interface";
import { Generator } from "../generator/generator";
import { Logger } from "../logger/logger";

/**
 * The mapper class is the main class that handles the core functionality
 *
 * @export
 * @class Mapper
 * @implements {IMapper}
 */
export class Mapper implements IMapper {
  private logger: Logger;

  /**
   * Creates an instance of Mapper.
   * @param {string} directory
   * @param {boolean} [excludeNodeModules=true]
   * @param {string} outputName
   * @param {RegExp} [regex]
   * @memberof Mapper
   */
  constructor(
    private directory: string,
    private excludeNodeModules: boolean = true,
    private outputName: string,
    private verbose: boolean = false,
    private allFiles: boolean = false,
    private regex?: string,
    private _outputType?: string,
    private outputDirectory?: string
  ) {
    this.logger = new Logger(verbose);
  }

  set outputType(type: string) {
    this._outputType = type;
  }
  /**
   * Main entry point
   * Begins processing the projects using the data provided in the constructor
   *
   * @returns {Promise<string>}
   * @memberof Mapper
   */
  public startProcessing(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.runWalker()
        .then((data: IWalkedProjectData) => {
          return this.runGenerator(data);
        })
        .then(() => {
          resolve("Mapping complete");
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
   * @returns {Promise<IWalkedProjectData>}
   * @memberof Mapper
   */
  private runWalker(): Promise<IWalkedProjectData> {
    return new Promise((resolve) => {
      this.logger.info("Initialising file walker...");
      let walker;

      walker = new Walker(
        this.directory,
        this.excludeNodeModules,
        this.allFiles,
        this.logger,
        this.regex
      );

      this.logger.info("Files walked.");
      resolve({
        structure: walker.structure,
        pathedFileList: walker.pathedFileList
      });
    });
  }

  /**
   * Run the DOT code generator against the walked data
   *
   * @private
   * @param {IWalkedProjectData} data
   * @returns {Promise<void>}
   * @memberof Mapper
   */
  private runGenerator(data: IWalkedProjectData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.info("Initialising Graph generator...");
      const generator = new Generator(
        this.directory,
        data.structure,
        this.outputName,
        data.pathedFileList,
        this.allFiles,
        this.logger,
        this._outputType,
        this.verbose
      );

      generator
        .generate()
        .then(() => {
          this.logger.info("Graph generation complete");
          resolve();
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }
}
