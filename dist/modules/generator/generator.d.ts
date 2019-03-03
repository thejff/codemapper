import { IWalkerStructure } from "../../shared/interface/walker.interface";
export declare class Generator {
    private structure;
    private name;
    private cleanedFileList;
    private pathedFileList;
    private cleanNameHolder;
    constructor(structure: IWalkerStructure, name: string, cleanedFileList: string[], pathedFileList: string[]);
    generate(): Promise<string>;
    private convertStructToDot;
    private addSubgraphs;
    private getFileLinks;
    private findPath;
    private addNode;
    private runDot;
    private writeFile;
}
