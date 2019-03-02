const fs = require("fs");

const debug = "G:/Code/Just For Fun Foundation/dependency-mapper/test/";

export class Walker {
  public walk(): void {
    const data = this.dirLoop(debug);
    console.log(JSON.stringify(data.structure));
  }

  private dirLoop(path: string, jsonStruct: object = {}): any {
    let fileCount = 0;

    // If no directory structure passed get the base from the path
    const directoryStructure = fs.readdirSync(path);

    // Check for files and add to JSON
    const fileStructure = this.buildFileList(directoryStructure);
    if (fileStructure.length > 0) {
      (jsonStruct as any) = {
        files: fileStructure
      };
      fileCount = fileStructure.length;
    }

    // Loop through given structure to build JSON
    let i = directoryStructure.length;
    while (i--) {
      const entry = directoryStructure[i];

      // If the current entry is not a file
      // TODO: Use dirent.isDirectory?
      if (entry.indexOf(".") === -1) {
        (jsonStruct as any)[entry] = {};

        let nextPath: string;

        // Check if there is already a / at the end
        if (path[path.length - 1] === "/" || path[path.length - 1] === "\\") {
          nextPath = `${path}${entry}`;
        } else {
          nextPath = `${path}/${entry}`;
        }

        // Loop through checking for files and folders
        const subDirData = this.dirLoop(nextPath, (jsonStruct as any)[entry]);

        // If there are no sub directories don't add the structure
        if (
          Object.keys(subDirData.structure).length > 0 ||
          subDirData.fileCount > 0
        ) {
          (jsonStruct as any)[entry] = {};
          (jsonStruct as any)[entry] = subDirData.structure;
        } else {
          // Delete empty structures as we initialise it earlier
          delete (jsonStruct as any)[entry];
        }
      }
    }

    return { structure: jsonStruct, fileCount };
  }

  private buildFileList(directoryStructure: string[]): string[] {
    const files: string[] = [];

    // TODO: Add regex check

    let i = directoryStructure.length;
    while (i--) {
      if (directoryStructure[i].indexOf(".ts") > -1) {
        files.push(directoryStructure[i]);
      }
    }

    return files;
  }
}
