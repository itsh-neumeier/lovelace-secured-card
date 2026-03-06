/**
 * Secured Card - PIN-protected custom Lovelace card for Home Assistant
 * Version: 1.1.0
 * License: MIT
 * https://github.com/itsh-neumeier/lovelace-secured-card
 */

const CARD_VERSION = "1.1.1";
const DEFAULT_TIMEOUT = 30;
const MIN_PIN_LENGTH = 4;
const MAX_PIN_LENGTH = 10;

const DOMAIN_ICONS = {
  switch: "mdi:toggle-switch",
  light: "mdi:lightbulb",
  fan: "mdi:fan",
  cover: "mdi:window-shutter",
  lock: "mdi:lock",
  script: "mdi:script-text",
  scene: "mdi:palette",
  climate: "mdi:thermostat",
  input_boolean: "mdi:toggle-switch-outline",
  automation: "mdi:robot",
};

const ACTIVE_STATES = ["on", "open", "unlocked", "home", "playing"];

const STATE_TRANSLATIONS = {
  on: "An",
  off: "Aus",
  open: "Offen",
  closed: "Geschlossen",
  opening: "Wird ge\u00f6ffnet",
  closing: "Wird geschlossen",
  locked: "Verriegelt",
  unlocked: "Entriegelt",
  home: "Zuhause",
  not_home: "Abwesend",
  playing: "Wiedergabe",
  paused: "Pausiert",
  idle: "Inaktiv",
  unavailable: "Nicht verf\u00fcgbar",
  unknown: "Unbekannt",
  heat: "Heizen",
  cool: "K\u00fchlen",
  auto: "Automatisch",
};

/** Private storage to prevent casual PIN access via DOM inspection */
const _priv = new WeakMap();

/** Constant-time string comparison to prevent timing attacks */
function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const len = Math.max(a.length, b.length);
  let mismatch = a.length !== b.length ? 1 : 0;
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

/** Create a DOM element with options */
function createElement(tag, opts) {
  const el = document.createElement(tag);
  if (opts) {
    if (opts.className) el.className = opts.className;
    if (opts.id) el.id = opts.id;
    if (opts.textContent !== undefined) el.textContent = opts.textContent;
  }
  return el;
}

/** Get entity IDs from config (supports both `entity` and `entities`) */
function getEntityIds(config) {
  if (config.entities && Array.isArray(config.entities)) {
    return config.entities;
  }
  if (config.entity) {
    return [config.entity];
  }
  return [];
}

// ─── PIN Dialog CSS ──────────────────────────────────────────────────────────

const PIN_DIALOG_CSS = `
  :host {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .dialog {
    background: var(--card-background-color, #fff);
    border-radius: 16px;
    padding: 24px;
    width: 280px;
    max-width: 90vw;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.25s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dialog-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color);
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .dialog-title ha-icon {
    --mdc-icon-size: 24px;
    color: var(--primary-color);
  }

  .pin-display {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
    min-height: 40px;
    align-items: center;
  }

  .pin-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid var(--divider-color, #e0e0e0);
    transition: all 0.15s ease;
  }

  .pin-dot.filled {
    background: var(--primary-color);
    border-color: var(--primary-color);
    transform: scale(1.1);
  }

  .pin-error {
    color: var(--error-color, #db4437);
    font-size: 13px;
    text-align: center;
    margin-bottom: 12px;
    min-height: 20px;
  }

  .keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .key {
    aspect-ratio: 1.4;
    border: none;
    border-radius: 12px;
    background: var(--secondary-background-color, #f5f5f5);
    color: var(--primary-text-color);
    font-size: 22px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .key:active {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .key.backspace { font-size: 18px; }

  .key.submit {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .key.submit:active { opacity: 0.8; }
  .key.submit:disabled { opacity: 0.4; cursor: default; }

  .dialog-actions {
    display: flex;
    justify-content: center;
  }

  .cancel-btn {
    background: none;
    border: none;
    color: var(--secondary-text-color);
    font-size: 14px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 8px;
  }

  .cancel-btn:active {
    background: var(--secondary-background-color);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }

  .shake { animation: shake 0.4s ease; }
`;

// ─── PIN Dialog ──────────────────────────────────────────────────────────────

