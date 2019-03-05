import { IWalkerStructure } from "../../shared/interface/walker.interface";

const exec = require("child_process").exec;
const fs = require("fs");

export class Generator {
  private cleanNameHolder: string[] = [];

  private connections: string[] = [];

  private tabs = "";

  constructor(
    private structure: IWalkerStructure,
    private name: string,
    private cleanedFileList: string[],
    private pathedFileList: string[]
  ) {
    this.generate();
  }

  public generate(): Promise<string> {
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
      let dotCode = `digraph ${this.name} {
        splines="curved";
        K=200;\n`;
      dotCode = this.addSubgraphs(dotCode, this.structure);
      dotCode = this.addConnections(dotCode);
      dotCode += "}";
      resolve(dotCode);
    });
  }

  private addSubgraphs(
    dotCode: string,
    structure: object,
    depth: number = 0
  ): string {
    const keys = Object.keys(structure);

    let j = depth;
    while (j--) {
      this.tabs += "\t";
    }

    // If only one key, it's the file array
    if (keys.length === 1 && keys[0] === "files") {
      let files = (structure as any)[keys[0]];

      let f = files.length;
      while (f--) {
        const cleanFile = files[f]
          .replace(new RegExp(`\\.`, "g"), "")
          .replace(new RegExp(`-`, "g"), "");

        this.getFileLinks(files[f], cleanFile);

        dotCode += `
${this.tabs}${cleanFile}[label="${files[f]}"];`;
      }
    } else {
      let i = keys.length;

      while (i--) {
        if (keys[i] !== "files") {
          let cleanKey = keys[i].replace(new RegExp("-", "g"), "");

          const clusterName = new RegExp(`cluster${cleanKey}`, "g");

          const existingClusterCount = (dotCode.match(clusterName) || [])
            .length;

          if (existingClusterCount > 0) {
            cleanKey += (existingClusterCount + 1).toString();
          }

          dotCode += `
${this.tabs}subgraph cluster${cleanKey} {
${this.tabs}\t${
            this.tabs
          }\tnode [style="filled,rounded", fillcolor=deepskyblue, shape=box];`;

          const subStructure = (structure as any)[keys[i]];

          if (subStructure) {
            dotCode = this.addSubgraphs(dotCode, subStructure, depth++);
          }

          dotCode += `

${this.tabs}\tlabel="${keys[i]}";
${this.tabs}\tstyle=rounded;\n
${this.tabs}}\n`;
        }
      }
    }

    return dotCode;
  }

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

    connectionsCode += "}";

    if (!connectionsCode.match(new RegExp("{}"))) {
      this.connections.push(connectionsCode);
    }
    return;
  }

  private addConnections(dotCode: string): string {
    let i = this.connections.length;

    while (i--) {
      dotCode += `
${this.tabs}${this.connections[i]}
`;
    }

    return dotCode;
  }

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

  private runDot(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `dot -Tpng ${this.name}.dot -o ${this.name}.png -Kfdp`,
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

  private writeFile(data: string, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${name}.dot`, data, (err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
