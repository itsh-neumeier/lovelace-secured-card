# Secured Card

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-yellow.svg)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)

> [English Version](README.md)

Eine PIN-geschuetzte Custom Lovelace Card fuer Home Assistant. Schuetzt Entitaeten mit einem PIN-Code, der eingegeben werden muss, bevor eine Aktion ausgefuehrt werden kann.

## Features

- PIN-Schutz fuer beliebige schaltbare Entitaeten
- Numerisches Keypad im nativen Home Assistant Design
- Konfigurierbarer Timeout pro Card (automatische Sperrung nach Ablauf)
- Visueller Countdown-Balken
- Schloss-Icon mit Farbwechsel (rot = gesperrt, gruen = entsperrt)
- Visueller Config-Editor (kein YAML notwendig)
- Shadow DOM Kapselung (keine Style-Konflikte)
- Keine externen Abhaengigkeiten (reines JavaScript)

## Unterstuetzte Entitaets-Typen

| Domain          | Aktion                |
|-----------------|-----------------------|
| `switch`        | Umschalten            |
| `light`         | Umschalten            |
| `fan`           | Umschalten            |
| `input_boolean` | Umschalten            |
| `automation`    | Umschalten            |
| `cover`         | Oeffnen / Schliessen  |
| `lock`          | Verriegeln / Entriegeln |
| `script`        | Ausfuehren            |
| `scene`         | Aktivieren            |
| `climate`       | An / Aus              |

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
3. Entity, PIN, Timeout und optionalen Titel konfigurieren

### YAML-Konfiguration

```yaml
type: custom:secured-card
entity: switch.garage_door
pin: "1234"
timeout: 60
title: "Garagentor"
```

### Optionen

| Option    | Typ    | Standard     | Beschreibung                                    |
|-----------|--------|--------------|-------------------------------------------------|
| `entity`  | string | Erforderlich | Entity ID (z.B. `switch.garage_door`)           |
| `pin`     | string | Erforderlich | PIN-Code (numerisch)                            |
| `timeout` | number | `30`         | Freischalt-Dauer in Sekunden (Minimum: 5)       |
| `title`   | string | -            | Optionaler Titel (Standard: friendly_name)      |

## Nutzungsanleitung

### Schritt-fuer-Schritt

1. **Card zum Dashboard hinzufuegen**
   - Dashboard bearbeiten > Card hinzufuegen > "Secured Card" suchen
   - Oder manuell YAML einfuegen (siehe oben)

2. **Card konfigurieren**
   - Entity auswaehlen, die geschuetzt werden soll
   - PIN festlegen (nur Ziffern)
   - Timeout in Sekunden festlegen (wie lange die Card nach PIN-Eingabe entsperrt bleibt)
   - Optional einen Titel vergeben

3. **Card nutzen**
   - Auf die Card klicken, um den PIN-Dialog zu oeffnen
   - PIN ueber das Zahlenfeld eingeben
   - Mit dem Haekchen-Button bestaetigen
   - Bei **korrektem PIN**: Aktion wird ausgefuehrt, Card bleibt fuer die eingestellte Dauer entsperrt
   - Bei **falschem PIN**: Fehlermeldung mit Schuettel-Animation, erneute Eingabe moeglich
   - Waehrend der Freischaltung: Gruenes Schloss-Icon und Countdown-Balken sichtbar
   - Nach Ablauf des Timeouts: Card sperrt sich automatisch wieder

### Ablauf-Diagramm

```
[Card gesperrt] --Klick--> [PIN-Dialog] --richtiger PIN--> [Aktion + Entsperrung]
                                |                                   |
                          falscher PIN                        Timeout laeuft ab
                                |                                   |
                      [Schuetteln + Fehler]                [Automatische Sperrung]
```

## Sicherheitshinweise

- Der PIN wird in der Lovelace Card-Konfiguration gespeichert (YAML oder UI-Config)
- Dies ist eine **reine Frontend-Schutzschicht**. Sie ist nicht als Sicherheitsbarriere gegen Benutzer mit Admin-Zugang zu Home Assistant gedacht
- Benutzer mit Zugriff auf die Browser-Entwicklertools oder die HA-Konfiguration koennen den PIN einsehen
- Fuer hohe Sicherheitsanforderungen: Diese Card mit den integrierten Benutzerberechtigungen und der Authentifizierung von Home Assistant kombinieren
- Die Card verwendet Shadow DOM zur Isolation ihrer Styles
- Alle dynamischen Textinhalte werden escaped, um XSS zu verhindern

## Entwicklung

Wenn du die Card anpassen moechtest:

1. `dist/secured-card.js` direkt bearbeiten (kein Build-Schritt erforderlich)
2. Fuer TypeScript-Entwicklung: Node.js installieren, `npm install` ausfuehren, dann `npm run build`

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

## Changelog

### [1.0.0] - 2026-03-05

#### Hinzugefuegt

- Erstveroeffentlichung
- PIN-geschuetzte Custom Lovelace Card fuer Home Assistant
- Numerisches Keypad mit Schuettel-Animation bei falschem PIN
- Unterstuetzung fuer alle schaltbaren Entitaets-Typen: switch, light, fan, cover, lock, script, scene, climate, input_boolean, automation
- Konfigurierbarer Timeout pro Card (Standard: 30 Sekunden)
- Visueller Countdown-Balken waehrend der Freischaltung
- Automatische Sperrung nach Timeout-Ablauf
- Schloss/Entsperrt-Icon mit Farbuebergang
- Visueller Config-Editor mit Entity-Picker, PIN-Feld, Timeout und Titel
- HACS-kompatible Installation
- Deutsche Zustands-Uebersetzungen
- Shadow DOM Kapselung fuer Style-Isolation
- MIT-Lizenz

Vollstaendiges Changelog: [CHANGELOG.md](CHANGELOG.md)