class PinDialog extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "closed" });
    _priv.set(this, {
      shadow: shadow,
      expectedPin: "",
      pin: "",
      error: "",
    });

    const style = document.createElement("style");
    style.textContent = PIN_DIALOG_CSS;
    shadow.appendChild(style);
  }

  open(expectedPin) {
    const p = _priv.get(this);
    p.expectedPin = expectedPin;
    p.pin = "";
    p.error = "";
    this._buildDom();
  }

  _buildDom() {
    const p = _priv.get(this);
    const shadow = p.shadow;

    while (shadow.childNodes.length > 1) {
      shadow.removeChild(shadow.lastChild);
    }

    const overlay = createElement("div", { className: "overlay" });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this._cancel();
    });

    const dialog = createElement("div", { className: "dialog" });

    const title = createElement("div", { className: "dialog-title" });
    const lockIcon = document.createElement("ha-icon");
    lockIcon.setAttribute("icon", "mdi:lock");
    title.appendChild(lockIcon);
    title.appendChild(document.createTextNode("PIN eingeben"));
    dialog.appendChild(title);

    const pinDisplay = createElement("div", {
      className: "pin-display",
      id: "pin-display",
    });
    this._updateDots(pinDisplay);
    dialog.appendChild(pinDisplay);

    const errorDiv = createElement("div", {
      className: "pin-error",
      id: "pin-error",
      textContent: p.error,
    });
    dialog.appendChild(errorDiv);

    const keypad = createElement("div", { className: "keypad" });
    [1, 2, 3, 4, 5, 6, 7, 8, 9, "back", 0, "submit"].forEach((key) => {
      const btn = document.createElement("button");
      btn.classList.add("key");

      if (key === "back") {
        btn.classList.add("backspace");
        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", "mdi:backspace-outline");
        btn.appendChild(icon);
        btn.addEventListener("click", (e) => { e.stopPropagation(); this._removeDigit(); });
      } else if (key === "submit") {
        btn.classList.add("submit");
        btn.disabled = p.pin.length === 0;
        btn.id = "submit-btn";
        const icon = document.createElement("ha-icon");
        icon.setAttribute("icon", "mdi:check");
        btn.appendChild(icon);
        btn.addEventListener("click", (e) => { e.stopPropagation(); this._submit(); });
      } else {
        btn.textContent = String(key);
        btn.addEventListener("click", (e) => { e.stopPropagation(); this._addDigit(String(key)); });
      }

      keypad.appendChild(btn);
    });
    dialog.appendChild(keypad);

    const actions = createElement("div", { className: "dialog-actions" });
    const cancelBtn = createElement("button", { className: "cancel-btn", textContent: "Abbrechen" });
    cancelBtn.addEventListener("click", () => this._cancel());
    actions.appendChild(cancelBtn);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);
    shadow.appendChild(overlay);
  }

  _updateDots(container) {
    const p = _priv.get(this);
    if (!container) container = p.shadow.getElementById("pin-display");
    if (!container) return;

    const dotCount = Math.max(p.pin.length, MIN_PIN_LENGTH);
    const existing = container.children;

    while (existing.length > dotCount) container.removeChild(container.lastChild);
    while (existing.length < dotCount) container.appendChild(createElement("div", { className: "pin-dot" }));

    for (let i = 0; i < dotCount; i++) {
      existing[i].classList.toggle("filled", i < p.pin.length);
    }
  }

  _addDigit(digit) {
    const p = _priv.get(this);
    if (p.pin.length >= MAX_PIN_LENGTH) return;
    p.pin += digit;
    p.error = "";
    this._updateDots();
    const errorEl = p.shadow.getElementById("pin-error");
    if (errorEl) errorEl.textContent = "";
    const submitBtn = p.shadow.getElementById("submit-btn");
    if (submitBtn) submitBtn.disabled = false;
  }

  _removeDigit() {
    const p = _priv.get(this);
    p.pin = p.pin.slice(0, -1);
    p.error = "";
    this._updateDots();
    const errorEl = p.shadow.getElementById("pin-error");
    if (errorEl) errorEl.textContent = "";
    const submitBtn = p.shadow.getElementById("submit-btn");
    if (submitBtn) submitBtn.disabled = p.pin.length === 0;
  }

  _submit() {
    const p = _priv.get(this);

    if (constantTimeEqual(p.pin, p.expectedPin)) {
      this.dispatchEvent(new CustomEvent("pin-valid", { bubbles: false, composed: false }));
    } else {
      p.error = "Falscher PIN";
      p.pin = "";
      const errorEl = p.shadow.getElementById("pin-error");
      if (errorEl) errorEl.textContent = p.error;
      const pinDisplay = p.shadow.getElementById("pin-display");
      if (pinDisplay) {
        pinDisplay.classList.add("shake");
        this._updateDots(pinDisplay);
        setTimeout(() => pinDisplay.classList.remove("shake"), 400);
      }
      const submitBtn = p.shadow.getElementById("submit-btn");
      if (submitBtn) submitBtn.disabled = true;
    }
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent("pin-cancelled", { bubbles: false, composed: false }));
  }
}

