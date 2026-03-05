# Secured Card

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-yellow.svg)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](CHANGELOG.md)

> [English Version](README.md)

Eine PIN-geschuetzte Custom Lovelace Card fuer Home Assistant. Schuetzt mehrere Entitaeten mit einem einzigen PIN-Code. Nach dem Entsperren koennen Entitaeten einzeln geschaltet werden.

## Features

- PIN-Schutz fuer mehrere Entitaeten in einer einzigen Card
- Numerisches Keypad im nativen Home Assistant Design
- Unlock-First-Workflow: PIN entsperrt die Card, dann Entitaeten einzeln klicken
- Konfigurierbarer Timeout pro Card (automatische Sperrung nach Ablauf)
- Visueller Countdown-Balken
- Schloss-Icon mit Farbwechsel (rot = gesperrt, gruen = entsperrt)
- Visueller Config-Editor mit dynamischer Entity-Verwaltung
- Rueckwaertskompatibel: `entity` (einzeln) wird automatisch zu `entities` migriert
- Shadow DOM Kapselung (keine Style-Konflikte)
- Keine externen Abhaengigkeiten (reines JavaScript)

## Unterstuetzte Entitaets-Typen

| Domain          | Aktion                  |
|-----------------|-------------------------|
| `switch`        | Umschalten              |
| `light`         | Umschalten              |
| `fan`           | Umschalten              |
| `input_boolean` | Umschalten              |
| `automation`    | Umschalten              |
| `cover`         | Oeffnen / Schliessen    |
| `lock`          | Verriegeln / Entriegeln |
| `script`        | Ausfuehren              |
| `scene`         | Aktivieren              |
| `climate`       | An / Aus                |

## Installation

### HACS (Empfohlen)

1. HACS in Home Assistant oeffnen
2. **Frontend** auswaehlen
3. Drei-Punkte-Menu oben rechts klicken und **Benutzerdefinierte Repositories** waehlen
4. Repository-URL eingeben und Kategorie **Lovelace** waehlen
5. Nach **Secured Card** suchen und installieren
6. Browser-Cache leeren (Hard Refresh: `Strg+Umschalt+R`)

### Manuelle Installation

1. `secured-card.js` aus dem `dist/` Ordner dieses Repositories herunterladen
2. In das Home Assistant Verzeichnis `config/www/` kopieren
3. **Einstellungen** > **Dashboards** > **Ressourcen** aufrufen
4. Ressource hinzufuegen: `/local/secured-card.js` (Typ: JavaScript-Modul)
5. Browser-Cache leeren

## Konfiguration

### Ueber den visuellen Editor

1. Dashboard bearbeiten
2. **Card hinzufuegen** klicken und nach **Secured Card** suchen
3. Entitaeten hinzufuegen, PIN, Timeout und optionalen Titel konfigurieren

### YAML-Konfiguration

```yaml
type: custom:secured-card
entities:
  - switch.garage_door
  - light.garden
  - cover.roller_shutter
pin: "1234"
timeout: 60
title: "Geschuetzte Geraete"
```

Einzelne Entity (rueckwaertskompatibel):

```yaml
type: custom:secured-card
entity: switch.garage_door
pin: "1234"
timeout: 60
```

### Optionen

| Option     | Typ      | Standard     | Beschreibung                                        |
|------------|----------|--------------|-----------------------------------------------------|
| `entities` | string[] | Erforderlich | Liste von Entity IDs                                |
| `entity`   | string   | -            | Einzelne Entity ID (wird zu `entities` migriert)    |
| `pin`      | string   | Erforderlich | PIN-Code (numerisch, mind. 4 Ziffern)               |
| `timeout`  | number   | `30`         | Freischalt-Dauer in Sekunden (Minimum: 5)           |
| `title`    | string   | -            | Optionaler Card-Titel (Standard: "Secured Card")    |

## Nutzungsanleitung

### Schritt-fuer-Schritt

1. **Card zum Dashboard hinzufuegen**
   - Dashboard bearbeiten > Card hinzufuegen > "Secured Card" suchen
   - Oder manuell YAML einfuegen (siehe oben)

