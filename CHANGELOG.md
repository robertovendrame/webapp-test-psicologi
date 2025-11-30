# Changelog

Tutte le modifiche rilevanti al progetto sono documentate qui.

## [Unreleased] - 2025-11-29

### Refactor & Manutenibilità
- **Separazione file JS/CSS**: estratti completamente gli stili e il codice JavaScript da `index.html`.
  - CSS inline → `assets/style.css` (~460 linee)
  - JS inline → `assets/app.js` (~540 linee)
  - `index.html` ridotto da ~2400 a ~460 linee (puro markup)
- **Migliora leggibilità e manutenibilità** del progetto tramite separazione dei concern.

### Nuove Funzionalità
- **Generazione PDF client-side** con libreria `html2pdf.js`:
  - Aggiunti pulsanti "⬇️ Scarica PDF" in:
    - Storico dei test (history-detail-card)
    - Dettagli test paziente (patient-test-detail-card)
    - Vista Scoring (scoring-detail-card)
  - Download diretto senza passare per dialogo stampa
  - Nome file personalizzato con test name, paziente e data
  - Funzione `downloadPDFReport(mode)` in `assets/app.js`
- **Compatibilità iPad**: soluzione pratica per salvare PDF direttamente sul dispositivo (senza file system API).

### Feature Precedenti (dalla sessione)
- Aggiunto pulsante `Elimina paziente` nella scheda `Anagrafica paziente`.
- Modal di conferma con opzione per eliminare/conservare test associati.
- Logica JavaScript per eliminazione paziente e test dal `localStorage`.

---

Si consiglia di spostare la voce in una sezione di versione rilasciata quando si pubblica una release.
