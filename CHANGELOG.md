# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2026-05-16

### Changed

- Milchglas-Effekt (Backdrop-Blur) verschiebt sich vom Card-Hintergrund zum PIN-Dialog-Overlay: wenn `pin_backdrop_blur` aktiviert, blurt alles hinter dem Popup beim Öffnen des PIN-Dialogs
- PIN-Dialog wird an `document.body` gehängt (statt Shadow Root) für korrekten Viewport-weiten Blur
- `backdrop_blur` / `backdrop_blur_strength` Config-Felder umbenannt in `pin_backdrop_blur` / `pin_backdrop_blur_strength`

## [1.2.4] - 2026-05-16

### Fixed

- Card height not matching neighboring cards in same grid row: removed `align-self: start !important` so cards stretch to fill row height normally
- Frosted-glass effect (backdrop-blur) invisible when `card_opacity` not set: auto-apply 80% opacity when `backdrop_blur` is enabled without explicit opacity

## [1.2.3] - 2026-05-16

### Added

- Visual customization options in card editor:
  - `locked_color` — custom color for lock icon when card is locked
  - `accent_color` — custom color for unlock icon and timeout bar
  - `card_opacity` — background transparency (0–100 %)
  - `backdrop_blur` — enable frosted-glass (Milchglas) effect
  - `backdrop_blur_strength` — blur strength in px (0–40, default 10)
- CSS custom properties on `ha-card` for all visual options; defaults fall back to HA theme variables

## [1.2.2] - 2026-05-16

### Fixed

- Card occupying 2 grid rows instead of 1 for single-entity configs: `getCardSize()` now returns `Math.max(1, entityIds.length)` instead of `1 + entityIds.length`; `getGridOptions()` now includes `rows` for modern HA grid system

## [1.2.1] - 2026-03-27

### Fixed

- Card height not adapting dynamically in grid layout editor: added `getLayoutOptions()` for modern HA versions

## [1.2.0] - 2026-03-06

### Added

- Per-entity customization: optional `name`, `icon`, and `icon_color` for each entity
- Entities now support both string format (`"switch.light"`) and object format (`{ entity, name?, icon?, icon_color? }`)
- `icon_color` supports HA color names (e.g. `deep-purple`, `light-blue`) and CSS colors (`#hex`, `rgb()`)
- Editor rewritten with `ha-form`: native HA form elements for entity picker, icon picker, and color selector
- Helper functions: `normalizeEntities()`, `resolveColor()`, `getEntityConf()`

### Changed

- Editor uses `ha-form` with schema-based rendering instead of manual `ha-entity-picker` / `ha-textfield` elements
- Entity rows respect custom name, icon, and icon_color during both build and incremental update
- Entity config objects are cleaned of empty optional fields on change

## [1.1.3] - 2026-03-06

### Fixed

- Entity picker invisible in editor: hass must be set on picker during creation for it to render; also set again after DOM insertion for robustness
- Timeout progress bar disappeared after unlock: replaced full card rebuild with DOM querySelectorAll approach that updates all rows without destroying the existing timeout bar
- Unlock now uses DOM queries instead of Map iteration to guarantee ALL entity rows are updated regardless of cached state

## [1.1.2] - 2026-03-06

### Fixed

- Entity picker in editor did not work: value-changed events properly stopped from propagating, counter-based skip mechanism replaces boolean flag for reliable editor state
- Entity-not-found rows now also display per-row lock icons when no title is configured

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
