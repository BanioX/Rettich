# Pilot: Rettich ausprobieren

Für den ersten Pilot mit Alban und einer weiteren Person. Stand: v0.22.0. Claude gibt den Pilot frei (CLAUDE.md, Prioritäten).

## Einrichten (5 Minuten pro Person)

1. Auf dem iPhone in **Safari** die Adresse der App öffnen, die du von Alban bekommst.
   - Voraussetzung: In Cloudflare ist unter Domains «Production» eingeschaltet ([`previews.md`](./previews.md)).
2. **Auf den Home-Bildschirm legen:** unten «Teilen», dann «Zum Home-Bildschirm».
   - Das ist wichtig: Nur so behält das iPhone die Daten dauerhaft und startet Rettich offline wie eine App.
3. Rettich über das neue Symbol öffnen. Ein Konto gibt es noch nicht, alles bleibt auf dem Gerät.

Auf anderen Geräten geht es genauso einfach: iPad wie iPhone (quer erscheint links eine Seitenleiste), Android über das Chrome-Menü → «App installieren», am Computer in Chrome oder Edge über «Installieren» in der Adresszeile. Jedes Gerät hat seine eigenen Daten, siehe «Bekannte Grenzen».

## Was testen (eine Woche, Kühlschrank zuerst)

| Tag | Aufgabe | Achte auf |
| --- | --- | --- |
| 1 | 5 bis 10 Sachen aus dem Kühlschrank erfassen: Barcode scannen, sonst den Namen tippen | Ist der Scan scharf und schnell? Stimmen Name, Bild, Menge und Datum? |
| 2–6 | Jeden Tag kurz «Start» öffnen. Verwertetes oder Entsorgtes eintragen, auch Teile («⅓»), oder in der Liste wischen: nach links «Verwertet», nach rechts «Entsorgt» | Ist es schneller als im Kopf? Fehlt eine Portion oder ein Grund? |
| 2–6 | Vor dem Einkaufen **«Nachkaufen»** unter «Mehr» nutzen (füllt sich auch, wenn du nach dem Aufbrauchen «Nachkaufen» tippst), nach dem Einkauf «In den Vorrat legen» | Hilft «Du hast noch …»? |
| 2–6 | Nach dem Einkauf die **Quittung hochladen** (＋, dann «Quittung hochladen»: PDF aus der Coop- oder Migros-App, Lidl-Screenshot oder Foto; auch mehrere auf einmal, die du auf einer Seite prüfst) | Stimmen Namen und Preise, stimmt die Summe? |
| 2–6 | Nach dem Einkauf die Standardartikel mit **«Schnell erfassen»** eintragen | Reicht ein Tipp, stimmen Menge und Ort? |
| 2–6 | Im Tab **«Wissen»** nachschauen, wie lange etwas hält (**«Haltbarkeit A–Z»**) | Hilft es dir, wenn du unsicher bist? |
| 2–6 | Hast du etwas falsch eingetragen? Unter «Mehr» › **«Journal»** ändern oder löschen | Findest du den Eintrag schnell? |
| 2–6 | Nur auf Android: in einer Nachricht einen Einkaufszettel markieren, «Teilen» › **Rettich**, dann «Auf die Liste». Oder lange auf das Rettich-Symbol drücken | Landet der Text richtig auf «Nachkaufen»? |
| 7 | Den **Kühlschrank-Check** auf «Start» machen, unter «Mehr» einen **Auszug als PDF** erstellen, die «Bilanz» des Monats auf «Start» ansehen (ein Tipp auf einen Kreis zeigt die Einträge im «Journal»), einmal «Alles exportieren» | Würdest du die App weiter nutzen? Was nervt? |

## Neues Symbol, neues Handy oder neue Adresse

Das iPhone übernimmt Symbol und Namen einer Web-App nur beim Hinzufügen zum Home-Bildschirm. Wer das alte «FridgeAI»-Symbol hat, legt Rettich neu hin. **Wer das alte Symbol löscht, löscht meist auch dessen Daten.** Darum in dieser Reihenfolge:

1. In der alten App: «Mehr» › «Deine Daten» › **«Alles exportieren (JSON)»**, die Datei in «Dateien» sichern.
2. In Safari die Adresse öffnen, einmal neu laden, «Teilen» › «Zum Home-Bildschirm».
3. Die neue App öffnen: «Mehr» › «Deine Daten» › **«Daten importieren (JSON)»**, die Datei wählen, «Ja, übernehmen».
4. Erst wenn alles stimmt, das alte Symbol löschen.

Genauso geht es beim Handywechsel und später beim Umzug auf eine eigene Adresse.

## Feedback

- Nach einer Woche fragt Rettich auf Start, was gestört hat. Die Antwort bleibt auf dem Gerät; zeig sie Alban oder schick sie mit dem Export.
- Direkt an Alban: Screenshot plus ein Satz, was du erwartet hast. Alban gibt es an Claude weiter.
- Wichtig sind vor allem: «Das habe ich nicht gefunden», «Das war mir zu umständlich» und «Das hat nicht gestimmt».
- Geht nach einem Update gar nichts mehr: zuerst [`notfall.md`](notfall.md), Rettich nicht vom Home-Bildschirm löschen.

## Bekannte Grenzen

- **Kein Teilen zwischen Handys:** Jede Person hat ihren eigenen Vorrat. Ein gemeinsamer Haushalt kommt mit Konten (Plan, Schritt 7).
- **Quittungen:** PDFs aus der Coop- und Migros-App werden am genauesten gelesen. Fotos und Screenshots können Ziffern verwechseln: Die Summenprüfung zeigt das, ein Tipp auf den Preis korrigiert ihn. Screenshots in voller Grösse hochladen, nicht über einen Chat verkleinert. Erkennt Rettich den Laden nicht, fragt es «Wo eingekauft?».
- **Scan im Browser:** Ist es unscharf, das Handy etwas weiter weg halten oder «Code aus Foto lesen» nutzen.
- **Unbekannte Produkte:** Rettich kennt Barcodes aus dem eingebauten Katalog. Mehr kennt es mit «Open Food Facts» unter «Mehr › Deine Daten» (für neue Personen aus). Sonst einmal von Hand erfassen, beim nächsten Scan kennt Rettich das Produkt.
- **Handywechsel und mehrere Geräte:** iPhone, iPad und Computer haben je eigene Daten. Export und Import wie oben übertragen sie. Ein laufender Abgleich zwischen Geräten kommt mit den Konten.
- **Keine Push-Mitteilungen:** Die App zeigt das Dringende beim Öffnen. Für einen einzelnen Artikel trägt «Im Kalender erinnern» auf der Artikelseite einen Termin in deinen Kalender ein.
- **Siri:** Ein Kurzbefehl, der einen Rettich-Link öffnet, landet auf dem iPhone in Safari und damit nicht in den Daten der App auf dem Home-Bildschirm (ADR-0094).

## Daten und Datenschutz

Alles bleibt auf dem Gerät. Quittungen werden auf dem Handy gelesen und nie gespeichert, nur Name, Menge und Preis jeder Zeile. Open Food Facts fragt Rettich nur, wenn du es unter «Mehr › Deine Daten» einschaltest. Dann geht beim Scannen nur die Barcode-Nummer hinaus (Name, Nährwerte, Bild), bei der Suche nur die getippten Wörter, und für Quittungszeilen ohne sicheren Treffer im mitgelieferten Katalog nur der Produktname, ohne Preise, Laden und Datum. Es gibt kein Tracking, keine Werbung und kein Konto. Mit «Alles löschen» unter «Mehr» → «Deine Daten» ist alles weg (ADR-0020).
