import { Walker } from "../walker/walker";
import { IMapper } from "../../shared/interface/mapper.interface";
import { Generator } from "../generator/generator";
import { IWalkerStructure } from "../../shared/interface/walker.interface";

export class Mapper implements IMapper {
  constructor(
    private directory: string,
    private excludeNodeModules: boolean = true,
    private regex?: RegExp
  ) {}

  public startProcessing(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.runWalker()
        .then(
          (data: {
            structure: IWalkerStructure;
            cleanedFileList: string[];
            pathedFileList: string[];
          }) => {
            this.runGenerator(data);
          }
        )
        .then(() => {
          resolve("Mapping complete");
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });
  }

  private runWalker(): Promise<{
    structure: IWalkerStructure;
    cleanedFileList: string[];
    pathedFileList: string[];
  }> {
    return new Promise((resolve, reject) => {
      let walker;

      if (this.regex) {
        walker = new Walker(
          this.directory,
          this.excludeNodeModules,
          this.regex
        );
      } else {
        walker = new Walker(this.directory, this.excludeNodeModules);
      }

      resolve({
        structure: walker.structure,
        cleanedFileList: walker.cleanedFileList,
        pathedFileList: walker.pathedFileList
      });
    });
  }

  private runGenerator(data: {
    structure: IWalkerStructure;
    cleanedFileList: string[];
    pathedFileList: string[];
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const generator = new Generator(
        data.structure,
        "test",
        data.cleanedFileList,
        data.pathedFileList
      );
    });
  }
}
