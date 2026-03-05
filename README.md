# Secured Card

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](CHANGELOG.md)

> [Deutsche Version / German Version](README_DE.md)

A PIN-protected custom Lovelace card for Home Assistant. Protects multiple entities with a single PIN code. After unlocking, entities can be toggled individually.

## Features

- PIN protection for multiple entities in a single card
- Numeric keypad in native Home Assistant design
- Unlock-first workflow: PIN unlocks the card, then click entities to toggle
- Configurable timeout per card (auto-locks after expiry)
- Visual countdown progress bar
- Lock/unlock icon indicator with color transition
- Visual config editor with dynamic entity management
- Backward compatible: single `entity` config auto-migrates to `entities`
- Shadow DOM encapsulation (no style conflicts)
- Zero external dependencies (pure JavaScript)

## Supported Entity Types

| Domain          | Action          |
|-----------------|-----------------|
| `switch`        | Toggle          |
| `light`         | Toggle          |
| `fan`           | Toggle          |
| `input_boolean` | Toggle          |
| `automation`    | Toggle          |
| `cover`         | Open / Close    |
| `lock`          | Lock / Unlock   |
| `script`        | Execute         |
| `scene`         | Activate        |
| `climate`       | Toggle On / Off |

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to **Frontend**
3. Click the three-dot menu in the top right corner and select **Custom repositories**
4. Enter the repository URL and select category **Lovelace**
5. Search for **Secured Card** and install it
6. Clear your browser cache (hard refresh: `Ctrl+Shift+R`)

### Manual Installation

1. Download `secured-card.js` from the `dist/` folder of this repository
2. Copy it to your Home Assistant `config/www/` directory
3. Go to **Settings** > **Dashboards** > **Resources**
4. Add resource: `/local/secured-card.js` (Type: JavaScript Module)
5. Clear your browser cache

## Configuration

### Using the Visual Editor

1. Edit your dashboard
2. Click **Add Card** and search for **Secured Card**
3. Add entities, set a PIN, timeout, and optional title

### YAML Configuration

```yaml
type: custom:secured-card
entities:
  - switch.garage_door
  - light.garden
  - cover.roller_shutter
pin: "1234"
timeout: 60
title: "Protected Devices"
```

Single entity (backward compatible):

```yaml
type: custom:secured-card
entity: switch.garage_door
pin: "1234"
timeout: 60
```

### Options

| Option     | Type     | Default  | Description                                       |
|------------|----------|----------|---------------------------------------------------|
| `entities` | string[] | Required | List of entity IDs                                |
| `entity`   | string   | -        | Single entity ID (auto-migrated to `entities`)    |
| `pin`      | string   | Required | PIN code (numeric, min 4 digits)                  |
| `timeout`  | number   | `30`     | Unlock duration in seconds (min: 5)               |
| `title`    | string   | -        | Optional card title (defaults to "Secured Card")  |

## Usage

1. Click the lock icon or any entity row to open the PIN dialog
2. Enter the PIN using the numeric keypad and confirm
3. On correct PIN: the card unlocks (no entity is toggled yet)
4. Click individual entities to toggle them while the card is unlocked
5. While unlocked: green lock icon and countdown progress bar are shown
6. After timeout: the card automatically locks again

## How It Works

```
[Card Locked] --click--> [PIN Dialog] --correct PIN--> [Card Unlocked]
                              |                              |
                         wrong PIN                    click entity -> toggle
                              |                              |
                         [Shake + Error]              timeout expires
                                                             |
                                                      [Auto Re-lock]
```

## Security Notes

- The PIN is stored in the Lovelace card configuration (YAML or UI config)
- This is a **frontend-only** protection layer. It is not intended as a security boundary against users with admin access to Home Assistant
- Users with access to the browser developer tools or the HA configuration can view the PIN
- For high-security scenarios, consider combining this card with Home Assistant's built-in user permissions and authentication
- The card uses Shadow DOM to isolate its styles and prevent external CSS interference
- Constant-time PIN comparison prevents timing attacks

## Development

If you want to modify the card:

1. Edit `dist/secured-card.js` directly (no build step required)
2. For TypeScript development: install Node.js, run `npm install`, then `npm run build`

## License

This project is licensed under the [MIT License](LICENSE).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed version history.
