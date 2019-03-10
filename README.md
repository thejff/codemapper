<img src="https://thejustforfun.foundation/wp-content/uploads/2019/03/Logo.png" alt="TJFFF Logo" width="200"/>

# The Just for Fun Foundation - Code Mapper

The Just for Fun Foundation presents the code mapper. <br/>
This project runs through a Typescript project and maps all internal dependencies, generating a useful graph powered by [Graphviz](https://www.graphviz.org/)

### GitHub

You can find the source code for the project [here](https://github.com/thejff/codemapper)

### Bugs

Please report any issues [here](https://github.com/thejff/codemapper/issues)

### Further documentation

Type docs can be found [here](https://tjff.github.io/codemapper)

## Installation

```
$ npm i -g @justforfun/codemapper
```

## Notes

The code mapper is currently in its early stages of development, as such there are a few restrictions (see the next release and future work sections below for more). <br/>

- Currently the only output available is png allow all Graphviz outputs are planned for the next release. Additionally a custom HTML output will be added.
- There is no direct command that can be run to generate the graph and skip the menu, this is also planned for the next release.
- You can't use custom regex, this is also planned for the next release.
- Only files local to the project that are linked via import code will be linked in the graph, but all .ts files will be shown

## Usage

The code mapper can be run globablly, after installing it run the following command:

```
codemapper
```

Once the app has started you will see a menu with several options:

1. Input a directory to map - This can be relative or a full path
2. Map the current directory - Generate the graph from the location codemapper is run

As well as options that can be entered into any input

- "q" to quit
- "menu" to return to the menu

Once the code has run successfully you will see a folder called "codemapper" inside the directory you selected.<br/>
Inside this directory you will find two files, the generated DOT code and the generated graph (Currently PNG only). You can see an example of the graph below.

## Example output

<img src="https://thejustforfun.foundation/wp-content/uploads/2019/03/codemapper-20190310.png" alt="Example graph output" width="500"/>

## Next release

- Allow for multiple output types
- Direct CLI command input
- Allow optional custom regex

## Future work

- Allow optional mapping of NPM dependencies
- Allow optional mapping of all files in directory
- Check and map require()
- Allow walking of .js files
- Map all imports (currently checks for local imports only)
- Ignore imports/requires that are commented out
- Angular: Check for contstruct declarations
- Add custom HTML output
- Add output verification checks

## Known issues

- Doesn't map monorepos

## The Just For Fun Foundation

[Vist TheJustForFun.Foundation](https://thejustforfun.foundation)

## License

This project is licensed under the [MIT](https://github.com/thejff/codemapper/blob/master/LICENSE) License
