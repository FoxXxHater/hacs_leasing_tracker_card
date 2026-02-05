# 🚗 Leasing Tracker Card

Eine schöne custom Lovelace Card für die Leasing Tracker Integration.

## ✨ Features

- 🔍 **Intelligente Sensor-Suche** - Findet automatisch die Sensoren zum Leasing Tracker
- 🚗 **Mehrere Fahrzeuge** - Eine Card pro Fahrzeug
- 🎨 **Farbcodierung** - Grün/Gelb/Rot Status
- 📱 **Responsive** - Funktioniert überall

## Wichtig

Diese Card benötigt die <a href="https://github.com/foxxxhater/hacs_leasing_tracker">**Leasing Tracker Integration**</a>!

Installiere zuerst die Integration, dann diese Card.

## 🔍 Wie funktioniert die Sensor-Suche?

### Eine Entity - alle Daten!

Es wird nur **eine** Entity angegeben:
```yaml
entity: sensor.mein_leasing_status
```

Die Card findet dann **automatisch** alle anderen Sensoren:
- `sensor.mein_leasing_verbleibende_km_diesen_monat` ✅
- `sensor.mein_leasing_verbleibende_km_dieses_jahr` ✅
- `sensor.mein_leasing_gefahrene_km` ✅
- `sensor.mein_leasing_km_differenz_zum_plan` ✅
- usw.

**Wie?** Durch den gemeinsamen Präfix: `mein_leasing`

### Debug: Was wurde gefunden?

Öffnen Sie die Browser-Console (F12) und suchen Sie nach:
```
Leasing Tracker Card - Gefundene Sensoren: {...}
```

Dort sehen Sie welche Sensoren die Card gefunden hat.

## 🚗 Mehrere Leasing-Verträge

### Jeder Vertrag = Eigene Card

**Beispiel: Du hast 2 Autos**

#### Auto 1: BMW Leasing
Integration-Config: Name = "BMW Leasing"
→ Erstellt Sensoren mit Präfix: `bmw_leasing_`

```yaml
type: custom:leasing-tracker-card
entity: sensor.bmw_leasing_status
title: BMW 3er
```

#### Auto 2: Audi Leasing
Integration-Config: Name = "Audi Leasing"
→ Erstellt Sensoren mit Präfix: `audi_leasing_`

```yaml
type: custom:leasing-tracker-card
entity: sensor.audi_leasing_status
title: Audi A4
```

### Dashboard mit beiden

```yaml
type: vertical-stack
cards:
  - type: custom:leasing-tracker-card
    entity: sensor.bmw_leasing_status
    title: BMW 3er
    
  - type: custom:leasing-tracker-card
    entity: sensor.audi_leasing_status
    title: Audi A4
```

### Oder nebeneinander

```yaml
type: horizontal-stack
cards:
  - type: custom:leasing-tracker-card
    entity: sensor.bmw_leasing_status
    title: BMW 3er
    
  - type: custom:leasing-tracker-card
    entity: sensor.audi_leasing_status
    title: Audi A4
```

## 📦 Installation

### Via HACS (Folgt in Zukunft...)

1. HACS → Frontend → ⋮ → Benutzerdefinierte Repositories
2. URL: `https://github.com/DEIN-USERNAME/leasing-tracker-card`
3. Kategorie: Lovelace
4. Installieren
5. Browser-Cache leeren (Strg + F5)

### Manuell (Aktuell die einzige Möglichkeit)

1. Laden Sie die `leasing-tracker-card.js` herunter
2. Kopieren Sie die Datei nach `/config/www/leasing-tracker-card/` - Den Pfad gegebenenfalls anlegen
3. Ressource registrieren:
   - Einstellungen → Dashboards → ⋮ → Ressourcen
   - URL: `/local/leasing-tracker-card/leasing-tracker-card.js`
   - Typ: JavaScript-Modul
4. Home Assistant neu starten
5. Browser-Cache leeren (Strg + Shift + R)

