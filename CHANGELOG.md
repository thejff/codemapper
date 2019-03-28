# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Features

- Allow optional mapping of NPM dependencies
- Check and map require()
- Allow walking of .js files
- Map all imports (currently checks for local imports only)
- Ignore imports/requires that are commented out
- Angular: Check for contstruct declarations
- Add custom HTML output
- Add output verification checks

### Bugs

- Issues mapping monorepos
- Some files are missed, notably some x.module.ts
- Sometimes files have too many edges

## [1.1.0] - 2019-03-

### Added

- Changelog
- Allow for multiple output types
- Direct CLI command input
- Allow optional custom regex
- Output handling to allow for verbose output during processing
- Allow optional mapping of all files in directory

### Bugs

- Files in non end directories ignored
