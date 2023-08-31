<img src="https://thejustforfun.foundation/wp-content/uploads/2019/03/Logo.png" alt="TJFFF Logo" width="200"/>

# The Just for Fun Foundation - Code Mapper

The Just for Fun Foundation presents the code mapper. <br/>
This project runs through a Typescript project and maps all internal dependencies, generating a useful graph powered by [Graphviz](https://www.graphviz.org/)

### GitHub

You can find the source code for the project [here](https://github.com/thejff/codemapper)

### Bugs

Please report any issues [here](https://github.com/thejff/codemapper/issues)

### Further documentation

Type docs can be found [here](https://thejff.github.io/codemapper)

## Installation

```
$ npm i -g @justforfun/codemapper
```

You also need to make sure Graphviz is installed, it can be downloaded [here](https://www.graphviz.org/download/)
You may need to manually add the path to the bin folder in your environment variables, on windows for example: `C:\Program Files (x86)\Graphviz2.38\bin` **Note:** This may be different for your system.

Codemapper performs a startup check to see if it can find and execute Graphviz (specifically dot), windows has a "default" install location however linux distributions and mac installation can vary so on these systems GraphViz must be in the path.

## Notes

The code mapper is currently in its early stages of development, as such there are a few restrictions (see the next release and future work sections below for more). <br/>

- [Added in v1.1.0] ~~Currently the only output available is png, allowing all Graphviz outputs are planned for the next release.~~ Additionally a custom HTML output will be added (Not in v1.1.0).
- [Added in v1.1.0] ~~There is no direct command that can be run to generate the graph and skip the menu, this is also planned for the next release.~~
- [Added in v1.1.0] ~~You can't use custom regex, this is also planned for the next release.~~
- Only files local to the project that are linked via import code will be linked in the graph, but all .ts files will be shown and [as of v1.1.0] all files can be shown in the graph.

## Usage

The code mapper can be run globablly, after installing it you can run the following commands:

To run interactive mode use:

```
codemapper
```

See the section "Interactive mode" for more information about its use.

To run codemapper with all default values, detailed below, run the following:

```
codemapper -d
```

-d is short for --default, this will use the following values.<br>

- The graph will be generated using the current directory
- node_modules will be excluded
- The output file name will be codemapper-yyyymmdd.ext where y = year, m = month d = day and .ext is the file extension (by default .dot and .svg)
- Verbose will be false
- Mapping of all files will be false
- The default regex will be used
- The output type png will be used
- The output location will be a codemapper folder in the current directory. If one doesn't exist it will be created.
  See the section "CLI mode" for more information about its use.

### Interactive mode

Once the app has started you will see a menu with several options:

1. Input a directory to map - This can be relative or a full path
2. Map the current directory - Generate the graph from the location codemapper is run

As well as options that can be entered into any input

- "q" to quit
- "menu" to return to the menu

### CLI Mode

In CLI mode there are multiple parameters that can be included in the codemapper command to customise the processing to your liking.

| Parameter         | Shorthand | Description                                                                             |
| ----------------- | --------- | --------------------------------------------------------------------------------------- |
| --default         | -d        | Run codemapper using the default settings                                               |
| --input           | -i        | The input path of the project to map                                                    |
| --output          | -o        | The output path of the graph data and the name you want to use                          |
| --outName         | -oN       | The name of the graph file, this should not include the file extension                  |
| --type            | -t        | Defaults to png. One of: png, jpeg, psd, svg, pdf, plain (for plain text), json, or dot |
| --regex           | -r        | The regex used to exclude files, this will bypass the default regex.                    |
| --includeNode     | -iN       | Include node_modules in the graph. This can take a very long time.                      |
| --excludeSymlinks | -exS      | Exclude any files and folders that are symbolic links
| --allFiles        | -aF       | Include all file typs in the graph.                                                     |
| --verbose         | -v        | Output verbose information whilst processing                                            |
| --help            | -h        | Display the help menu                                                                   |

### Output Types

| Type  | Output | Description              |
| ----- | ------ | ------------------------ |
| png   | .png   | PNG Image                |
| jpeg  | .jpeg  | JPEG Image               |
| psd   | .psd   | Photoshop Image          |
| svg   | .svg   | XML Vector Graphic Image |
| pdf   | .pdf   | PDF File                 |
| plain | .txt   | Plain text               |
| json  | .json  | JSON file                |
| dot   | .dot   | DOT Code                 |

### After execution

Once the code has run successfully you will see a folder called "codemapper" inside the directory you selected.<br/>
Inside this directory you will find two files, the generated DOT code and the generated graph (Currently PNG only). You can see an example of the graph below.

## Example output

<img src="https://thejustforfun.foundation/wp-content/uploads/2019/03/codemapper-20190310.png" alt="Example graph output" width="500"/>

## Future Milestones

See [CHANGELOG](CHANGELOG.md) for latest and future changes and bugs

- Custom HTML Output

## The Just For Fun Foundation

[Vist TheJustForFun.Foundation](https://thejustforfun.foundation)

## License

This project is licensed under the [MIT](https://github.com/thejff/codemapper/blob/master/LICENSE) License
