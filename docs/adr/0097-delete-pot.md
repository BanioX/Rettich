# ADR-0097: Topf «Löschen» für falsche Einträge

- **Status:** angenommen
- **Datum:** 2026-11-15
- **Entscheid von:** Alban (Wunsch: ein Löschen-Korb, falls sich ein falscher Artikel einschleicht, etwa ein Buch von der Quittung), Claude (Umsetzung)

## Kontext

Ein falscher Eintrag (etwa eine Zeile «Buch» einer Quittung) liess sich nur über die Artikelseite entfernen. Verwertet und Entsorgt wären falsch: Beide buchen einen Ausgang und verfälschen Bilanz und Journal. Die Töpfe (ADR-0055) und ihre Folgen für Verarbeiten (ADR-0061) kannten bisher keinen Weg, der nichts bucht.

## Entscheid

1. **Fünfter Topf «Löschen»** im Auswahlmodus, neutral grau mit Radiergummi-Symbol: Rot bleibt «Entsorgt», Grün den Aktionen. Antippen oder Ablegen wirken gleich (ADR-0055, Punkt 2).
2. **Weiches Löschen ohne Ausgang.** Jeder gewählte Artikel geht über `inventory.deleteItem`. Es entsteht kein `recordOutcome`, also nichts in Verwertet, Entsorgt, Bilanz oder Journal, keine Rettungsfrage und kein «Ist das noch gut?».
3. **Rückgängig.** Die Meldung «Testbuch gelöscht.» oder «3 Artikel gelöscht.» trägt «Rückgängig», das jeden Artikel per `inventory.restoreItem` zurückholt. Der Zustand «gelöscht» der Vorrats-Seite (`ClosedItem`, Art `deleted`) kennt dafür mehrere Artikel; die alte Form mit einem `itemId` bleibt lesbar.
4. **Anordnung:** Fünf Töpfe stehen in zwei Reihen (3 + 2), weil eine Reihe bei 390 px nur etwa 67 px je Topf liesse, zu schmal für «Verarbeiten» bei 12 px. Berührfläche mindestens 44 px.

## Folgen

- Schnittstelle v1 bleibt unverändert, kein neuer Datenfluss, keine Abhängigkeit.
- Der Rückgängig-Absatz in ADR-0055 (Punkt 6) gilt weiter für Verwertet und Entsorgt; für Löschen gilt Punkt 3 hier.
- ADR-0061 (Rezepte für die Auswahl) ist nicht betroffen: Löschen führt nirgends hin.
