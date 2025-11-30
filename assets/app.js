  /********** COSTANTI / CHIAVI STORAGE **********/
  const APP_NAME = "Ilaria Tests";
  const STORAGE_KEY = "ilaria_psy_tests_v1";
  const PIN_KEY = "ilaria_psy_tests_pin";
  const PIN_SESSION_OK_KEY = "ilaria_psy_tests_pin_session_ok";
  const PIN_REMEMBER_SESSION_KEY = "ilaria_psy_tests_pin_remember";
  const PATIENTS_KEY = "ilaria_psy_tests_patients";
  const LOGIN_SESSION_KEY = "ilaria_psy_tests_login_session";
  const APP_PASSWORD = "2525"; // Password di accesso all'app

  /********** TEST – 3 MODELLI ESEMPIO **********/
  const TEST_DEFINITIONS = [
    {
      id: "ansia_likert",
      name: "Esempio – Ansia (0–3)",
      description: "Scala generica di ansia con punteggio 0–3 per item.",
      scale: [
        { value: 0, label: "0 - Mai" },
        { value: 1, label: "1 - Raramente" },
        { value: 2, label: "2 - Spesso" },
        { value: 3, label: "3 - Sempre" }
      ],
      items: [
        { id: "q1", text: "Mi sento spesso in allarme o preoccupata/o." },
        { id: "q2", text: "Ho la sensazione di non riuscire a rilassarmi." },
        { id: "q3", text: "Provo tensione muscolare (es. spalle, mandibola)." },
        { id: "q4", text: "Mi preoccupo per molte cose contemporaneamente." },
        { id: "q5", text: "Mi sento agitata/o senza un motivo chiaro." }
      ],
      scoring: {
        ranges: [
          { min: 0,  max: 5,  label: "Basso",    note: "Sintomi ansiosi lievi o assenti." },
          { min: 6,  max: 10, label: "Moderato", note: "Sintomi ansiosi presenti, da monitorare." },
          { min: 11, max: 15, label: "Elevato",  note: "Sintomi ansiosi significativi." }
        ]
      }
    },
    {
      id: "umore_likert",
      name: "Esempio – Umore (1–4)",
      description: "Scala generica dell’umore con valori da 1 (per niente) a 4 (molto).",
      scale: [
        { value: 1, label: "1 - Per niente" },
        { value: 2, label: "2 - Poco" },
        { value: 3, label: "3 - Abbastanza" },
        { value: 4, label: "4 - Molto" }
      ],
      items: [
        { id: "q1", text: "Nelle ultime due settimane mi sono sentita/o triste." },
        { id: "q2", text: "Ho perso interesse per attività che solitamente mi piacciono." },
        { id: "q3", text: "Mi sono sentita/o senza energie." },
        { id: "q4", text: "Ho avuto difficoltà a sentirmi soddisfatta/o." }
      ],
      scoring: {
        ranges: [
          { min: 4,  max: 7,  label: "Basso",      note: "Umore tendenzialmente conservato." },
          { min: 8,  max: 11, label: "Intermedio", note: "Possibili segnali di calo del tono dell’umore." },
          { min: 12, max: 16, label: "Elevato",    note: "Maggiore compromissione del tono dell’umore." }
        ]
      }
    },
    {
      id: "sonno_yesno",
      name: "Esempio – Sonno (Sì/No)",
      description: "Breve check-list di difficoltà legate al sonno.",
      scale: [
        { value: 0, label: "No" },
        { value: 1, label: "Sì" }
      ],
      items: [
        { id: "q1", text: "Faccio fatica ad addormentarmi." },
        { id: "q2", text: "Mi sveglio più volte durante la notte." },
        { id: "q3", text: "Mi sveglio molto prima del previsto." },
        { id: "q4", text: "Mi sento stanca/o durante il giorno per colpa del sonno." }
      ],
      scoring: {
        ranges: [
          { min: 0, max: 1, label: "Basso",    note: "Difficoltà di sonno poco frequenti." },
          { min: 2, max: 3, label: "Moderato", note: "Difficoltà di sonno presenti." },
          { min: 4, max: 99,label: "Elevato",  note: "Difficoltà di sonno marcate." }
        ]
      }
    }
  ];

  /********** VARIABILI DI STATO **********/
  let currentPatientId = null;
  let currentTestId = null;
  let currentTestStartTime = null;
  let newTestStep = 1;
  let timerInterval = null;

  let currentPatientFormId = null;
  let currentHistoryRecord = null;
  let currentHistoryTest = null;

  let currentPatientTestRecord = null;
  let currentPatientTest = null;

  let currentScoringRecord = null;
  let currentScoringTest = null;

  /********** UTILITY GENERALI **********/
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function computeAge(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age < 0 ? "" : String(age);
  }

  function formatDuration(ms) {
    if (!ms || ms <= 0) return "";
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function findTestById(id) {
    return TEST_DEFINITIONS.find(t => t.id === id) || null;
  }

  function computeScore(test, answers) {
    let total = 0;
    for (const item of test.items) {
      const v = answers[item.id];
      if (typeof v === "number") total += v;
    }
    let interpretation = null;
    if (test.scoring && Array.isArray(test.scoring.ranges)) {
      for (const r of test.scoring.ranges) {
        if (total >= r.min && total <= r.max) {
          interpretation = r;
          break;
        }
      }
    }
    return { total, interpretation };
  }

  /********** STORAGE – TEST **********/
  function loadResults() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveResults(results) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }

  /********** STORAGE – PIN **********/
  function getStoredPin() {
    return localStorage.getItem(PIN_KEY) || "";
  }

  function setStoredPin(pin) {
    if (!pin) localStorage.removeItem(PIN_KEY);
    else localStorage.setItem(PIN_KEY, pin);
  }

  function getRememberSession() {
    return localStorage.getItem(PIN_REMEMBER_SESSION_KEY) === "1";
  }

  function setRememberSession(val) {
    localStorage.setItem(PIN_REMEMBER_SESSION_KEY, val ? "1" : "0");
  }

  function setPinSessionOk() {
    localStorage.setItem(PIN_SESSION_OK_KEY, "1");
  }

  function isPinSessionOk() {
    return localStorage.getItem(PIN_SESSION_OK_KEY) === "1";
  }

  function clearPinSessionOk() {
    localStorage.removeItem(PIN_SESSION_OK_KEY);
  }

  /********** AUTH: PBKDF2 (Web Crypto) + WebAuthn helpers **********/
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function base64ToArrayBuffer(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  async function deriveKeyBits(password, saltB64, iterations = 150000) {
    const enc = new TextEncoder();
    const pwBuf = enc.encode(password);
    const key = await crypto.subtle.importKey('raw', pwBuf, 'PBKDF2', false, ['deriveBits']);
    const salt = saltB64 ? new Uint8Array(base64ToArrayBuffer(saltB64)) : crypto.getRandomValues(new Uint8Array(16));
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      key,
      256
    );
    return { salt: arrayBufferToBase64(salt.buffer), derived: arrayBufferToBase64(derived), iterations };
  }

  function getStoredAuth() {
    try { return JSON.parse(localStorage.getItem('app_auth') || 'null'); } catch { return null; }
  }

  function setStoredAuth(obj) {
    localStorage.setItem('app_auth', JSON.stringify(obj));
  }

  async function setPassword(password) {
    const { salt, derived, iterations } = await deriveKeyBits(password, null);
    setStoredAuth({ salt, hash: derived, iterations });
  }

  async function removePassword() {
    localStorage.removeItem('app_auth');
  }

  async function verifyPassword(password) {
    const auth = getStoredAuth();
    if (!auth) return false;
    const { derived } = await deriveKeyBits(password, auth.salt, auth.iterations || 150000);
    // constant-time compare
    const a = base64ToArrayBuffer(derived);
    const b = base64ToArrayBuffer(auth.hash);
    if (a.byteLength !== b.byteLength) return false;
    const aa = new Uint8Array(a), bb = new Uint8Array(b);
    let diff = 0;
    for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
    return diff === 0;
  }

  async function ensureAuthInitialized() {
    const auth = getStoredAuth();
    if (!auth) {
      // migrate default APP_PASSWORD (only first-run) to stored hash
      try {
        const { salt, derived, iterations } = await deriveKeyBits(APP_PASSWORD, null);
        setStoredAuth({ salt, hash: derived, iterations });
        console.log('Auth initialized (migrated default password)');
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      }
    }
  }

  // WebAuthn helpers (client-only simplified flow)
  function getStoredWebAuthnId() {
    return localStorage.getItem('webauthn_cred') || null;
  }

  function setStoredWebAuthnId(b64) {
    if (!b64) localStorage.removeItem('webauthn_cred');
    else localStorage.setItem('webauthn_cred', b64);
  }

  function isWebAuthnSupported() {
    return !!(window.PublicKeyCredential && navigator.credentials);
  }

  async function registerWebAuthn() {
    if (!isWebAuthnSupported()) throw new Error('WebAuthn non supportato');
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const publicKey = {
      challenge: challenge,
      rp: { name: APP_NAME },
      user: { id: userId, name: 'local', displayName: 'Local User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      attestation: 'none'
    };
    const cred = await navigator.credentials.create({ publicKey });
    if (!cred) throw new Error('Creazione credenziale fallita');
    const rawId = cred.rawId;
    const b64 = arrayBufferToBase64(rawId);
    setStoredWebAuthnId(b64);
    return b64;
  }

  async function authenticateWebAuthn() {
    if (!isWebAuthnSupported()) throw new Error('WebAuthn non supportato');
    const idB64 = getStoredWebAuthnId();
    if (!idB64) throw new Error('Nessuna credenziale registrata');
    const allow = [{ type: 'public-key', id: new Uint8Array(base64ToArrayBuffer(idB64)) }];
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const publicKey = { challenge, allowCredentials: allow, timeout: 60000, userVerification: 'preferred' };
    const assertion = await navigator.credentials.get({ publicKey });
    if (!assertion) throw new Error('Autenticazione fallita');
    // In client-only scenario, success of get() is treated as proof of presence
    return true;
  }

  /********** STORAGE – PAZIENTI **********/
  function loadPatients() {
    let arr = [];
    try {
      const raw = localStorage.getItem(PATIENTS_KEY);
      if (raw) arr = JSON.parse(raw);
    } catch {
      arr = [];
    }

    // Vecchio formato: array di stringhe (nomi)
    if (Array.isArray(arr) && arr.length && typeof arr[0] === "string") {
      arr = arr.map((name, idx) => ({
        id: `pat_${idx}_${name.toLowerCase().replace(/\s+/g, "_")}`,
        name,
        birthDate: "",
        sex: "",
        email: "",
        notes: "",
        createdAt: Date.now()
      }));
    }

    if (!Array.isArray(arr)) arr = [];

    // Se non ci sono pazienti, prova a crearli dallo storico
    if (!arr.length) {
      const results = loadResults();
      const names = new Set();
      results.forEach(r => {
        const n = (r.patientName || r.patient || "").trim();
        if (n) names.add(n);
      });
      let idx = 0;
      arr = Array.from(names).map(name => ({
        id: `pat_${idx++}_${name.toLowerCase().replace(/\s+/g, "_")}`,
        name,
        birthDate: "",
        sex: "",
        email: "",
        notes: "",
        createdAt: Date.now()
      }));
    }

    savePatients(arr);
    return arr;
  }

  function savePatients(list) {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(list));
  }

  function findPatientById(id) {
    const patients = loadPatients();
    return patients.find(p => p.id === id) || null;
  }

  function findPatientForRecord(record) {
    const patients = loadPatients();
    if (record.patientId) {
      const p = patients.find(p => p.id === record.patientId);
      if (p) return p;
    }
    const name = (record.patientName || record.patient || "").trim().toLowerCase();
    if (!name) return null;
    return patients.find(p => p.name.trim().toLowerCase() === name) || null;
  }

  function upsertPatient(patient) {
    const patients = loadPatients();
    const idx = patients.findIndex(p => p.id === patient.id);
    if (idx === -1) patients.push(patient);
    else patients[idx] = patient;
    savePatients(patients);
  }

  /********** VIEW HANDLING **********/
  const views = {
    home: document.getElementById("view-home"),
    new: document.getElementById("view-new"),
    history: document.getElementById("view-history"),
    settings: document.getElementById("view-settings"),
    pinLock: document.getElementById("view-pin-lock"),
    patients: document.getElementById("view-patients"),
    scoring: document.getElementById("view-scoring")
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      if (!el) return;
      if (key === name) el.classList.remove("hidden");
      else el.classList.add("hidden");
    });
  }

  /********** NUOVO TEST – DOMANDE **********/
  function renderQuestionsFor(test) {
    const container = document.getElementById("questions-container");
    container.innerHTML = "";

    if (!test) {
      container.innerHTML = "<div class='muted'>Seleziona paziente e test per iniziare la compilazione.</div>";
      return;
    }

    test.items.forEach(item => {
      const qDiv = document.createElement("div");
      qDiv.className = "question";

      const label = document.createElement("div");
      label.className = "question-text";
      label.textContent = item.text;
      qDiv.appendChild(label);

      const optsDiv = document.createElement("div");
      optsDiv.className = "options";

      test.scale.forEach(scaleOpt => {
        const pill = document.createElement("label");
        pill.className = "option-pill";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = item.id;
        input.value = scaleOpt.value;

        pill.appendChild(input);
        const span = document.createElement("span");
        span.textContent = scaleOpt.label;
        pill.appendChild(span);

        optsDiv.appendChild(pill);
      });

      qDiv.appendChild(optsDiv);
      container.appendChild(qDiv);
    });
  }

  function getAnswersFromForm() {
    const test = getCurrentTest();
    if (!test) return {};
    const answers = {};
    test.items.forEach(item => {
      const radios = document.querySelectorAll(`input[name="${item.id}"]`);
      let chosen = null;
      radios.forEach(r => {
        if (r.checked) chosen = r.value;
      });
      if (chosen !== null) {
        answers[item.id] = Number(chosen);
      }
    });
    return answers;
  }

  function clearResult() {
    const resultDiv = document.getElementById("result-summary");
    if (!resultDiv) return;
    resultDiv.classList.add("muted");
    resultDiv.innerHTML = "Compila il test e premi “Salva test” per vedere il punteggio.";
    const status = document.getElementById("save-status");
    if (status) status.textContent = "";
  }

  function buildTestDetailHTML(test, record, options = {}) {
    const includeScoring = options.includeScoring !== false;
    const { total, interpretation } = computeScore(test, record.answers);

    let html = "";
    html += `<p><strong>Paziente:</strong> ${record.patientName || record.patient || "—"}</p>`;
    html += `<p><strong>Data:</strong> ${formatDate(record.date)}</p>`;
    if (record.durationMs) {
      html += `<p><strong>Tempo di compilazione:</strong> ${formatDuration(record.durationMs)}</p>`;
    }

    if (includeScoring) {
      html += `<p><strong>Punteggio totale:</strong> ${total}</p>`;
      if (interpretation) {
        html += `<p><strong>Intervallo:</strong> ${interpretation.label}</p>`;
        if (interpretation.note) {
          html += `<p class="muted">${interpretation.note}</p>`;
        }
      }
    }

    if (record.notes) {
      html += `<p><strong>Note cliniche:</strong><br>${record.notes.replace(/\n/g, "<br>")}</p>`;
    }

    html += `<h3>Dettaglio item</h3><ul>`;
    test.items.forEach(item => {
      const val = record.answers[item.id];
      const scaleLabel = test.scale.find(s => s.value === val)?.label || "Non compilato";
      html += `<li><strong>${item.text}</strong><br><span class="muted">${scaleLabel}</span></li>`;
    });
    html += `</ul>`;
    return html;
  }

  function showResult(test, record) {
    const resultDiv = document.getElementById("result-summary");
    resultDiv.classList.remove("muted");
    resultDiv.innerHTML = `
      <div><span class="badge">${test.name}</span></div>
      ${buildTestDetailHTML(test, record)}
    `;
  }

  function getCurrentTest() {
    if (!currentTestId) return null;
    return findTestById(currentTestId);
  }

  function getCurrentPatient() {
    if (!currentPatientId) return null;
    return findPatientById(currentPatientId);
  }

  /********** NUOVO TEST – STEP LOGIC **********/
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    stopTimer();
    currentTestStartTime = Date.now();
    const el = document.getElementById("new-step-3-timer");
    if (!el) return;
    timerInterval = setInterval(() => {
      if (!currentTestStartTime) return;
      const diff = Date.now() - currentTestStartTime;
      el.textContent = `Tempo: ${formatDuration(diff) || "0:00"}`;
    }, 1000);
  }

  function setNewTestStep(step) {
    newTestStep = step;
    document.getElementById("new-test-step-title").textContent = `Nuovo test – Step ${step}/3`;

    const step1 = document.getElementById("new-step-1-card");
    const step2 = document.getElementById("new-step-2-card");
    const step3Cards = document.querySelectorAll(".new-step-3");

    if (step === 1) {
      step1.classList.remove("hidden");
      step2.classList.add("hidden");
      step3Cards.forEach(el => el.classList.add("hidden"));
      stopTimer();
      currentTestStartTime = null;
    } else if (step === 2) {
      step1.classList.add("hidden");
      step2.classList.remove("hidden");
      step3Cards.forEach(el => el.classList.add("hidden"));
      stopTimer();
      currentTestStartTime = null;
    } else if (step === 3) {
      step1.classList.add("hidden");
      step2.classList.add("hidden");
      step3Cards.forEach(el => el.classList.remove("hidden"));
      refreshNewTestUI();
      startTimer();
    }
  }

  function resetNewTestFlow() {
    currentPatientId = null;
    currentTestId = null;
    currentTestStartTime = null;
    stopTimer();

    const sel = document.getElementById("new-patient-select");
    if (sel) sel.value = "";

    const notes = document.getElementById("notes");
    if (notes) notes.value = "";

    const dateInput = document.getElementById("session-date");
    if (dateInput) {
      const today = new Date();
      dateInput.value = today.toISOString().slice(0, 10);
    }

    clearResult();
    const timerEl = document.getElementById("new-step-3-timer");
    if (timerEl) timerEl.textContent = "Tempo: 0:00";

    setNewTestStep(1);
    refreshNewTestUI();
  }

  function populateNewPatientSelect() {
    const sel = document.getElementById("new-patient-select");
    const patients = loadPatients();
    sel.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Seleziona paziente…";
    sel.appendChild(placeholder);

    patients.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });

    const status = document.getElementById("new-step-1-status");
    if (!patients.length) {
      status.textContent = "Nessun paziente: aggiungilo dalla sezione “Pazienti”.";
    } else {
      status.textContent = "";
    }
  }

  function renderTestButtons() {
    const container = document.getElementById("test-buttons-container");
    container.innerHTML = "";
    TEST_DEFINITIONS.forEach(test => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "home-card-btn";
      const iconDiv = document.createElement("div");
      iconDiv.className = "home-card-icon";
      iconDiv.textContent = "🧪";
      const titleDiv = document.createElement("div");
      titleDiv.className = "test-card-title";
      titleDiv.textContent = test.name;
      const descDiv = document.createElement("div");
      descDiv.className = "test-card-desc";
      descDiv.textContent = test.description;

      btn.appendChild(iconDiv);
      btn.appendChild(titleDiv);
      btn.appendChild(descDiv);

      btn.addEventListener("click", () => {
        currentTestId = test.id;
        const patient = getCurrentPatient();
        document.getElementById("new-step-3-patient-label").textContent = patient ? patient.name : "—";
        document.getElementById("new-step-3-test-label").textContent = test.name;
        setNewTestStep(3);
      });

      container.appendChild(btn);
    });
  }

  function refreshNewTestUI() {
    const patient = getCurrentPatient();
    const test = getCurrentTest();

    const step2Name = document.getElementById("new-step-2-patient-name");
    if (step2Name) step2Name.textContent = patient ? patient.name : "—";

    updateTestHistoryNote();

    const questions = document.getElementById("questions-container");
    if (newTestStep !== 3 || !patient || !test) {
      if (questions) {
        questions.innerHTML = "<div class='muted'>Seleziona paziente e test per iniziare la compilazione.</div>";
      }
      clearResult();
      return;
    }

    renderQuestionsFor(test);
    clearResult();
  }

  /********** NOTA: TEST GIÀ FATTI (PAZIENTE + TEST) **********/
  function updateTestHistoryNote() {
    const noteEl = document.getElementById("test-history-note");
    if (!noteEl) return;

    const patient = getCurrentPatient();
    const test = getCurrentTest();

    if (!patient) {
      noteEl.textContent = "Seleziona un paziente per vedere se ha già eseguito questo test.";
      return;
    }

    if (!test) {
      noteEl.textContent = "Seleziona un test per vedere se è già stato compilato da questo paziente.";
      return;
    }

    const results = loadResults().filter(r => {
      const sameTest = r.testId === test.id;
      if (!sameTest) return false;
      if (r.patientId && r.patientId === patient.id) return true;
      const name = (r.patientName || r.patient || "").trim().toLowerCase();
      return name === patient.name.trim().toLowerCase();
    });

    if (!results.length) {
      noteEl.textContent = "Per questo paziente non risulta ancora nessun test di questo tipo salvato.";
      return;
    }

    const latest = results.reduce((a, b) =>
      (a.createdAt || 0) > (b.createdAt || 0) ? a : b
    );
    const d = formatDate(latest.date) || "—";
    noteEl.textContent = `Ultimo ${test.name} per questo paziente salvato il ${d}.`;
  }

  /********** STORICO **********/
  function renderHistory() {
    const results = loadResults();
    const emptyDiv = document.getElementById("history-empty");
    const wrapper = document.getElementById("history-table-wrapper");
    const body = document.getElementById("history-table-body");
    body.innerHTML = "";

    if (!results.length) {
      emptyDiv.classList.remove("hidden");
      wrapper.classList.add("hidden");
      document.getElementById("history-detail-card").classList.add("hidden");
      return;
    }

    emptyDiv.classList.add("hidden");
    wrapper.classList.remove("hidden");

    const sorted = [...results].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    sorted.forEach(record => {
      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.dataset.id = record.id;

      const test = findTestById(record.testId);
      const { total } = test ? computeScore(test, record.answers) : { total: "" };

      const tdDate = document.createElement("td");
      tdDate.textContent = formatDate(record.date);

      const tdPatient = document.createElement("td");
      tdPatient.textContent = record.patientName || record.patient || "—";

      const tdTest = document.createElement("td");
      tdTest.textContent = test ? test.name : record.testId;

      const tdScore = document.createElement("td");
      tdScore.textContent = total;

      const tdDur = document.createElement("td");
      tdDur.textContent = record.durationMs ? formatDuration(record.durationMs) : "";

      const tdActions = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.className = "btn outline small";
      delBtn.textContent = "Elimina";
      delBtn.addEventListener("click", ev => {
        ev.stopPropagation();
        deleteRecord(record.id);
      });
      tdActions.appendChild(delBtn);

      tr.appendChild(tdDate);
      tr.appendChild(tdPatient);
      tr.appendChild(tdTest);
      tr.appendChild(tdScore);
      tr.appendChild(tdDur);
      tr.appendChild(tdActions);

      tr.addEventListener("click", () => showHistoryDetail(record.id));
      body.appendChild(tr);
    });
  }

  function deleteRecord(id) {
    if (!confirm("Eliminare definitivamente questo test?")) return;
    const results = loadResults();
    const filtered = results.filter(r => r.id !== id);
    saveResults(filtered);

    renderHistory();
    renderPatientList();

    const patient = currentPatientFormId ? findPatientById(currentPatientFormId) : null;
    if (patient) renderPatientTests(patient);

    const scoringPatientSel = document.getElementById("scoring-patient-select");
    if (scoringPatientSel && scoringPatientSel.value) {
      renderScoringTests(scoringPatientSel.value);
    }

    currentHistoryRecord = null;
    currentHistoryTest = null;
    currentPatientTestRecord = null;
    currentPatientTest = null;
    currentScoringRecord = null;
    currentScoringTest = null;

    document.getElementById("history-detail-card").classList.add("hidden");
    document.getElementById("patient-test-detail-card").classList.add("hidden");
    document.getElementById("scoring-detail-card").classList.add("hidden");
  }

  function showHistoryDetail(id) {
    const results = loadResults();
    const record = results.find(r => r.id === id);
    if (!record) return;

    const test = findTestById(record.testId);
    if (!test) return;

    currentHistoryRecord = record;
    currentHistoryTest = test;

    const detailCard = document.getElementById("history-detail-card");
    const title = document.getElementById("history-detail-title");
    const body = document.getElementById("history-detail-body");

    title.textContent = `${test.name} – ${record.patientName || record.patient || "Paziente"}`;
    body.innerHTML = buildTestDetailHTML(test, record);

    detailCard.classList.remove("hidden");

    // Prepara report per stampa (test-only)
    buildPrintableReport(test, record, { mode: "test" });
  }

  /********** PIN / ACCESSO STORICO **********/
  function needPinForHistory() {
    const pin = getStoredPin();
    return !!pin;
  }

  function canAccessHistoryDirectly() {
    if (!needPinForHistory()) return true;
    if (!getRememberSession()) return false;
    return isPinSessionOk();
  }

  function openHistoryWithPinCheck() {
    if (!needPinForHistory()) {
      showView("history");
      renderHistory();
      return;
    }

    if (canAccessHistoryDirectly()) {
      showView("history");
      renderHistory();
      return;
    }

    document.getElementById("pin-lock-input").value = "";
    document.getElementById("pin-lock-status").textContent = "";
    showView("pinLock");
  }

  function checkPinAndUnlock() {
    const input = document.getElementById("pin-lock-input").value;
    const stored = getStoredPin();
    const status = document.getElementById("pin-lock-status");

    if (!stored) {
      status.textContent = "Nessun PIN impostato. Impostalo nelle impostazioni.";
      return;
    }

    if (input === stored) {
      status.textContent = "";
      if (getRememberSession()) {
        setPinSessionOk();
      }
      showView("history");
      renderHistory();
    } else {
      status.textContent = "PIN errato.";
    }
  }

  /********** REPORT (STAMPA + EMAIL) **********/
  // mode: "test" (nessuno scoring) | "scoring" (include punteggio/intervalli)
  function buildPrintableReport(test, record, options = {}) {
    const mode = options.mode || "test";
    const includeScoring = mode === "scoring";

    const report = document.getElementById("printable-report");
    const { total, interpretation } = computeScore(test, record.answers);

    let html = "";
    html += `<h1>${test.name}</h1>`;
    html += `<p><strong>Paziente:</strong> ${record.patientName || record.patient || "—"}</p>`;
    html += `<p><strong>Data:</strong> ${formatDate(record.date)}</p>`;
    if (record.durationMs) {
      html += `<p><strong>Tempo di compilazione:</strong> ${formatDuration(record.durationMs)}</p>`;
    }

    if (includeScoring) {
      html += `<p><strong>Punteggio totale:</strong> ${total}</p>`;
      if (interpretation) {
        html += `<p><strong>Intervallo:</strong> ${interpretation.label}</p>`;
        if (interpretation.note) {
          html += `<p>${interpretation.note}</p>`;
        }
      }
    }

    if (record.notes) {
      html += `<h2>Note cliniche</h2>`;
      html += `<p>${record.notes.replace(/\n/g, "<br>")}</p>`;
    }

    html += `<h2>Risposte item</h2>`;
    html += `<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">`;
    html += `<thead><tr><th style="border-bottom:1px solid #ccc;text-align:left;">Item</th><th style="border-bottom:1px solid #ccc;text-align:left;">Risposta</th></tr></thead><tbody>`;
    test.items.forEach(item => {
      const val = record.answers[item.id];
      const scaleLabel = test.scale.find(s => s.value === val)?.label || "";
      html += `<tr><td style="border-bottom:1px solid #eee;padding:4px 2px;">${item.text}</td><td style="border-bottom:1px solid #eee;padding:4px 2px;">${scaleLabel}</td></tr>`;
    });
    html += `</tbody></table>`;

    report.innerHTML = html;
  }

  function buildPlainTextReport(test, record, options = {}) {
    const mode = options.mode || "test";
    const includeScoring = mode === "scoring";

    const lines = [];
    const { total, interpretation } = computeScore(test, record.answers);
    lines.push(test.name);
    lines.push(`Paziente: ${record.patientName || record.patient || "—"}`);
    lines.push(`Data: ${formatDate(record.date)}`);
    if (record.durationMs) {
      lines.push(`Tempo di compilazione: ${formatDuration(record.durationMs)}`);
    }
    if (includeScoring) {
      lines.push(`Punteggio totale: ${total}`);
      if (interpretation) {
        let line = `Intervallo: ${interpretation.label}`;
        if (interpretation.note) line += ` - ${interpretation.note}`;
        lines.push(line);
      }
    }
    if (record.notes) {
      lines.push("");
      lines.push("Note cliniche:");
      lines.push(record.notes);
    }
    lines.push("");
    lines.push("Dettaglio item:");
    test.items.forEach(item => {
      const val = record.answers[item.id];
      const scaleLabel = test.scale.find(s => s.value === val)?.label || "";
      lines.push(`- ${item.text} -> ${scaleLabel}`);
    });
    return lines.join("\n");
  }

  function sendEmailReport(test, record, options = {}) {
    const mode = options.mode || "test";
    const patient = findPatientForRecord(record);
    const toEmail = patient && patient.email ? encodeURIComponent(patient.email) : "";
    const toPart = toEmail ? `${toEmail}` : "";
    const subject = encodeURIComponent(`${test.name} – ${record.patientName || record.patient || "Paziente"} (${formatDate(record.date)})`);
    const body = encodeURIComponent(buildPlainTextReport(test, record, { mode }));
    window.location.href = `mailto:${toPart}?subject=${subject}&body=${body}`;
  }

  /********** PAZIENTI – UI **********/
  function resetPatientForm() {
    currentPatientFormId = null;
    document.getElementById("patient-form-name").value = "";
    document.getElementById("patient-form-birth").value = "";
    document.getElementById("patient-form-sex").value = "";
    document.getElementById("patient-form-email").value = "";
    document.getElementById("patient-form-notes").value = "";
    document.getElementById("patient-form-status").textContent = "";
    document.getElementById("patient-tests-card").classList.add("hidden");
    document.getElementById("patient-test-detail-card").classList.add("hidden");
  }

  function savePatientFromForm() {
    const name = document.getElementById("patient-form-name").value.trim();
    const birth = document.getElementById("patient-form-birth").value;
    const sex = document.getElementById("patient-form-sex").value;
    const email = document.getElementById("patient-form-email").value.trim();
    const notes = document.getElementById("patient-form-notes").value.trim();
    const status = document.getElementById("patient-form-status");

    if (!name) {
      status.textContent = "Inserisci almeno il nome del paziente.";
      return;
    }

    let patient;
    if (!currentPatientFormId) {
      patient = {
        id: `pat_${Date.now()}`,
        name,
        birthDate: birth,
        sex,
        email,
        notes,
        createdAt: Date.now()
      };
      currentPatientFormId = patient.id;
    } else {
      const existing = findPatientById(currentPatientFormId) || {
        id: currentPatientFormId,
        createdAt: Date.now()
      };
      patient = {
        ...existing,
        name,
        birthDate: birth,
        sex,
        email,
        notes
      };
    }

    upsertPatient(patient);
    status.textContent = "Paziente salvato.";
    renderPatientList();
    renderPatientTests(patient);

    // aggiorna selettori
    populateNewPatientSelect();
    populateScoringPatientSelect();
  }

  function renderPatientList() {
    const patients = loadPatients();
    const emptyDiv = document.getElementById("patients-empty");
    const wrapper = document.getElementById("patients-table-wrapper");
    const body = document.getElementById("patient-list-body");
    body.innerHTML = "";

    if (!patients.length) {
      emptyDiv.classList.remove("hidden");
      wrapper.classList.add("hidden");
      return;
    }

    emptyDiv.classList.add("hidden");
    wrapper.classList.remove("hidden");

    const sorted = [...patients].sort((a, b) =>
      a.name.localeCompare(b.name, "it", { sensitivity: "base" })
    );

    sorted.forEach(p => {
      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.dataset.id = p.id;

      const tdName = document.createElement("td");
      tdName.textContent = p.name;

      const tdAge = document.createElement("td");
      tdAge.textContent = computeAge(p.birthDate) || "";

      const tdSex = document.createElement("td");
      tdSex.textContent = p.sex || "";

      tr.appendChild(tdName);
      tr.appendChild(tdAge);
      tr.appendChild(tdSex);

      tr.addEventListener("click", () => loadPatientIntoForm(p.id));

      body.appendChild(tr);
    });
  }

  function loadPatientIntoForm(id) {
    const p = findPatientById(id);
    if (!p) return;
    currentPatientFormId = p.id;
    document.getElementById("patient-form-name").value = p.name || "";
    document.getElementById("patient-form-birth").value = p.birthDate || "";
    document.getElementById("patient-form-sex").value = p.sex || "";
    document.getElementById("patient-form-email").value = p.email || "";
    document.getElementById("patient-form-notes").value = p.notes || "";
    document.getElementById("patient-form-status").textContent = "";

    renderPatientTests(p);
  }

  function renderPatientTests(patient) {
    const card = document.getElementById("patient-tests-card");
    const title = document.getElementById("patient-tests-title");
    const empty = document.getElementById("patient-tests-empty");
    const wrapper = document.getElementById("patient-tests-table-wrapper");
    const body = document.getElementById("patient-tests-body");

    card.classList.remove("hidden");
    title.textContent = `Test di ${patient.name}`;
    body.innerHTML = "";

    const results = loadResults().filter(r => {
      if (r.patientId && r.patientId === patient.id) return true;
      const name = (r.patientName || r.patient || "").trim().toLowerCase();
      return name === patient.name.trim().toLowerCase();
    });

    if (!results.length) {
      empty.classList.remove("hidden");
      wrapper.classList.add("hidden");
      document.getElementById("patient-test-detail-card").classList.add("hidden");
      return;
    }

    empty.classList.add("hidden");
    wrapper.classList.remove("hidden");

    const sorted = [...results].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    sorted.forEach(r => {
      const test = findTestById(r.testId);
      const { total } = test ? computeScore(test, r.answers) : { total: "" };

      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.dataset.id = r.id;

      const tdDate = document.createElement("td");
      tdDate.textContent = formatDate(r.date);

      const tdTest = document.createElement("td");
      tdTest.textContent = test ? test.name : r.testId;

      const tdScore = document.createElement("td");
      tdScore.textContent = total;

      const tdDur = document.createElement("td");
      tdDur.textContent = r.durationMs ? formatDuration(r.durationMs) : "";

      tr.appendChild(tdDate);
      tr.appendChild(tdTest);
      tr.appendChild(tdScore);
      tr.appendChild(tdDur);

      tr.addEventListener("click", () => showPatientTestDetail(r.id));

      body.appendChild(tr);
    });
  }

  function showPatientTestDetail(id) {
    const results = loadResults();
    const record = results.find(r => r.id === id);
    if (!record) return;

    const test = findTestById(record.testId);
    if (!test) return;

    currentPatientTestRecord = record;
    currentPatientTest = test;

    const card = document.getElementById("patient-test-detail-card");
    const title = document.getElementById("patient-test-detail-title");
    const body = document.getElementById("patient-test-detail-body");

    title.textContent = `${test.name} – ${record.patientName || record.patient || "Paziente"}`;
    body.innerHTML = buildTestDetailHTML(test, record);

    card.classList.remove("hidden");

    // Prepara report per stampa (test-only)
    buildPrintableReport(test, record, { mode: "test" });
  }

  function beginNewTestForPatient(patientId) {
    currentPatientId = patientId;
    currentTestId = null;
    currentTestStartTime = null;
    stopTimer();

    populateNewPatientSelect();
    const sel = document.getElementById("new-patient-select");
    if (sel) sel.value = patientId;

    refreshNewTestUI();
    setNewTestStep(2);
    showView("new");
  }

  /********** SCORING – UI **********/
  function populateScoringPatientSelect() {
    const sel = document.getElementById("scoring-patient-select");
    const patients = loadPatients();
    sel.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Seleziona paziente…";
    sel.appendChild(placeholder);

    patients.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });
  }

  function renderScoringTests(patientId) {
    const empty = document.getElementById("scoring-tests-empty");
    const wrapper = document.getElementById("scoring-tests-table-wrapper");
    const body = document.getElementById("scoring-tests-body");
    const patient = findPatientById(patientId);
    body.innerHTML = "";

    if (!patient) {
      empty.textContent = "Seleziona un paziente per vedere i test disponibili.";
      empty.classList.remove("hidden");
      wrapper.classList.add("hidden");
      document.getElementById("scoring-detail-card").classList.add("hidden");
      return;
    }

    const results = loadResults().filter(r => {
      if (r.patientId && r.patientId === patient.id) return true;
      const name = (r.patientName || r.patient || "").trim().toLowerCase();
      return name === patient.name.trim().toLowerCase();
    });

    if (!results.length) {
      empty.textContent = "Per questo paziente non ci sono test salvati.";
      empty.classList.remove("hidden");
      wrapper.classList.add("hidden");
      document.getElementById("scoring-detail-card").classList.add("hidden");
      return;
    }

    empty.classList.add("hidden");
    wrapper.classList.remove("hidden");

    const sorted = [...results].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    sorted.forEach(r => {
      const test = findTestById(r.testId);
      const { total } = test ? computeScore(test, r.answers) : { total: "" };

      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.dataset.id = r.id;

      const tdDate = document.createElement("td");
      tdDate.textContent = formatDate(r.date);

      const tdTest = document.createElement("td");
      tdTest.textContent = test ? test.name : r.testId;

      const tdScore = document.createElement("td");
      tdScore.textContent = total;

      const tdDur = document.createElement("td");
      tdDur.textContent = r.durationMs ? formatDuration(r.durationMs) : "";

      tr.appendChild(tdDate);
      tr.appendChild(tdTest);
      tr.appendChild(tdScore);
      tr.appendChild(tdDur);

      tr.addEventListener("click", () => showScoringDetail(r.id));

      body.appendChild(tr);
    });
  }

  function showScoringDetail(id) {
    const results = loadResults();
    const record = results.find(r => r.id === id);
    if (!record) return;

    const test = findTestById(record.testId);
    if (!test) return;

    currentScoringRecord = record;
    currentScoringTest = test;

    const card = document.getElementById("scoring-detail-card");
    const title = document.getElementById("scoring-detail-title");
    const body = document.getElementById("scoring-detail-body");

    title.textContent = `${test.name} – ${record.patientName || record.patient || "Paziente"}`;
    body.innerHTML = buildTestDetailHTML(test, record, { includeScoring: true });

    card.classList.remove("hidden");

    buildPrintableReport(test, record, { mode: "scoring" });
  }

  /********** PAZIENTI – ELIMINA **********/

  function openConfirmDeletePatient() {
    const id = currentPatientFormId;
    const status = document.getElementById("patient-form-status");
    if (!id) {
      if (status) status.textContent = "Seleziona un paziente prima di eliminarlo.";
      return;
    }
    const p = findPatientById(id);
    if (!p) {
      if (status) status.textContent = "Paziente non trovato.";
      return;
    }
    const title = document.getElementById("confirm-delete-patient-title");
    const body = document.getElementById("confirm-delete-patient-body");
    if (title) title.textContent = `Conferma eliminazione`;
    if (body) body.textContent = `Confermi l'eliminazione del paziente "${p.name}"? Seleziona se eliminare anche i test associati.`;
    const modal = document.getElementById("confirm-delete-patient-modal");
    if (modal) modal.classList.add("active");
    if (modal) modal.classList.remove("hidden");
  }

  function closeConfirmDeletePatient() {
    const modal = document.getElementById("confirm-delete-patient-modal");
    if (modal) modal.classList.remove("active");
    if (modal) modal.classList.add("hidden");
  }

  function confirmDeletePatient() {
    const id = currentPatientFormId;
    if (!id) return closeConfirmDeletePatient();
    const patient = findPatientById(id);
    if (!patient) return closeConfirmDeletePatient();

    const choiceEl = document.querySelector('input[name="delete_patient_tests"]:checked');
    const removeTests = choiceEl && choiceEl.value === "remove";

    // Rimuovi paziente
    const patients = loadPatients().filter(p => p.id !== id);
    savePatients(patients);

    // Rimuovi test associati, se richiesto
    if (removeTests) {
      const results = loadResults().filter(r => {
        if (r.patientId && r.patientId === id) return false;
        const name = (r.patientName || r.patient || "").trim().toLowerCase();
        if (name && name === patient.name.trim().toLowerCase()) return false;
        return true;
      });
      saveResults(results);
    }

    closeConfirmDeletePatient();
    resetPatientForm();
    renderPatientList();
    populateNewPatientSelect();
    populateScoringPatientSelect();
    document.getElementById("patient-tests-card").classList.add("hidden");
    document.getElementById("patient-test-detail-card").classList.add("hidden");
    currentPatientFormId = null;
    const status = document.getElementById("patient-form-status");
    if (status) status.textContent = "Paziente eliminato.";
  }

  /********** INIT **********/
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("app-title").textContent = APP_NAME;

    // Inizializza pazienti & selettori
    loadPatients();
    renderPatientList();
    populateNewPatientSelect();
    populateScoringPatientSelect();
    renderTestButtons();
    refreshNewTestUI();

    const dateInput = document.getElementById("session-date");
    if (dateInput) {
      const today = new Date();
      dateInput.value = today.toISOString().slice(0, 10);
    }

    // HOME BUTTONS
    document.getElementById("home-new-test").addEventListener("click", () => {
      populateNewPatientSelect();
      resetNewTestFlow();
      showView("new");
    });

    document.getElementById("home-history").addEventListener("click", () => {
      openHistoryWithPinCheck();
    });

    document.getElementById("home-settings").addEventListener("click", () => {
      const pin = getStoredPin();
      document.getElementById("settings-pin").value = pin;
      const remember = getRememberSession();
      document.getElementById("settings-remember-session").checked = remember;
      document.getElementById("settings-pin-status").textContent = pin ? "PIN attivo." : "Nessun PIN impostato.";
      showView("settings");
    });

    document.getElementById("home-patients").addEventListener("click", () => {
      renderPatientList();
      resetPatientForm();
      showView("patients");
    });

    document.getElementById("home-scoring").addEventListener("click", () => {
      populateScoringPatientSelect();
      document.getElementById("scoring-tests-empty").textContent = "Seleziona un paziente per vedere i test disponibili.";
      document.getElementById("scoring-tests-empty").classList.remove("hidden");
      document.getElementById("scoring-tests-table-wrapper").classList.add("hidden");
      document.getElementById("scoring-detail-card").classList.add("hidden");
      showView("scoring");
    });

    // Pulsante Home globale
    document.getElementById("btn-go-home").addEventListener("click", () => {
      showView("home");
    });

    document.querySelectorAll(".btn-back-home").forEach(btn => {
      btn.addEventListener("click", () => showView("home"));
    });

    /***** NUOVO TEST – STEP NAV *****/
    document.getElementById("new-step-1-next").addEventListener("click", () => {
      const sel = document.getElementById("new-patient-select");
      const status = document.getElementById("new-step-1-status");
      if (!sel.value) {
        status.textContent = "Seleziona un paziente.";
        return;
      }
      currentPatientId = sel.value;
      status.textContent = "";
      refreshNewTestUI();
      setNewTestStep(2);
    });

    document.getElementById("new-step-2-back").addEventListener("click", () => {
      setNewTestStep(1);
    });

    document.getElementById("new-step-3-back").addEventListener("click", () => {
      currentTestId = null;
      currentTestStartTime = null;
      stopTimer();
      const timerEl = document.getElementById("new-step-3-timer");
      if (timerEl) timerEl.textContent = "Tempo: 0:00";
      refreshNewTestUI();
      setNewTestStep(2);
    });

    /***** SALVA TEST *****/
    document.getElementById("btn-save").addEventListener("click", () => {
      const test = getCurrentTest();
      const patient = getCurrentPatient();
      if (!test) {
        alert("Seleziona un test.");
        return;
      }

      const date = document.getElementById("session-date").value;
      const notes = document.getElementById("notes").value.trim();
      const answers = getAnswersFromForm();
      const status = document.getElementById("save-status");

      const patientName = patient ? patient.name : "";

      const answeredCount = Object.keys(answers).length;
      if (answeredCount < Math.ceil(test.items.length / 2)) {
        if (!confirm("Meno della metà delle domande è compilata. Salvare comunque?")) {
          return;
        }
      }

      const now = Date.now();
      const durationMs = currentTestStartTime ? now - currentTestStartTime : null;

      const record = {
        id: "rec_" + now,
        testId: test.id,
        patientId: patient ? patient.id : null,
        patientName,
        patient: patientName,
        date,
        notes,
        answers,
        createdAt: now,
        durationMs
      };

      const results = loadResults();
      results.push(record);
      saveResults(results);

      showResult(test, record);
      updateTestHistoryNote();
      status.textContent = "Salvato nello storico.";

      renderPatientList();
      if (patient) renderPatientTests(patient);
    });

    /***** STAMPA / EMAIL – NUOVO TEST (STATO ATTUALE FORM, SOLO TEST) *****/
    document.getElementById("btn-print").addEventListener("click", () => {
      const test = getCurrentTest();
      const patient = getCurrentPatient();
      if (!test) {
        alert("Seleziona un test.");
        return;
      }

      const date = document.getElementById("session-date").value;
      const notes = document.getElementById("notes").value.trim();
      const answers = getAnswersFromForm();
      const now = Date.now();
      const durationMs = currentTestStartTime ? now - currentTestStartTime : null;

      const tempRecord = {
        id: "temp",
        testId: test.id,
        patientName: patient ? patient.name : "",
        patient: patient ? patient.name : "",
        date,
        notes,
        answers,
        durationMs
      };

      buildPrintableReport(test, tempRecord, { mode: "test" });
      window.print();
    });

    document.getElementById("btn-email").addEventListener("click", () => {
      const test = getCurrentTest();
      const patient = getCurrentPatient();
      if (!test) {
        alert("Seleziona un test.");
        return;
      }

      const date = document.getElementById("session-date").value;
      const notes = document.getElementById("notes").value.trim();
      const answers = getAnswersFromForm();
      const now = Date.now();
      const durationMs = currentTestStartTime ? now - currentTestStartTime : null;

      const tempRecord = {
        id: "temp",
        testId: test.id,
        patientId: patient ? patient.id : null,
        patientName: patient ? patient.name : "",
        patient: patient ? patient.name : "",
        date,
        notes,
        answers,
        durationMs
      };

      sendEmailReport(test, tempRecord, { mode: "test" });
    });

    /***** STAMPA / EMAIL – STORICO (SOLO TEST) *****/
    document.getElementById("btn-history-print").addEventListener("click", () => {
      if (!currentHistoryRecord || !currentHistoryTest) return;
      buildPrintableReport(currentHistoryTest, currentHistoryRecord, { mode: "test" });
      window.print();
    });

    document.getElementById("btn-history-email").addEventListener("click", () => {
      if (!currentHistoryRecord || !currentHistoryTest) return;
      sendEmailReport(currentHistoryTest, currentHistoryRecord, { mode: "test" });
    });

    /***** STAMPA / EMAIL – DETTAGLIO PAZIENTE (SOLO TEST) *****/
    document.getElementById("btn-patient-test-print").addEventListener("click", () => {
      if (!currentPatientTestRecord || !currentPatientTest) return;
      buildPrintableReport(currentPatientTest, currentPatientTestRecord, { mode: "test" });
      window.print();
    });

    document.getElementById("btn-patient-test-email").addEventListener("click", () => {
      if (!currentPatientTestRecord || !currentPatientTest) return;
      sendEmailReport(currentPatientTest, currentPatientTestRecord, { mode: "test" });
    });

    document.getElementById("btn-patient-test-delete").addEventListener("click", () => {
      if (!currentPatientTestRecord) return;
      deleteRecord(currentPatientTestRecord.id);
    });

    /***** STAMPA – SCORING (CON SCORING) *****/
    document.getElementById("btn-scoring-print").addEventListener("click", () => {
      if (!currentScoringRecord || !currentScoringTest) return;
      buildPrintableReport(currentScoringTest, currentScoringRecord, { mode: "scoring" });
      window.print();
    });

    document.getElementById("btn-scoring-delete").addEventListener("click", () => {
      if (!currentScoringRecord) return;
      deleteRecord(currentScoringRecord.id);
    });

    /***** PIN LOCK *****/
    document.getElementById("btn-pin-unlock").addEventListener("click", checkPinAndUnlock);
    document.getElementById("btn-pin-cancel").addEventListener("click", () => {
      showView("home");
    });

    /***** IMPOSTAZIONI *****/
    document.getElementById("btn-save-pin").addEventListener("click", () => {
      const pin = document.getElementById("settings-pin").value.trim();
      const status = document.getElementById("settings-pin-status");
      if (!pin) {
        status.textContent = "Inserisci un PIN valido.";
        return;
      }
      setStoredPin(pin);
      if (!getRememberSession()) {
        clearPinSessionOk();
      }
      status.textContent = "PIN salvato.";
    });

    document.getElementById("btn-remove-pin").addEventListener("click", () => {
      setStoredPin("");
      clearPinSessionOk();
      document.getElementById("settings-pin").value = "";
      document.getElementById("settings-pin-status").textContent = "PIN rimosso.";
    });

    document.getElementById("settings-remember-session").addEventListener("change", e => {
      const val = e.target.checked;
      setRememberSession(val);
      if (!val) {
        clearPinSessionOk();
      }
    });

    document.getElementById("btn-clear-all").addEventListener("click", () => {
      if (!confirm("Questo cancellerà tutti i pazienti, lo storico dei test e il PIN. Procedere?")) return;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PATIENTS_KEY);
      localStorage.removeItem(PIN_KEY);
      localStorage.removeItem(PIN_SESSION_OK_KEY);
      localStorage.removeItem(PIN_REMEMBER_SESSION_KEY);

      loadPatients();
      renderPatientList();
      resetPatientForm();
      populateNewPatientSelect();
      populateScoringPatientSelect();
      renderHistory();
      document.getElementById("settings-pin").value = "";
      document.getElementById("settings-pin-status").textContent = "Dati eliminati.";
      resetNewTestFlow();
    });

    /***** PAZIENTI – BOTTONI *****/
    document.getElementById("btn-patient-save").addEventListener("click", savePatientFromForm);
    document.getElementById("btn-patient-new").addEventListener("click", resetPatientForm);
    const btnPatientDelete = document.getElementById("btn-patient-delete");
    if (btnPatientDelete) btnPatientDelete.addEventListener("click", openConfirmDeletePatient);
    const btnCancelDelete = document.getElementById("btn-cancel-delete-patient");
    if (btnCancelDelete) btnCancelDelete.addEventListener("click", closeConfirmDeletePatient);
    const btnConfirmDelete = document.getElementById("btn-confirm-delete-patient");
    if (btnConfirmDelete) btnConfirmDelete.addEventListener("click", confirmDeletePatient);

    document.getElementById("btn-patient-new-test").addEventListener("click", () => {
      if (!currentPatientFormId) return;
      beginNewTestForPatient(currentPatientFormId);
    });

    /***** SCORING – SELECT CHANGE *****/
    document.getElementById("scoring-patient-select").addEventListener("change", e => {
      const id = e.target.value;
      if (!id) {
        document.getElementById("scoring-tests-empty").textContent = "Seleziona un paziente per vedere i test disponibili.";
        document.getElementById("scoring-tests-empty").classList.remove("hidden");
        document.getElementById("scoring-tests-table-wrapper").classList.add("hidden");
        document.getElementById("scoring-detail-card").classList.add("hidden");
        return;
      }
      renderScoringTests(id);
    });

    // Vista iniziale
    showView("home");
  });

  /* PDF Download functions */
  window.downloadPDFReport = function(mode = 'test') {
    let record, test;
    
    if (mode === 'history' && currentHistoryRecord && currentHistoryTest) {
      record = currentHistoryRecord;
      test = currentHistoryTest;
    } else if (mode === 'patient' && currentPatientTestRecord && currentPatientTest) {
      record = currentPatientTestRecord;
      test = currentPatientTest;
    } else if (mode === 'scoring' && currentScoringRecord && currentScoringTest) {
      record = currentScoringRecord;
      test = currentScoringTest;
    } else {
      alert('Nessun test selezionato per il download PDF.');
      return;
    }

    if (!record || !test) return;

    const htmlContent = document.getElementById('printable-report').innerHTML;
    const filename = `${test.name.replace(/\s+/g, '_')}_${record.patientName || 'report'}_${formatDate(record.date || new Date().toISOString().slice(0, 10))}.pdf`;
    
    // Configurazione html2pdf
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    // Genera e scarica il PDF
    html2pdf().set(opt).from(htmlContent).save();
  }

  /********** LOGIN SYSTEM **********/
  async function initLoginSystem() {
    const loginForm = document.getElementById('login-form');
    const loginPasswordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('btn-logout');

    // Debug: verify all elements exist
    console.log('Login System Init:', {
      loginForm: !!loginForm,
      loginPasswordInput: !!loginPasswordInput,
      loginError: !!loginError,
      logoutBtn: !!logoutBtn,
      APP_PASSWORD: APP_PASSWORD
    });

    // Guard: exit if elements missing
    if (!loginForm || !loginPasswordInput || !loginError) {
      console.error('Login elements not found in DOM');
      return;
    }

    // Ensure auth storage is initialized (migrate default password on first run)
    await ensureAuthInitialized();

    // Check if user is already logged in this session
    const isLoggedIn = sessionStorage.getItem(LOGIN_SESSION_KEY) === 'true';
    console.log('Is logged in:', isLoggedIn);
    if (isLoggedIn) {
      showLoginPage(false);
    } else {
      showLoginPage(true);
    }

    // Login form submission (uses verifyPassword)
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = loginPasswordInput.value.trim();
      console.log('Login attempt (verify)');
      try {
        const ok = await verifyPassword(password);
        if (ok) {
          sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
          loginError.textContent = '';
          loginPasswordInput.value = '';
          showLoginPage(false);
        } else {
          loginError.textContent = 'Password non corretta. Riprova.';
          loginPasswordInput.value = '';
          loginPasswordInput.focus();
        }
      } catch (err) {
        console.error('Error verifying password', err);
        loginError.textContent = 'Errore interno. Riprova.';
      }
    });

    // Biometric login button (if present)
    const loginBioBtn = document.getElementById('btn-login-bio');
    if (loginBioBtn) {
      loginBioBtn.addEventListener('click', async () => {
        loginError.textContent = '';
        try {
          await authenticateWebAuthn();
          sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
          showLoginPage(false);
        } catch (err) {
          console.error('WebAuthn login failed', err);
          loginError.textContent = 'Autenticazione biometrica fallita.';
        }
      });
    }

    // Logout button (guard if not present)
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Vuoi disconnetterti?')) {
          sessionStorage.removeItem(LOGIN_SESSION_KEY);
          showLoginPage(true);
          loginPasswordInput.focus();
          loginError.textContent = '';
        }
      });
    }

    // Settings: password and WebAuthn handlers
    const savePasswordBtn = document.getElementById('btn-save-password');
    const removePasswordBtn = document.getElementById('btn-remove-password');
    const passNewInput = document.getElementById('settings-password-new');
    const passConfirmInput = document.getElementById('settings-password-confirm');
    const passStatus = document.getElementById('settings-password-status');
    const enableBioBtn = document.getElementById('btn-enable-bio');
    const disableBioBtn = document.getElementById('btn-disable-bio');
    const webauthnStatus = document.getElementById('webauthn-status');

    if (savePasswordBtn && passNewInput && passConfirmInput) {
      savePasswordBtn.addEventListener('click', async () => {
        const a = passNewInput.value || '';
        const b = passConfirmInput.value || '';
        passStatus.textContent = '';
        if (!a) return passStatus.textContent = 'Inserisci la nuova password.';
        if (a !== b) return passStatus.textContent = 'Le password non corrispondono.';
        try {
          await setPassword(a);
          passStatus.textContent = 'Password salvata.';
          passNewInput.value = '';
          passConfirmInput.value = '';
        } catch (err) {
          console.error('Failed to set password', err);
          passStatus.textContent = 'Errore salvataggio password.';
        }
      });
    }

    if (removePasswordBtn) {
      removePasswordBtn.addEventListener('click', async () => {
        if (!confirm('Rimuovere la password dell\'app? Questo disabiliterà la protezione.')) return;
        await removePassword();
        if (passStatus) passStatus.textContent = 'Password rimossa.';
      });
    }

    if (enableBioBtn && webauthnStatus) {
      enableBioBtn.addEventListener('click', async () => {
        try {
          await registerWebAuthn();
          webauthnStatus.textContent = 'Biometria abilitata.';
        } catch (err) {
          console.error(err);
          webauthnStatus.textContent = 'Abilitazione biometria fallita.';
        }
      });
    }

    if (disableBioBtn && webauthnStatus) {
      disableBioBtn.addEventListener('click', () => {
        setStoredWebAuthnId(null);
        webauthnStatus.textContent = 'Biometria disabilitata.';
      });
    }

    // initialize status UI
    if (webauthnStatus) {
      webauthnStatus.textContent = getStoredWebAuthnId() ? 'Biometria abilitata' : 'Biometria non configurata';
    }
  }

  function showLoginPage(show) {
    const loginView = document.getElementById('view-login');
    const appHeader = document.querySelector('header');
    const sections = document.querySelectorAll('section');
    if (show) {
      // Mostro login, nascondo tutto il resto (tutte le view)
      loginView.classList.remove('hidden');
      appHeader && appHeader.classList.add('hidden');
      // Nascondi tutte le views gestite da showView
      Object.values(views).forEach(v => v && v.classList.add('hidden'));
    } else {
      // Nascondo login, mostro la view principale (home)
      loginView.classList.add('hidden');
      appHeader && appHeader.classList.remove('hidden');
      // Mostra solo la home come view di default dopo il login
      if (typeof showView === 'function') showView('home');
      else Object.values(views).forEach(v => v && v.classList.remove('hidden'));
    }
  }

  /********** INIT **********/
  document.addEventListener('DOMContentLoaded', () => {
    initLoginSystem();
    initializeApp();
  });
