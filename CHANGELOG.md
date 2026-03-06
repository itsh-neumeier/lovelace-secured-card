# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-03-06

### Fixed

- Switches (ha-switch) were clickable before PIN unlock; now disabled until card is unlocked
- Removed unwanted default title "Secured Card" when no title is configured; lock icon shown per entity row instead
- PIN input field in editor lost focus after each keystroke; editor no longer rebuilds on internal config changes

## [1.1.0] - 2026-03-05

### Added

- Multi-entity support: configure multiple entities per card
- Editor: add/remove entities dynamically with individual pickers
- Card header with title and lock icon
- Backward compatibility: `entity` (single) config is auto-migrated to `entities` array

### Changed

- Entities are no longer toggled on PIN unlock. The card only unlocks; entities must be clicked individually after unlock
- Removed PIN attempt limit: unlimited wrong PIN entries allowed
- Card layout: header with lock icon + timeout bar on top, entity rows below
- Entity rows show locked/clickable state visually (opacity change)

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
