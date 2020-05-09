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

import { Logger } from "../logger/logger";
import { IStartup } from "../../shared/interface/startup.interface";

/**
 * Startup
 *
 * Perform pre generation tasks
 *
 * @export
 * @class Startup
 */
export class Startup implements IStartup {
  /**
   * Initailise the logger
   *
   * @private
   * @memberof Startup
   */
  private logger = new Logger(true);

  /**
   * Holds the path used to check for windows install, if any found
   *
   * @private
   * @type {string}
   * @memberof Startup
   */
  private winPathChecked: string = "";

  /**
   * Entry point, runs required checks
   *
   * @returns {boolean}
   * @memberof Startup
   */
  public runChecks(): boolean {
    this.logger.info("Performing startup checks");
    this.logger.info("Checking platform and looking for dot executable");
    const platformCheckResult = this.platformCheck();

    if (!platformCheckResult.success) {
      this.logger.error("DOT executable not found.");
      if (platformCheckResult.platform === "windows") {
        this.logger.important(
          "You are running windows, dot was not found in the path"
        );
        if (this.winPathChecked !== "") {
          this.logger.important(
            `The path check also failed, checked in path ${this.winPathChecked}`
          );
        } else {
          this.logger.important(
            `The path check also failed, unable to determine path`
          );
        }
      }
      this.logger.important(
        `You are running a ${platformCheckResult.platform} platform, do you have graphviz installed and in the path?`
      );

      return false;
    }

    if (platformCheckResult.platform === "windows") {
      if (platformCheckResult.path) {
        this.logger.info(
          `You are running windows, dot is not in the path, but the executable was found successfully!`
        );
      } else {
        this.logger.info(`You are running windows, dot is in the path!`);
      }
    } else {
      this.logger.info(
        `You are running ${platformCheckResult.platform}, dot was found in the path!`
      );
    }

    return true;
  }

  /**
   * Check what platform the user is running codemapper on
   *
   * @private
   * @returns {{
   *     platform: string;
   *     success: boolean;
   *     path?: boolean;
   *   }}
   * @memberof Startup
   */
  private platformCheck(): {
    platform: string;
    success: boolean;
    path?: boolean;
  } {
    let platform;
    switch (process.platform) {
      case "win32":
        platform = "windows";
        break;

      case "linux":
        platform = "linux";
        break;

      case "darwin":
        platform = "mac";
        break;

      default:
        platform = "unknown";
        break;
    }

    if (!this.checkDotCommand()) {
      if (platform === "windows") {
        const path = this.findWindowsDir();
        if (path) {
          this.winPathChecked = path;

          if (this.checkDotCommand(path)) {
            return { platform, success: true, path: true };
          }
        }
      }

      return { platform, success: false };
    }

    return { platform, success: true };
  }

  /**
   * Check if the dot command can be found
   * Optionally takes a path to check
   *
   * @private
   * @param {string} [path]
   * @returns {boolean}
   * @memberof Startup
   */
  private checkDotCommand(path?: string): boolean {
    const child = require("child_process");

    try {
      if (!path) {
        child.execFileSync("dot", ["-v"], { stdio: "ignore" });
      } else {
        child.execFileSync(path, ["-v"], { stdio: "ignore" });
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the default windows install location
   * Returns the path if found, otherwise returns void
   *
   * @private
   * @returns {(string | void)}
   * @memberof Startup
   */
  private findWindowsDir(): string | void {
    const fs = require("fs");
    const baseDir = "C:\\Program Files (x86)";
    const programFiles = fs.readdirSync(baseDir);

    for (const folder of programFiles) {
      if (folder.includes("Graphviz")) {
        const path = require("path");
        return path.join("C:", "Program Files (x86)", folder, "bin", "dot.exe");
      }
    }

    return;
  }
}