## ⚙️ Konfiguration

### Via UI (Einfach)

1. Dashboard bearbeiten
2. "Karte hinzufügen"
3. "Leasing Tracker Card" suchen
4. Entity auswählen
5. Im Editor anpassen
6. Speichern

### Via YAML

**Minimal:**
```yaml
type: custom:leasing-tracker-card
entity: sensor.mein_leasing_status
```

**Mit Titel:**
```yaml
type: custom:leasing-tracker-card
entity: sensor.mein_leasing_status
title: Mein BMW 3er
```

**Nur wichtige Sensoren:**
```yaml
type: custom:leasing-tracker-card
entity: sensor.mein_leasing_status
title: Mein Auto
show_km_remaining_month: true
show_km_difference: true
show_progress: true
show_km_remaining_year: false
show_km_driven: false
show_average_day: false
```

## 🎛️ Optionen

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `entity` | **erforderlich** | Status-Sensor |
| `title` | `Leasing Tracker` | Titel |
| `show_km_remaining_month` | `true` | Verbleibend (Monat) |
| `show_km_remaining_year` | `true` | Verbleibend (Jahr) |
| `show_km_remaining_total` | `true` | Verbleibend (Gesamt) |
| `show_km_driven` | `true` | Gefahrene KM |
| `show_km_difference` | `true` | Differenz zum Plan |
| `show_average_day` | `true` | Ø pro Tag |
| `show_average_month` | `true` | Ø pro Monat |
| `show_remaining_days` | `true` | Verbleibende Tage |
| `show_progress` | `true` | Fortschrittsbalken |

## 🎨 Farbcodierung

### Status
- 🟢 **Im Plan** - Grün
- 🟡 **Über Plan** - Gelb
- 🔴 **Deutlich über Plan** - Rot

### Verbleibende KM
- 🟢 **> 500 km** - Grün
- 🟡 **0-500 km** - Gelb
- 🔴 **< 0 km** - Rot

### Differenz
- 🟢 **< 0** - Unter Plan (gut!)
- 🟡 **0-1000** - Leicht über Plan
- 🔴 **> 1000** - Deutlich über Plan

### Sensoren haben falsche Namen

Die Card sucht nach dem Standard-Pattern der Integration.

Falls Sie die Sensoren umbenannt haben, müssen Sie die YAML verwenden und die Sensoren manuell angeben.

## 💡 Beispiele

### Dashboard für Firmenwagen Flotte

```yaml
type: grid
columns: 3
cards:
  - type: custom:leasing-tracker-card
    entity: sensor.wagen_1_leasing_status
    title: Wagen 1
    
  - type: custom:leasing-tracker-card
    entity: sensor.wagen_2_leasing_status
    title: Wagen 2
    
  - type: custom:leasing-tracker-card
    entity: sensor.wagen_3_leasing_status
    title: Wagen 3
```

### Kompakte Übersicht

```yaml
type: custom:leasing-tracker-card
entity: sensor.mein_leasing_status
show_km_remaining_month: true
show_km_difference: true
show_progress: true
# Alles andere ausblenden
show_km_remaining_year: false
show_km_remaining_total: false
show_km_driven: false
show_average_day: false
show_average_month: false
show_remaining_days: false
```

## 📊 Dokumentation

- [📝 Changelog](CHANGELOG.md)

## 🤝 Kompatibilität

- **Home Assistant:** 2023.x+
- **Leasing Tracker Integration:** v1.1.3+

## Support

[GitHub Repository](https://github.com/foxxxhater/hacs_leasing_tracker_card)
[Dokumentation](https://github.com/foxxxhater/hacs_leasing_tracker_card#readme)
[Issues](https://github.com/foxxxhater/hacs_leasing_tracker_card/issues)

## 📄 Lizenz

MIT License

---

**Happy Leasing Tracking! 🚗💨**

P.S. Mit freundlicher Unterstützung von Claude
