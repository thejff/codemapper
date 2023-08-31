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
- Expand interactive menu options to include all CLI parameters
- Unit tests

### Bugs

- Issues mapping monorepos

## [1.2.1] - 2023-08-31

- Fix: Issue #30 - Crash on symbolic links
    Walker now checks to see if a given path is a symbolic link
    Users can choose to exclude symbolic links

## [1.2.0] - 2020-05-09

### Added

- startup.ts - Run startup checks before continuing execution, in this case check the user has graphviz installed

### Changed

- Logger - Improved timestamp
- Interfaces - Some minor improvements
- Generator - Improved dot calling, now checks if DOT is in the path or if it can find the absolute path
- Mapper - Now handles paths with spaces correctly
- CLI - Added output to display location of output files, some other tweaks
- Updated packages to make GitHub dependency alerts and npm auditing happy

### Bugs

- Generator - Dot errors weren't being displayed as errors, fixed this

## [1.1.0] - 2019-04-19

### Added

- Changelog
- Allow for multiple output types
- Direct CLI command input
- Allow optional custom regex
- Output handling to allow for verbose output during processing
- Allow optional mapping of all files in directory

### Changed

- Root directory now included in graph
- Rewrote parts of walker and generator
- Fixed empty folders being displayed when they shouldn't

### Bugs

- Files in non end directories ignored
- Some files are missed, notably some x.module.ts
- Sometimes files have too many edges

## [1.0.0] - 2019-03-10

### Added

- Initial public release
