# ADR-0095: Basis zuerst, alles Weitere zum Einschalten

- **Status:** angenommen
- **Datum:** 2026-11-14
- **Entscheid von:** Claude (Alban, 14.11.2026: «Ich will eine Base Version und eine Pro Version, quasi Essentials und Erweitert. In den Einstellungen ein Knopf, der den erweiterten Modus aktiviert. Ein neuer Nutzer soll nicht von so vielen Funktionen erschlagen werden. Ziel ist, Erklärbarkeit zu reduzieren.»)

## Kontext

Rettich hat in einer Woche viele Funktionen bekommen: Personen, Plätze mit Foto, Töpfe, Rezepte, Nährwerte, Klimabilanz, Abzeichen, Auszüge, Checks, Hinweise. Jede ist für sich nützlich. Zusammen muss eine neue Person viel lesen, bevor sie versteht, wofür Rettich da ist.

## Entscheid

- **Basis** ist der Kern: erfassen (Foto, Quittung, Barcode, von Hand), sehen, was bald abläuft («Heute retten», Vorrat nach Ablauf), verwertet oder entsorgt eintragen (auch per Wischen), die Bilanz, Nachkaufen, Haltbarkeit A–Z, Journal und «Deine Daten».
- **Erweitert** ist ein Schalter unter «Mehr › Funktionen». Ist er an, lassen sich acht Gruppen einzeln ein- und ausschalten: Haushalt, Plätze, Ordnen, Kochen, Nährwerte, Auswertung, Routinen, Hinweise. Was zu welcher Gruppe gehört, steht in `apps/web/src/app/extras.ts` und auf der Seite «Funktionen».
- **Wer startet womit:** Eine Person, deren Haushalt auf diesem Gerät neu entsteht, beginnt mit der Basis. Wer Rettich schon nutzt, behält alles eingeschaltet. Fehlt die Wahl oder ist sie unlesbar, zeigt Rettich alles: Niemand verliert eine Funktion aus Versehen.
- **Ausblenden heisst ausblenden:** Nur die Einstiege verschwinden (Zeilen, Knöpfe, Abschnitte). Die Daten bleiben in der Datenbank und in der Sicherung, eine gespeicherte Adresse öffnet die Seite weiterhin.
- **Pro Gerät:** Die Wahl ist eine Anzeige, keine Haushaltsdaten. Sie liegt im `localStorage` (`fridgeai:extras`), wie die Ansicht im Vorrat (ADR-0067), und gehört nicht zur Sicherung.
- **Schrittweise:** Dieser Entscheid bringt den Schalter und die Zeilen unter «Mehr». Die übrigen Flächen folgen gruppenweise in eigenen PRs (Stand in [`flaechen.md`](../flaechen.md), Auftrag K15).

## Folgen

- Neue Funktionen gehören in eine Gruppe oder ausdrücklich zur Basis. Die Liste der Flächen ([`flaechen.md`](../flaechen.md)) fragt künftig auch: Gehört es zur Basis?
- Tests sehen standardmässig alles (`test-setup.ts`, E2E-Fixture `test.ts`). Wer die Basis prüft, setzt `test.use({ newPerson: true })`.
- Die Namen «Basis» und «Erweitert» sind seit 15.11.2026 festgelegt (Nachtrag unten).

## Nachtrag (14.11.2026): Start und Wissen

- **Start:** Kühlschrank-Check und «Deine Woche» gehören zu «Routinen»; «Seit deinem ersten Monat», Klimabilanz und neue Abzeichen zu «Auswertung». «Heute retten», die Bilanz des Monats, die Lagerort-Kacheln, der Einfrier-Tipp und der Sicherungs-Hinweis gehören zur Basis.
- **«Im Blick»** gehört zu «Hinweise» und verschwindet an einer Stelle (`useAttention`) für Start, Vorrat und Artikelseite.
- **Wissen:** Die Rezepte gehören zu «Kochen». «Rettich im Alltag» zeigt nur, was eingeschaltet ist; welche Erklärung zu welcher Gruppe gehört, steht in `KnowledgePage.tsx` (`EVERYDAY_EXTRA`), nicht im Textkatalog. Neu erklärt sind App-Sperre, Sicherung mit Passwort, «Teilen an Rettich» und «Funktionen» (K14).

## Nachtrag (15.11.2026): Vorrat, Artikelseite, Erfassen, Nachkaufen

- **Vorrat:** «Auswählen», «Nach Art» und das Ziehen zwischen Lagerorten gehören zu «Ordnen»; ohne «Ordnen» zeigt der Vorrat «Nach Ablauf», auch wenn auf dem Gerät «Nach Art» gespeichert ist. Die Initialen in der Zeile gehören zu «Haushalt», der Name des Platzes statt des Lagerorts zu «Plätze».
- **Artikelseite:** «Platz festhalten» (Plätze), «Gehört» (Haushalt), Nährwerte und Allergene (Nährwerte), «Verarbeiten» und Fertigprodukt oder Zutat (Kochen), «Immer da haben» (Hinweise), «Im Kalender erinnern» (Routinen). Zur Basis gehören: Verwertet oder Entsorgt mit Menge, Datum, Haltbarkeit, Packung und Inhalt, Weitere Packungen, Einfrieren, Bearbeiten, Öffnen, Löschen.
- **Erfassen:** «Reste erfassen» gehört zu «Kochen»; «Gehört» im Formular und in «Mehrere ändern» zu «Haushalt»; Plätze in «Mehrere ändern» und in «Einräumen» zu «Plätze».
- **Nachkaufen:** «Bald wieder nötig» und «Entsorgst du oft» gehören zu «Hinweise».
- Der Kühlschrank-Check und die PDF-Auszüge zeigen Daten so, wie sie gespeichert sind: Ihre Einstiege sind ohnehin Extras («Routinen», «Auswertung»).

## Nachtrag (15.11.2026): die Namen

- **Basis** heisst, was eine neue Person sieht; **Erweitert** heisst der Schalter, der die Gruppen dazuschaltet. Der Arbeitstitel «Grundfunktionen» ist damit ersetzt. Alban hat die beiden Wörter selbst verwendet; sie sagen, was passiert: mehr Funktionen in derselben App.
- **Unter «Mehr»** steht neben «Funktionen», was das Gerät zeigt: «Basis», «Erweitert» (alle Gruppen) oder «Eigene Auswahl» (ein Teil davon). Ist «Erweitert» an, aber keine Gruppe, steht dort «Basis» (`extrasLevel` in `extras.ts`).
- **Die Seite «Funktionen»** nennt unter «Immer dabei», was zur Basis gehört, bevor der Schalter kommt.
