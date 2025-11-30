# 📋 Ilaria Tests – Strumento Locale per Somministrazione Test Psicologici

Un'applicazione **client-side** per la somministrazione, scoring e documentazione di test psicologici. Funziona completamente in locale senza server backend.

---

## 🎯 Caratteristiche Principali

✅ **Completamente locale** – I dati rimangono sul tuo dispositivo (iPad/PC)  
✅ **Nessun internet richiesto** – Funziona offline  
✅ **Protezione con PIN** – Storico test protetto da password  
✅ **Generazione PDF** – Scarica report in PDF direttamente  
✅ **Backup/Ripristino** – Esporta e importa tutti i dati  
✅ **Gestione pazienti** – CRUD completo (crea, leggi, modifica, elimina)  
✅ **Scoring automatico** – Calcolo punteggi secondo intervalli predefiniti  

---

## 🚀 Quick Start

### Requisiti
- **Browser moderno** (Chrome, Safari, Firefox, Edge)
- **Python 3** (per server locale)
- **Internet** solo per primo caricamento (librerie CDN)

### Setup su PC/Mac

```bash
# 1. Clona il repository
git clone https://github.com/robertovendrame/webapp-test-psicologi.git
cd webapp-test-psicologi

# 2. Avvia server locale
python3 -m http.server 8000

# 3. Apri il browser
# Visita: http://localhost:8000
```

### Setup su iPad (stesso network)

