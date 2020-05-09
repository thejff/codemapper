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

import { ILogger } from "../../shared/interface/logger.interface";

/**
 * Internal logger
 *
 * Logs information with a prefix that includes the date, time and log type
 *
 * @export
 * @class Logger
 * @implements {ILogger}
 */
export class Logger implements ILogger {
  /**
   * Holds a prettified date for the timestamp
   *
   * @private
   * @type {string}
   * @memberof Logger
   */
  private currentDate: string;

  /**
   * Creates an instance of Logger.
   * @param {boolean} _verbose
   * @memberof Logger
   */
  constructor(private _verbose: boolean) {
    const date = new Date();

    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();

    if (month.length === 1) {
      month = "0" + month;
    }

    if (day.length === 1) {
      day = "0" + day;
    }

    this.currentDate = `${date.getFullYear()}.${month}.${day}`;
  }

  /**
   * Set the verbosity
   *
   * @memberof Logger
   */
  set verbose(state: boolean) {
    this._verbose = state;
  }

  /**
   * Prints out an information message using green prefix information
   *
   * @param {string} message
   * @param {boolean} [overrideVerbose]
   * @memberof Logger
   */
  public info(message: string, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${
        this.currentDate
      } ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[32m%s\x1b[0m%s",
        "[",
        `${timestamp} INFO`,
        "]: " + message
      );
    }
  }

  /**
   * Prints out an information message using yellow prefix information
   *
   * @param {string} message
   * @param {boolean} [overrideVerbose]
   * @memberof Logger
   */
  public warning(message: string, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${
        this.currentDate
      } ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[93m%s\x1b[0m%s",
        "[",
        `${timestamp} WARNING`,
        "]: " + message
      );
    }
  }

  /**
   * Prints out an error message using red prefix information
   *
   * @param {(string | Error)} message
   * @param {boolean} [overrideVerbose]
   * @memberof Logger
   */
  public error(message: string | Error, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${
        this.currentDate
      } ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[91m%s\x1b[0m%s",
        "[",
        `${timestamp} ERROR`,
        "]: " + message
      );
    }
  }

  /**
   * Prints out an important message using purple prefix information
   *
   * @param {string} message
   * @param {boolean} [overrideVerbose]
   * @memberof Logger
   */
  public important(message: string, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${
        this.currentDate
      } ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[95m%s\x1b[0m%s",
        "[",
        `${timestamp} IMPORTANT`,
        "]: " + message
      );
    }
  }
}