customElements.define("pin-dialog", PinDialog);

// ─── Secured Card CSS ────────────────────────────────────────────────────────

const CARD_CSS = `
  ha-card {
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    padding: 12px 16px 4px;
    gap: 8px;
  }

  .card-header-title {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .header-lock {
    --mdc-icon-size: 20px;
    color: var(--error-color, #db4437);
    transition: color 0.3s ease;
    cursor: pointer;
  }

  .header-lock.unlocked {
    color: var(--success-color, #43a047);
  }

  .timeout-bar {
    height: 3px;
    background: var(--success-color, #43a047);
    transform-origin: left;
    will-change: transform;
    margin: 0 16px 4px;
    border-radius: 2px;
  }

  .entity-row {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    gap: 12px;
    position: relative;
    transition: background 0.1s ease;
  }

  .entity-row.clickable {
    cursor: pointer;
  }

  .entity-row.clickable:active {
    background: var(--secondary-background-color);
  }

  .entity-row.locked {
    opacity: 0.6;
    cursor: default;
  }

  .entity-icon {
    --mdc-icon-size: 24px;
    color: var(--state-icon-color, var(--paper-item-icon-color, #44739e));
    flex-shrink: 0;
  }

  .entity-icon.active {
    color: var(--state-icon-active-color, var(--state-active-color, #fdd835));
  }

  .entity-info {
    flex: 1;
    min-width: 0;
  }

  .entity-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entity-state {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .toggle-container {
    flex-shrink: 0;
  }

  .row-lock {
    --mdc-icon-size: 18px;
    color: var(--error-color, #db4437);
    transition: color 0.3s ease;
    flex-shrink: 0;
  }

  .row-lock.unlocked {
    color: var(--success-color, #43a047);
  }

  ha-switch {
    --mdc-theme-secondary: var(--switch-checked-color, var(--primary-color));
    pointer-events: none;
  }

  .empty-msg {
    padding: 16px;
    text-align: center;
    color: var(--secondary-text-color);
    font-size: 14px;
  }
`;

// ─── Secured Card Editor ─────────────────────────────────────────────────────

const EDITOR_CSS = `
  .editor-row { margin-bottom: 16px; }
  ha-entity-picker, ha-textfield { display: block; width: 100%; }
  .entities-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .entities-header span {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .add-btn, .remove-btn {
    background: none;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    padding: 4px 12px;
    cursor: pointer;
    color: var(--primary-text-color);
    font-size: 13px;
  }
  .add-btn:active, .remove-btn:active {
    background: var(--secondary-background-color);
  }
  .remove-btn {
    padding: 4px 8px;
    color: var(--error-color, #db4437);
    border-color: var(--error-color, #db4437);
  }
  .entity-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .entity-item ha-entity-picker {
    flex: 1;
  }
`;

class SecuredCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._editorBuilt = false;
    this._internalChange = false;
  }

  set hass(hass) {
    this._hass = hass;
    // Update all entity pickers
    this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((p) => {
      p.hass = hass;
    });
  }

  setConfig(config) {
    this._config = { ...config };
    // Migrate single entity to entities array
    if (config.entity && !config.entities) {
      this._config.entities = [config.entity];
      delete this._config.entity;
    }
    if (!this._config.entities) {
      this._config.entities = [];
    }
    // Skip rebuild if this setConfig was triggered by our own _fireChanged
    if (this._internalChange) {
      this._internalChange = false;
      return;
    }
    this._buildEditor();
  }

  _buildEditor() {
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }

    const style = document.createElement("style");
    style.textContent = EDITOR_CSS;
    this.shadowRoot.appendChild(style);

    const entities = this._config.entities || [];
    const includeDomains = [
      "switch", "light", "fan", "cover", "lock",
      "script", "scene", "climate", "input_boolean", "automation",
    ];

    // Entities section
    const header = createElement("div", { className: "entities-header" });
    header.appendChild(createElement("span", { textContent: `Entities (${entities.length})` }));
    const addBtn = createElement("button", { className: "add-btn", textContent: "+ Hinzuf\u00fcgen" });
    addBtn.addEventListener("click", () => {
      this._config.entities = [...(this._config.entities || []), ""];
      this._fireChanged();
      this._buildEditor();
    });
    header.appendChild(addBtn);
    this.shadowRoot.appendChild(header);

    // Entity pickers
    entities.forEach((entityId, index) => {
      const item = createElement("div", { className: "entity-item" });

      const picker = document.createElement("ha-entity-picker");
      if (this._hass) picker.hass = this._hass;
      picker.value = entityId;
      picker.label = `Entity ${index + 1}`;
      picker.includeDomains = includeDomains;
      picker.allowCustomEntity = true;
      picker.addEventListener("value-changed", (ev) => {
        const newEntities = [...this._config.entities];
        newEntities[index] = ev.detail.value;
        this._config = { ...this._config, entities: newEntities };
        this._fireChanged();
      });
      item.appendChild(picker);

      const removeBtn = createElement("button", { className: "remove-btn", textContent: "\u2715" });
      removeBtn.addEventListener("click", () => {
        const newEntities = [...this._config.entities];
        newEntities.splice(index, 1);
        this._config = { ...this._config, entities: newEntities };
        this._fireChanged();
        this._buildEditor();
      });
      item.appendChild(removeBtn);

      this.shadowRoot.appendChild(item);
    });

    // PIN field
    const row2 = createElement("div", { className: "editor-row" });
    const pinField = document.createElement("ha-textfield");
    pinField.label = `PIN (${MIN_PIN_LENGTH}-${MAX_PIN_LENGTH} Ziffern)`;
    pinField.value = this._config.pin || "";
    pinField.type = "password";
    pinField.setAttribute("inputmode", "numeric");
    pinField.addEventListener("input", (ev) => {
      const sanitized = ev.target.value.replace(/[^0-9]/g, "").slice(0, MAX_PIN_LENGTH);
      if (ev.target.value !== sanitized) ev.target.value = sanitized;
      this._config = { ...this._config, pin: sanitized };
      this._fireChanged();
    });
    row2.appendChild(pinField);
    this.shadowRoot.appendChild(row2);

    // Timeout field
    const row3 = createElement("div", { className: "editor-row" });
    const timeoutField = document.createElement("ha-textfield");
    timeoutField.label = "Timeout (Sekunden)";
    timeoutField.value = String(this._config.timeout ?? DEFAULT_TIMEOUT);
    timeoutField.type = "number";
    timeoutField.min = "5";
    timeoutField.max = "3600";
    timeoutField.addEventListener("input", (ev) => {
      const val = parseInt(ev.target.value, 10);
      if (!isNaN(val) && val >= 5) {
        this._config = { ...this._config, timeout: val };
        this._fireChanged();
      }
    });
    row3.appendChild(timeoutField);
    this.shadowRoot.appendChild(row3);

    // Title field
    const row4 = createElement("div", { className: "editor-row" });
    const titleField = document.createElement("ha-textfield");
    titleField.label = "Titel (optional)";
    titleField.value = this._config.title || "";
    titleField.addEventListener("input", (ev) => {
      this._config = { ...this._config, title: ev.target.value || undefined };
      this._fireChanged();
    });
    row4.appendChild(titleField);
    this.shadowRoot.appendChild(row4);
  }

  _fireChanged() {
    this._internalChange = true;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("secured-card-editor", SecuredCardEditor);

// ─── Secured Card ────────────────────────────────────────────────────────────

class SecuredCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._unlocked = false;
    this._timeoutTimer = null;
    this._config = {};
    this._hass = null;
    this._pinDialog = null;
    this._built = false;

    // Cached element references
    this._headerLockIcon = null;
    this._timeoutBar = null;
    this._entityRows = new Map(); // entityId -> { row, icon, stateEl, switchEl }

    const style = document.createElement("style");
    style.textContent = CARD_CSS;
    this.shadowRoot.appendChild(style);
  }

  static getConfigElement() {
    return document.createElement("secured-card-editor");
  }

  static getStubConfig() {
    return { entities: [], pin: "", timeout: DEFAULT_TIMEOUT };
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    const entityIds = getEntityIds(this._config);
    if (!entityIds.length) return;

    // Check if any of our entities changed
    let changed = !oldHass;
    if (!changed) {
      for (const eid of entityIds) {
        if (oldHass.states[eid] !== hass.states[eid]) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) return;

    if (this._built) {
      this._updateCard();
    } else {
      this._buildCard();
    }
  }

  setConfig(config) {
    if (!config.pin) throw new Error("PIN is required");
    if (!/^\d+$/.test(config.pin)) throw new Error("PIN must contain only digits");
    if (config.pin.length < MIN_PIN_LENGTH) {
      throw new Error(`PIN must be at least ${MIN_PIN_LENGTH} digits`);
    }

    // Migrate single entity to entities array
    const normalized = { ...config };
    if (config.entity && !config.entities) {
      normalized.entities = [config.entity];
      delete normalized.entity;
    }
    if (!normalized.entities || !normalized.entities.length) {
      throw new Error("At least one entity is required");
    }

    const oldConfig = this._config;
    this._config = normalized;

    // Check if structural rebuild needed
    const oldIds = getEntityIds(oldConfig);
    const newIds = getEntityIds(normalized);
    if (
      !oldConfig ||
      oldConfig.title !== normalized.title ||
      oldIds.length !== newIds.length ||
      oldIds.some((id, i) => id !== newIds[i])
    ) {
      this._built = false;
    }

    if (this._hass) {
      if (this._built) {
        this._updateCard();
      } else {
        this._buildCard();
      }
    }
  }

  getCardSize() {
    const entityIds = getEntityIds(this._config);
    return 1 + entityIds.length;
  }

  connectedCallback() {
    if (!this._built && this._hass && this._config) {
      this._buildCard();
    }
  }

  disconnectedCallback() {
    this._clearTimers();
    if (this._pinDialog) {
      this._pinDialog.remove();
      this._pinDialog = null;
    }
  }

  /** Full DOM build */
  _buildCard() {
    if (!this._hass || !this._config) return;

    while (this.shadowRoot.childNodes.length > 1) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }

    this._entityRows.clear();

    const haCard = document.createElement("ha-card");
    const entityIds = getEntityIds(this._config);

    // ── Card header (only if title configured) ──
    if (this._config.title) {
      const header = createElement("div", { className: "card-header" });
      const titleEl = createElement("div", { className: "card-header-title", textContent: this._config.title });
      header.appendChild(titleEl);

      const lockIcon = document.createElement("ha-icon");
      lockIcon.className = `header-lock${this._unlocked ? " unlocked" : ""}`;
      lockIcon.setAttribute("icon", this._unlocked ? "mdi:lock-open" : "mdi:lock");
      lockIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!this._unlocked) this._showPin();
      });
      header.appendChild(lockIcon);
      this._headerLockIcon = lockIcon;

      haCard.appendChild(header);
    } else {
      this._headerLockIcon = null;
    }

    // ── Timeout bar ──
    const timeoutBar = createElement("div", { className: "timeout-bar" });
    timeoutBar.style.transform = this._unlocked ? "scaleX(1)" : "scaleX(0)";
    haCard.appendChild(timeoutBar);
    this._timeoutBar = timeoutBar;

    // ── Entity rows ──
    if (!entityIds.length) {
      haCard.appendChild(createElement("div", { className: "empty-msg", textContent: "Keine Entities konfiguriert" }));
    }

    entityIds.forEach((entityId) => {
      const stateObj = this._hass.states[entityId];
      const row = this._buildEntityRow(entityId, stateObj);
      haCard.appendChild(row);
    });

    this.shadowRoot.appendChild(haCard);
    this._built = true;
  }

  /** Build a single entity row */
  _buildEntityRow(entityId, stateObj) {
    const isUnlocked = this._unlocked;

    const row = createElement("div", {
      className: `entity-row${isUnlocked ? " clickable" : " locked"}`,
    });

    if (!stateObj) {
      const icon = document.createElement("ha-icon");
      icon.className = "entity-icon";
      icon.setAttribute("icon", "mdi:alert-circle");
      row.appendChild(icon);

      const info = createElement("div", { className: "entity-info" });
      info.appendChild(createElement("div", { className: "entity-name", textContent: "Entity nicht gefunden" }));
      info.appendChild(createElement("div", { className: "entity-state", textContent: entityId }));
      row.appendChild(info);

      this._entityRows.set(entityId, { row, icon: null, stateEl: null, switchEl: null });
      return row;
    }

    const domain = entityId.split(".")[0];
    const name = stateObj.attributes.friendly_name || entityId;
    const iconName = stateObj.attributes.icon || DOMAIN_ICONS[domain] || "mdi:help-circle";
    const isActive = ACTIVE_STATES.includes(stateObj.state);
    const stateDisplay = STATE_TRANSLATIONS[stateObj.state] || stateObj.state;
    const isToggleable = ["switch", "light", "fan", "input_boolean", "automation"].includes(domain);

    // Entity icon
    const entityIcon = document.createElement("ha-icon");
    entityIcon.className = `entity-icon${isActive ? " active" : ""}`;
    entityIcon.setAttribute("icon", iconName);
    row.appendChild(entityIcon);

    // Entity info
    const info = createElement("div", { className: "entity-info" });
    const nameEl = createElement("div", { className: "entity-name", textContent: name });
    const stateEl = createElement("div", { className: "entity-state", textContent: stateDisplay });
    info.appendChild(nameEl);
    info.appendChild(stateEl);
    row.appendChild(info);

    // Toggle switch
    let switchEl = null;
    if (isToggleable) {
      const toggleContainer = createElement("div", { className: "toggle-container" });
      switchEl = document.createElement("ha-switch");
      switchEl.checked = stateObj.state === "on";
      switchEl.disabled = !isUnlocked;
      toggleContainer.appendChild(switchEl);
      row.appendChild(toggleContainer);
    }

    // Lock icon per row (when no card title/header)
    let rowLockIcon = null;
    if (!this._config.title) {
      rowLockIcon = document.createElement("ha-icon");
      rowLockIcon.className = `row-lock${isUnlocked ? " unlocked" : ""}`;
      rowLockIcon.setAttribute("icon", isUnlocked ? "mdi:lock-open" : "mdi:lock");
      row.appendChild(rowLockIcon);
    }

    // Click handler
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._unlocked) {
        this._performAction(entityId);
      } else {
        this._showPin();
      }
    });

    this._entityRows.set(entityId, { row, icon: entityIcon, stateEl, switchEl, rowLockIcon });
    return row;
  }

  /** Targeted update - only updates changed state values */
  _updateCard() {
    if (!this._hass || !this._config || !this._built) return;

    const entityIds = getEntityIds(this._config);

    for (const entityId of entityIds) {
      const stateObj = this._hass.states[entityId];
      const cached = this._entityRows.get(entityId);
      if (!cached || !stateObj) continue;

      const domain = entityId.split(".")[0];
      const iconName = stateObj.attributes.icon || DOMAIN_ICONS[domain] || "mdi:help-circle";
      const isActive = ACTIVE_STATES.includes(stateObj.state);
      const stateDisplay = STATE_TRANSLATIONS[stateObj.state] || stateObj.state;

      if (cached.icon) {
        cached.icon.className = `entity-icon${isActive ? " active" : ""}`;
        cached.icon.setAttribute("icon", iconName);
      }
      if (cached.stateEl) {
        cached.stateEl.textContent = stateDisplay;
      }
      if (cached.switchEl) {
        cached.switchEl.checked = stateObj.state === "on";
      }
    }
  }

  _showPin() {
    if (this._pinDialog) {
      this._pinDialog.remove();
      this._pinDialog = null;
    }

    this._pinDialog = document.createElement("pin-dialog");
    this._pinDialog.addEventListener("pin-valid", () => {
      this._pinDialog.remove();
      this._pinDialog = null;
      this._unlock();
    });
    this._pinDialog.addEventListener("pin-cancelled", () => {
      this._pinDialog.remove();
      this._pinDialog = null;
    });

    this.shadowRoot.appendChild(this._pinDialog);
    this._pinDialog.open(this._config.pin);
  }

  _unlock() {
    this._unlocked = true;
    const timeout = this._config.timeout ?? DEFAULT_TIMEOUT;

    this._clearTimers();

    // Update header lock icon
    if (this._headerLockIcon) {
      this._headerLockIcon.className = "header-lock unlocked";
      this._headerLockIcon.setAttribute("icon", "mdi:lock-open");
    }

    // Update entity rows to clickable
    this._entityRows.forEach((cached) => {
      cached.row.classList.remove("locked");
      cached.row.classList.add("clickable");
      if (cached.switchEl) cached.switchEl.disabled = false;
      if (cached.rowLockIcon) {
        cached.rowLockIcon.className = "row-lock unlocked";
        cached.rowLockIcon.setAttribute("icon", "mdi:lock-open");
      }
    });

    // CSS transition for countdown bar
    const bar = this._timeoutBar;
    if (bar) {
      bar.style.transition = "none";
      bar.style.transform = "scaleX(1)";
      bar.offsetWidth;
      bar.style.transition = `transform ${timeout}s linear`;
      bar.style.transform = "scaleX(0)";
    }

    this._timeoutTimer = setTimeout(() => {
      this._lock();
    }, timeout * 1000);
  }

  _lock() {
    this._unlocked = false;
    this._clearTimers();

    // Update header lock icon
    if (this._headerLockIcon) {
      this._headerLockIcon.className = "header-lock";
      this._headerLockIcon.setAttribute("icon", "mdi:lock");
    }

    // Update entity rows to locked
    this._entityRows.forEach((cached) => {
      cached.row.classList.remove("clickable");
      cached.row.classList.add("locked");
      if (cached.switchEl) cached.switchEl.disabled = true;
      if (cached.rowLockIcon) {
        cached.rowLockIcon.className = "row-lock";
        cached.rowLockIcon.setAttribute("icon", "mdi:lock");
      }
    });

    // Reset timeout bar
    const bar = this._timeoutBar;
    if (bar) {
      bar.style.transition = "none";
      bar.style.transform = "scaleX(0)";
    }
  }

  _clearTimers() {
    if (this._timeoutTimer) {
      clearTimeout(this._timeoutTimer);
      this._timeoutTimer = null;
    }
  }

  _performAction(entityId) {
    const domain = entityId.split(".")[0];
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;

    switch (domain) {
      case "lock": {
        const isLocked = stateObj.state === "locked";
        this._hass.callService("lock", isLocked ? "unlock" : "lock", { entity_id: entityId });
        break;
      }
      case "cover": {
        const isOpen = stateObj.state === "open";
        this._hass.callService("cover", isOpen ? "close_cover" : "open_cover", { entity_id: entityId });
        break;
      }
      case "script":
        this._hass.callService("script", "turn_on", { entity_id: entityId });
        break;
      case "scene":
        this._hass.callService("scene", "turn_on", { entity_id: entityId });
        break;
      default:
        this._hass.callService("homeassistant", "toggle", { entity_id: entityId });
    }
  }
}

customElements.define("secured-card", SecuredCard);

// ─── Register Card ───────────────────────────────────────────────────────────

window.customCards = window.customCards || [];
window.customCards.push({
  type: "secured-card",
  name: "Secured Card",
  description: "PIN-gesch\u00fctzte Card f\u00fcr Home Assistant Entit\u00e4ten",
  preview: true,
});

console.info(
  `%c SECURED-CARD %c v${CARD_VERSION} `,
  "color: white; background: #3498db; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #3498db; background: #ecf0f1; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);
