import { IMapper } from "../../shared/interface/mapper.interface";
export declare class Mapper implements IMapper {
    private directory;
    private excludeNodeModules;
    private regex?;
    constructor(directory: string, excludeNodeModules?: boolean, regex?: RegExp | undefined);
    startProcessing(): Promise<string>;
    private runWalker;
    private runGenerator;
}
