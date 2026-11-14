# ADR-0095: Grundfunktionen zuerst, alles Weitere zum Einschalten

- **Status:** angenommen
- **Datum:** 2026-11-14
- **Entscheid von:** Claude (Alban, 14.11.2026: «Ich will eine Base Version und eine Pro Version, quasi Essentials und Erweitert. In den Einstellungen ein Knopf, der den erweiterten Modus aktiviert. Ein neuer Nutzer soll nicht von so vielen Funktionen erschlagen werden. Ziel ist, Erklärbarkeit zu reduzieren.»)

## Kontext

Rettich hat in einer Woche viele Funktionen bekommen: Personen, Plätze mit Foto, Töpfe, Rezepte, Nährwerte, Klimabilanz, Abzeichen, Auszüge, Checks, Hinweise. Jede ist für sich nützlich. Zusammen muss eine neue Person viel lesen, bevor sie versteht, wofür Rettich da ist.

## Entscheid

- **Grundfunktionen** sind der Kern: erfassen (Foto, Quittung, Barcode, von Hand), sehen, was bald abläuft («Heute retten», Vorrat nach Ablauf), verwertet oder entsorgt eintragen (auch per Wischen), die Bilanz, Nachkaufen, Haltbarkeit A–Z, Journal und «Deine Daten».
- **Erweitert** ist ein Schalter unter «Mehr › Funktionen». Ist er an, lassen sich acht Gruppen einzeln ein- und ausschalten: Haushalt, Plätze, Ordnen, Kochen, Nährwerte, Auswertung, Routinen, Hinweise. Was zu welcher Gruppe gehört, steht in `apps/web/src/app/extras.ts` und auf der Seite «Funktionen».
- **Wer startet womit:** Eine Person, deren Haushalt auf diesem Gerät neu entsteht, beginnt mit den Grundfunktionen. Wer Rettich schon nutzt, behält alles eingeschaltet. Fehlt die Wahl oder ist sie unlesbar, zeigt Rettich alles: Niemand verliert eine Funktion aus Versehen.
- **Ausblenden heisst ausblenden:** Nur die Einstiege verschwinden (Zeilen, Knöpfe, Abschnitte). Die Daten bleiben in der Datenbank und in der Sicherung, eine gespeicherte Adresse öffnet die Seite weiterhin.
- **Pro Gerät:** Die Wahl ist eine Anzeige, keine Haushaltsdaten. Sie liegt im `localStorage` (`fridgeai:extras`), wie die Ansicht im Vorrat (ADR-0067), und gehört nicht zur Sicherung.
- **Schrittweise:** Dieser Entscheid bringt den Schalter und die Zeilen unter «Mehr». Die übrigen Flächen folgen gruppenweise in eigenen PRs (Stand in [`flaechen.md`](../flaechen.md), Auftrag K15).

## Folgen

- Neue Funktionen gehören in eine Gruppe oder sind ausdrücklich Grundfunktion. Die Liste der Flächen ([`flaechen.md`](../flaechen.md)) fragt künftig auch: Ist es eine Grundfunktion?
- Tests sehen standardmässig alles (`test-setup.ts`, E2E-Fixture `test.ts`). Wer die Grundfunktionen prüft, setzt `test.use({ newPerson: true })`.
- Die Namen auf der Seite («Grundfunktionen», «Erweitert») sind Arbeitstitel; Claude legt sie am Ende fest.

## Nachtrag (14.11.2026): Start und Wissen

- **Start:** Kühlschrank-Check und «Deine Woche» gehören zu «Routinen»; «Seit deinem ersten Monat», Klimabilanz und neue Abzeichen zu «Auswertung». «Heute retten», die Bilanz des Monats, die Lagerort-Kacheln, der Einfrier-Tipp und der Sicherungs-Hinweis sind Grundfunktionen.
- **«Im Blick»** gehört zu «Hinweise» und verschwindet an einer Stelle (`useAttention`) für Start, Vorrat und Artikelseite.
- **Wissen:** Die Rezepte gehören zu «Kochen». «Rettich im Alltag» zeigt nur, was eingeschaltet ist; welche Erklärung zu welcher Gruppe gehört, steht in `KnowledgePage.tsx` (`EVERYDAY_EXTRA`), nicht im Textkatalog. Neu erklärt sind App-Sperre, Sicherung mit Passwort, «Teilen an Rettich» und «Funktionen» (K14).
