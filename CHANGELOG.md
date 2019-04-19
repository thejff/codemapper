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