```bash
# Su PC: esegui il comando sopra (server rimane attivo)

# Su iPad (stesso WiFi):
# Safari > digita: http://<IP-DEL-TUO-PC>:8000
# Esempio: http://192.168.1.100:8000

# Per trovare l'IP del PC:
# Windows:  ipconfig | findstr "IPv4"
# Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## 📖 Guida Utente

### Home – Sezioni Principali

| Icona | Sezione | Descrizione |
|-------|---------|-------------|
| 🧪 | **Nuovo Test** | Somministra un test a un paziente |
| 📚 | **Storico** | Visualizza tutti i test completati (protetto da PIN) |
| 👥 | **Pazienti** | Gestisci anagrafica pazienti (crea/modifica/elimina) |
| 📊 | **Scoring** | Visualizza scoring e intervalli di interpretazione |
| ⚙️ | **Impostazioni** | PIN, export/import dati |

---

## 🔧 Come Usare – Workflow Completo

### 1️⃣ Creare un Paziente

1. **Home** → **Pazienti**
2. Compila il form:
   - **Nome*** (obbligatorio)
   - Data di nascita (calcola età automaticamente)
   - Sesso
   - Email (per inviare report)
   - Note cliniche
3. Clicca **"Salva paziente"**
4. Paziente appare in lista → clicca per editare

**Eliminare un paziente:**
- Seleziona paziente dalla lista
- Clicca **"Elimina paziente"**
- Scegli: **conserva test** oppure **elimina anche test associati**
- Conferma

---

### 2️⃣ Somministrare un Test

1. **Home** → **Nuovo Test**
2. **Step 1: Seleziona paziente**
   - Scegli dalla dropdown
   - Clicca **"Avanti"**

3. **Step 2: Seleziona test**
   - Visualizza ultimo test per questo paziente (data)
   - Clicca su un test → **Step 3**

4. **Step 3: Compila il test**
   - Rispondi a tutte le domande
   - Timer auto-parte (registra tempo compilazione)
   - Aggiungi note cliniche opzionali (text area)
   - Cambia data se necessario (default: oggi)

5. **Salva test**
   - Clicca **"Salva test"**
   - Vedi il punteggio e intervallo subito

---

### 3️⃣ Visualizzare Storico e Scoring

#### Storico
- **Home** → **Storico** (chiede PIN se impostato)
- Tabella con tutti i test: data, paziente, test, punteggio, durata
- Clicca una riga → dettagli completi

**Azioni dal dettaglio:**
- 🖨️ **Stampa/PDF** → apre print dialog (salva come PDF da lì)
- ⬇️ **Scarica PDF** → genera PDF direttamente
- ✉️ **Email** → genera mailto con report in testo
- 🗑️ **Elimina** → rimuove questo test

#### Scoring
- **Home** → **Scoring**
- Seleziona paziente → visualizza tutti i test
- Clicca test → vedi scoring completo (punteggio + interpretazione)
- Scarica PDF o stampa

---

## 🔒 Protezione Dati

### Impostare PIN

1. **Home** → **Impostazioni**
2. Sezione **PIN di protezione**
3. Digita PIN (es. `1234`)
4. Clicca **"Salva PIN"**
5. Optionally: ✓ **"Ricorda questa sessione"**
   - Se spuntato: accedi una volta per sessione browser
   - Se non spuntato: chiedi PIN ad ogni accesso

### Rimuovere PIN
- **Impostazioni** → **"Rimuovi PIN"**

---

## 💾 Backup & Ripristino

### Esportare Dati (Backup)

1. **Home** → **Impostazioni**
2. Sezione **Export/Import**
3. Clicca **"📥 Esporta dati"**
4. Browser scarica file JSON:
   - `backup_YYYY-MM-DD.json`
   - Contiene: pazienti + test + impostazioni (non PIN)

### Importare Dati (Ripristino)

1. **Home** → **Impostazioni**
2. Sezione **Export/Import**
3. Clicca **"📂 Importa dati"**
4. Seleziona file JSON salvato
5. Scegli opzione:
   - **Sostituisci**: cancella tutto e carica nuovo
   - **Unisci**: mantieni attuali + aggiungi nuovi
6. Clicca **"Carica"**

⚠️ **Nota**: PIN non è incluso nel backup (per sicurezza)

---

## 📄 Generazione Report

### Opzioni Scaricamento PDF

**Tre modalità disponibili:**

| Modalità | Dove | Include Scoring? |
|----------|------|-----------------|
| 🖨️ **Stampa/PDF** | Storico, Pazienti, Scoring | Dipende dalla vista |
| ⬇️ **Scarica PDF** | Storico, Pazienti, Scoring | Sì, completo |
| ✉️ **Email** | Storico, Pazienti | Testo plain-text |

**Il PDF include:**
- Nome test e paziente
- Data compilazione
- Tempo di compilazione
- Punteggio totale
- Intervallo di interpretazione + nota clinica
- Dettaglio item-by-item

### Inviare via Email

1. Apri dettaglio test
2. Clicca **"✉️ Email (solo test)"**
3. Si apre email con:
   - **To**: email del paziente (da anagrafica)
   - **Subject**: test + paziente + data
   - **Body**: report in testo formattato
4. Modifica e invia dal tuo client email

---

## ⚙️ Configurazione Test

### I Test Disponibili (Predefiniti)

L'app include 3 test di esempio:

#### 1. **Ansia (0–3)**
- 5 item su scala Likert 0–3
- Intervalli: Basso (0-5), Moderato (6-10), Elevato (11-15)
- Uso: screening ansia generalizzata

#### 2. **Umore (1–4)**
- 4 item su scala Likert 1–4
- Intervalli: Basso (4-7), Intermedio (8-11), Elevato (12-16)
- Uso: screening depressione/disturbi dell'umore

#### 3. **Sonno (Sì/No)**
- 4 item sì/no (0/1)
- Intervalli: Basso (0-1), Moderato (2-3), Elevato (4+)
- Uso: screening difficoltà sonno

### Aggiungere Nuovi Test (Avanzato)

Modifica il file `assets/app.js`:

```javascript
const TEST_DEFINITIONS = [
  // ... test esistenti ...
  {
    id: "nuovo_test",
    name: "Mio Test Personalizzato",
    description: "Descrizione breve",
    scale: [
      { value: 0, label: "0 - Non affatto" },
      { value: 1, label: "1 - Un po'" },
      { value: 2, label: "2 - Molto" }
    ],
    items: [
      { id: "q1", text: "Prima domanda?" },
      { id: "q2", text: "Seconda domanda?" }
    ],
    scoring: {
      ranges: [
        { min: 0, max: 2, label: "Basso", note: "Niente di preoccupante" },
        { min: 3, max: 4, label: "Elevato", note: "Da monitorare" }
      ]
    }
  }
];
```

Salva e reload il browser.

---

## 🐛 Troubleshooting

### "Rimango bloccato sulla Home"
- Verifica che `assets/app.js` e `assets/style.css` si carichino (F12 → Network)
- Se 404: il server non trova i file – assicurati di essere nella cartella giusta
- Reload pagina (Cmd+R su Mac, Ctrl+R su Windows)

### "I dati scompaiono quando chiudo il browser"
- **Normale**: i dati sono in localStorage del browser
- Se cancelli cache/dati di navigazione, i dati vanno persi
- **Soluzione**: backup regolari con "Esporta dati"

### "Il PDF non si scarica"
- Verifica che html2pdf.js si carichi (F12 → Network, cerca `html2pdf`)
- Se fallisce: servono librerie CDN (leggi FAQ internet)
- **Alternativa**: usa 🖨️ **Stampa/PDF** → salva come PDF da print dialog

### "Su iPad non vedo il pulsante Back Home"
- Normal su iPad in landscape – riprova in portrait
- Se ancora bloccato: reload pagina

### "Dimentico il PIN"
- Purtroppo non è recoverable (per sicurezza)
- **Soluzione**: cancella localStorage del browser e ricomincia
  - Safari iPad: Impostazioni → [Nome browser] → Cronologia → Cancella dati di navigazione

---

## 📋 Dettagli Tecnici

### Architettura

```
┌─ index.html (462 linee)
│  ├─ Markup puro
│  └─ Link a assets/
│
├─ assets/app.js (1626 linee)
│  ├─ TEST_DEFINITIONS (test predefiniti)
│  ├─ Storage helpers (localStorage)
│  ├─ UI rendering (showView, renderPatients, etc.)
│  └─ Business logic (scoring, filtering, etc.)
│
└─ assets/style.css (453 linee)
   ├─ Theme (gradients, colors)
   ├─ Components (buttons, cards, modals)
   └─ Responsive (mobile-first, iPad-friendly)
