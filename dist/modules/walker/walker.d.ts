import { IWalkerStructure } from "../../shared/interface/walker.interface";
/**
 * The walker class provides functions for walking the specified directory
 * and provides a JSON structure of sub directories and files found.
 *
 * @export
 * @class Walker
 */
export declare class Walker {
    private excludeNodeModules;
    private customRegex?;
    /**
     * Holds the built JSON structure of the give directory
     *
     * @private
     * @type {IWalkerStructure}
     * @memberof Walker
     */
    private _structure;
    /**
     * Holds a complete list of all file names cleaned.
     * Cleaned meaning any . and - removed
     *
     * @private
     * @type {string[]}
     * @memberof Walker
     */
    private completeCleanedFileList;
    /**
     * Holds a complete list of all file paths
     *
     * @private
     * @type {string[]}
     * @memberof Walker
     */
    private completePathedFileList;
    /**
     * Creates an instance of Walker and builds JSON structure.
     * @param {string} [directory=__dirname]
     * @memberof Walker
     */
    constructor(directory?: string, excludeNodeModules?: boolean, customRegex?: RegExp | undefined);
    /**
     * Returns the built structure
     *
     * @readonly
     * @type {IWalkerStructure}
     * @memberof Walker
     */
    readonly structure: IWalkerStructure;
    /**
     * Returns an array of the cleaned file names
     *
     * @readonly
     * @type {string[]}
     * @memberof Walker
     */
    readonly cleanedFileList: string[];
    /**
     * Returns an array of all file paths
     *
     * @readonly
     * @type {string[]}
     * @memberof Walker
     */
    readonly pathedFileList: string[];
    /**
     * Loop through the give directory to build file structure
     *
     * @private
     * @param {string} path
     * @returns {IWalkerResponse}
     * @memberof Walker
     */
    private dirLoop;
    /**
     * Create and return an array of just files, using a regex lookup to exclude
     * Definition files, specification files and map files
     *
     * @private
     * @param {string[]} directoryStructure
     * @returns {string[]}
     * @memberof Walker
     */
    private buildFileList;
}
