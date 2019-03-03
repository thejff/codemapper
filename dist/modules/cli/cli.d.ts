import { ICLI } from "../../shared/interface/cli.interface";
export declare class CLI implements ICLI {
    private regex;
    private mapper;
    private excludeNodeModules;
    start(): void;
    private inputHandler;
    private inputDirectory;
    private debug;
    private mapCurrentDirectory;
    private setOptions;
    private getInput;
}