```

### Storage Keys (localStorage)
```javascript
"ilaria_psy_tests_v1"          // Test results array
"ilaria_psy_tests_patients"    // Patients array
"ilaria_psy_tests_pin"         // PIN hash (se impostato)
"ilaria_psy_tests_pin_session_ok"  // Session flag
"ilaria_psy_tests_pin_remember"    // Remember session pref
```

### Dipendenze Esterne
- **html2pdf.js** (CDN) – Generazione PDF client-side
- **Nient'altro** – Zero dipendenze npm, puro JavaScript vanilla

### Compatibilità Browser
✅ Chrome/Chromium (80+)  
✅ Safari (iPad 12+, iOS 12+)  
✅ Firefox (75+)  
✅ Edge (79+)  

---

## 📝 Versione & Changelog

**Versione attuale:** 0.2  
**Ultimo aggiornamento:** 2025-11-30

### v0.2 (2025-11-30)
- ✨ Generazione PDF con html2pdf.js
- ✨ Pulsante "Elimina paziente" con opzioni
- 🔧 Refactor: separazione JS/CSS in file esterni
- 🐛 Fix navigazione tra pagine

### v0.1 (2025-11-28)
- Rilascio iniziale
- CRUD pazienti, somministrazione test, scoring
- PIN di protezione, export/import JSON

Per il changelog completo: vedi `CHANGELOG.md`

---

## 🤝 Contribuire

Issues e suggerimenti? Apri una GitHub Issue:  
👉 [robertovendrame/webapp-test-psicologi/issues](https://github.com/robertovendrame/webapp-test-psicologi/issues)

---

## 📄 Licenza

Uso privato/interno. Per redistribuzione contatta autore.

---

## 👨‍💻 Autore

**Roberto Vendrame**  
📧 [GitHub Profile](https://github.com/robertovendrame)

---

## ❓ FAQ

**D: È sicuro inserire dati reali di pazienti?**  
R: Sì, i dati rimangono locali sul tuo dispositivo. Non vengono mai inviati a server. Usa PIN per proteggere lo storico.

**D: Posso usare l'app senza internet?**  
R: Una volta caricata, sì. Solo il primo caricamento ha bisogno di CDN per html2pdf.js. Successivamente puoi usare offline.

**D: Posso personalizzare i test?**  
R: Sì! Modifica `TEST_DEFINITIONS` in `assets/app.js` (vedi sezione "Aggiungere Nuovi Test").

**D: I dati si sincronizzano tra dispositivi?**  
R: No, rimangono solo locali. Usa export/import per sincronizzare manualmente.

**D: Posso condividere i dati con un collega?**  
R: Esporta dati → invia file JSON → collega importa. I dati si mergeano (opzione "Unisci").

**D: Qual è il limite di pazienti/test?**  
R: localStorage permette ~5-10MB per dominio. Circa 500+ pazienti con 50+ test ciascuno prima di raggiungere limite.

**D: Come faccio backup automatico?**  
R: Usa "Esporta dati" settimanalmente. Ideale automatizzare con uno script bash.

---

**Buona fortuna con Ilaria Tests! 🚀**
