import { IWalkerStructure } from "../../shared/interface/walker.interface";

const exec = require("child_process").exec;
const fs = require("fs");

export class Generator {
  private cleanNameHolder: string[] = [];

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
          resolve();
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
      let dotCode = `digraph ${this.name} {\n`;
      dotCode = this.addSubgraphs(dotCode, this.structure);
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

    let tabs = "";
    let j = depth;
    while (j--) {
      tabs += "\t";
    }

    // If only one key, it's the file array
    if (keys.length === 1 && keys[0] === "files") {
      let files = (structure as any)[keys[0]];

      let f = files.length;
      while (f--) {
        const cleanFile = files[f]
          .replace(new RegExp(/\./s, "g"), "")
          .replace(new RegExp(/-/s, "g"), "");

        const links = this.getFileLinks(files[f]);

        dotCode += `
${tabs}${cleanFile}[label="${files[f]}"];
${tabs}${links}\n`;
      }
    } else {
      let i = keys.length;

      while (i--) {
        if (keys[i] !== "files") {
          const cleanKey = keys[i].replace(new RegExp("-", "g"), "");

          dotCode += `
${tabs}subgraph cluster${cleanKey} {
${tabs}\t${tabs}\tnode [style="filled,rounded", fillcolor=deepskyblue, shape=box];`;

          const subStructure = (structure as any)[keys[i]];

          // console.log(keys[i]);

          if (subStructure) {
            dotCode = this.addSubgraphs(dotCode, subStructure, depth++);
          }

          dotCode += `

${tabs}\tlabel="${keys[i]}";
${tabs}\tstyle=rounded;\n
${tabs}}\n`;
        }
      }
    }

    return dotCode;
  }

  private getFileLinks(filename: string): string {
    const path = this.findPath(filename);

    if (path) {
      const data = fs.readFileSync(path, "utf8");
      console.log(data);
    }

    return "";
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

  private addNode(): string {
    return "";
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