2. **Card konfigurieren**
   - Entitaeten hinzufuegen, die geschuetzt werden sollen
   - PIN festlegen (mind. 4 Ziffern)
   - Timeout in Sekunden festlegen
   - Optional einen Titel vergeben

3. **Card nutzen**
   - Auf das Schloss-Icon oder eine Entity-Zeile klicken, um den PIN-Dialog zu oeffnen
   - PIN ueber das Zahlenfeld eingeben und bestaetigen
   - Bei **korrektem PIN**: Card wird entsperrt (keine Entity wird geschaltet!)
   - **Einzelne Entitaeten klicken** um sie zu schalten
   - Bei **falschem PIN**: Fehlermeldung mit Schuettel-Animation, erneute Eingabe moeglich (unbegrenzte Versuche)
   - Waehrend der Freischaltung: Gruenes Schloss-Icon und Countdown-Balken sichtbar
   - Nach Ablauf des Timeouts: Card sperrt sich automatisch wieder

### Ablauf-Diagramm

```
[Card gesperrt] --Klick--> [PIN-Dialog] --richtiger PIN--> [Card entsperrt]
                                |                                 |
                          falscher PIN                   Entity klicken -> schalten
                                |                                 |
                      [Schuetteln + Fehler]               Timeout laeuft ab
                                                                  |
                                                       [Automatische Sperrung]
```

## Sicherheitshinweise

- Der PIN wird in der Lovelace Card-Konfiguration gespeichert (YAML oder UI-Config)
- Dies ist eine **reine Frontend-Schutzschicht**. Sie ist nicht als Sicherheitsbarriere gegen Benutzer mit Admin-Zugang zu Home Assistant gedacht
- Benutzer mit Zugriff auf die Browser-Entwicklertools oder die HA-Konfiguration koennen den PIN einsehen
- Fuer hohe Sicherheitsanforderungen: Diese Card mit den integrierten Benutzerberechtigungen und der Authentifizierung von Home Assistant kombinieren
- Die Card verwendet Shadow DOM zur Isolation ihrer Styles
- Constant-Time PIN-Vergleich verhindert Timing-Angriffe

## Entwicklung

Wenn du die Card anpassen moechtest:

1. `dist/secured-card.js` direkt bearbeiten (kein Build-Schritt erforderlich)
2. Fuer TypeScript-Entwicklung: Node.js installieren, `npm install` ausfuehren, dann `npm run build`

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

## Changelog

### [1.1.0] - 2026-03-05

#### Hinzugefuegt

- Multi-Entity Support: Mehrere Entitaeten pro Card konfigurierbar
- Editor: Entitaeten dynamisch hinzufuegen/entfernen
- Card-Header mit Titel und Schloss-Icon
- Rueckwaertskompatibilitaet: `entity` (einzeln) wird automatisch zu `entities` migriert

#### Geaendert

- Entitaeten werden beim Entsperren NICHT mehr geschaltet. Die Card wird nur entsperrt, Entitaeten muessen einzeln angeklickt werden
- PIN-Fehlversuch-Limit entfernt: Unbegrenzte Versuche moeglich
- Card-Layout: Header mit Schloss-Icon + Timeout-Balken oben, Entity-Zeilen darunter
- Entity-Zeilen zeigen gesperrt/klickbar visuell an (Opacity-Aenderung)

### [1.0.0] - 2026-03-05

#### Hinzugefuegt

- Erstveroeffentlichung
- PIN-geschuetzte Custom Lovelace Card fuer Home Assistant
- Numerisches Keypad mit Schuettel-Animation bei falschem PIN
- Unterstuetzung fuer alle schaltbaren Entitaets-Typen
- Konfigurierbarer Timeout pro Card (Standard: 30 Sekunden)
- Visueller Countdown-Balken
- Visueller Config-Editor
- HACS-kompatible Installation
- MIT-Lizenz

Vollstaendiges Changelog: [CHANGELOG.md](CHANGELOG.md)
