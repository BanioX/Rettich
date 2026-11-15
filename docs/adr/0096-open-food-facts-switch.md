# ADR-0096: Open Food Facts als Schalter, für neue Personen aus

- **Status:** angenommen
- **Datum:** 2026-11-15
- **Entscheid von:** Alban (15.11.2026: «Der automatische Abgleich schadet aktuell mehr, als dass er nützt. Ich würde gerne dem Nutzer die Nutzung von Open Food Facts überlassen, ein oder aus. Jede Hürde muss von Beginn an reduziert werden.»)

## Kontext

Rettich fragt die offene Produktdatenbank Open Food Facts an drei Stellen: bei einem unbekannten Barcode (ADR-0016), bei der Suche nach Namen (ADR-0025) und automatisch für Quittungszeilen ohne sicheren Treffer auf dem Gerät (ADR-0036). Der Abgleich über Namen traf zu oft daneben, etwa über Hausmarken-Wörter wie «Classic». Ein falscher Treffer bringt ein falsches Bild und falsche Nährwerte in den Vorrat und lässt Rettich unzuverlässig wirken.

## Entscheid

- **Ein Schalter «Open Food Facts»** unter «Mehr › Deine Daten». Ist er aus, geht für Produktdaten nichts hinaus: kein Barcode, keine Suchwörter, keine Quittungszeilen, keine Bilder.
- **Neue Personen starten ohne**, wer Rettich schon nutzt, behält es eingeschaltet. Fehlt die Wahl oder ist sie unlesbar, gilt «an», wie zuvor. Die Wahl gilt pro Gerät (`fridgeai:open-food-facts`), wie die Funktionen (ADR-0095).
- **Ohne Open Food Facts** kennt Rettich frühere Quittungen, eigene Produkte und den mitgelieferten Katalog (ADR-0045). Neu findet auch ein Scan Barcodes im Katalog, auf dem Gerät. Ist Open Food Facts an, fragt der Scan zuerst dort (mit Nährwerten und Bild) und nimmt den Katalog, wenn nichts kommt.
- **Ein Tor statt Rückbau:** Die Adapter bleiben; `gatedCatalog` und `gatedSearch` fragen bei jedem Aufruf den Schalter. Die Wirkung zeigt sich sofort, ohne Neustart.
- **Texte sagen, was passiert:** Ohne Open Food Facts sagt die Quittung «Rettich sucht nur auf dem Gerät», ein unbekannter Barcode nennt den Schalter.

## Folgen

- Weniger falsche Treffer, weniger Daten nach aussen. Dafür kennt Rettich ohne Schalter weniger Barcodes; der Hinweis beim Scan zeigt den Weg.
- Der Content-Security-Policy-Eintrag für Open Food Facts bleibt: Der Schalter kann jederzeit an.
- Datenschutz-Entwurf, Nebenwirkungen (SE-01, SE-02, SE-36) und Pilot-Anleitung beschreiben den Schalter.
