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

export class Logger {
  constructor(private _verbose: boolean) {}

  set verbose(state: boolean) {
    this._verbose = state;
  }

  public info(message: string, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[32m%s\x1b[0m%s",
        "[",
        `${timestamp} INFO`,
        "]: " + message
      );
    }
  }

  public warning(message: string, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[33m%s\x1b[0m%s",
        "[",
        `${timestamp} WARNING`,
        "]: " + message
      );
    }
  }

  public error(message: string | Error, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[91m%s\x1b[0m%s",
        "[",
        `${timestamp} ERROR`,
        "]: " + message
      );
    }
  }

  public important(message: string, overrideVerbose?: boolean): void {
    if (this._verbose || overrideVerbose) {
      const date = new Date();
      const timestamp = `${date.getFullYear()}${date.getMonth()}${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      console.log(
        "%s\x1b[95m%s\x1b[0m%s",
        "[",
        `${timestamp} IMPORTANT`,
        "]: " + message
      );
    }
  }
}
