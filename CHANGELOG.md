# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-05

### Added

- Initial release
- PIN-protected custom Lovelace card for Home Assistant
- Numeric keypad dialog with shake animation on wrong PIN
- Support for all switchable entity types: switch, light, fan, cover, lock, script, scene, climate, input_boolean, automation
- Configurable timeout per card (default: 30 seconds)
- Visual countdown progress bar during unlock period
- Automatic re-lock after timeout expiry
- Lock/unlock icon indicator with color transition (red/green)
- Visual config editor with entity picker, PIN field, timeout, and title
- HACS-compatible installation
- German localized state translations
- Shadow DOM encapsulation for style isolation
- MIT License
