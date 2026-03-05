import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { cardStyles } from "./styles";
import type { SecuredCardConfig, HomeAssistant, HassEntity } from "./types";
import "./pin-dialog";
import "./editor";

const DEFAULT_TIMEOUT = 30;

const DOMAIN_ICONS: Record<string, string> = {
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

class SecuredCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: SecuredCardConfig;
  @state() private _unlocked = false;
  @state() private _showPinDialog = false;
  @state() private _timeoutRemaining = 0;

  private _timeoutTimer?: ReturnType<typeof setTimeout>;
  private _countdownInterval?: ReturnType<typeof setInterval>;

  public static getConfigElement() {
    return document.createElement("secured-card-editor");
  }

  public static getStubConfig() {
    return {
      entity: "",
      pin: "1234",
      timeout: DEFAULT_TIMEOUT,
    };
  }

  public setConfig(config: SecuredCardConfig): void {
    if (!config.entity) {
      throw new Error("Entity is required");
    }
    if (!config.pin) {
      throw new Error("PIN is required");
    }
    this._config = config;
  }

  public getCardSize(): number {
    return 2;
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearTimers();
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const entityId = this._config.entity;
    const stateObj = this.hass.states[entityId];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="card-row">
            <ha-icon class="entity-icon" icon="mdi:alert-circle"></ha-icon>
            <div class="entity-info">
              <div class="entity-name">Entity nicht gefunden</div>
              <div class="entity-state">${entityId}</div>
            </div>
          </div>
        </ha-card>
      `;
    }

    const domain = entityId.split(".")[0];
    const name = this._config.title || (stateObj.attributes.friendly_name as string) || entityId;
    const icon = (stateObj.attributes.icon as string) || DOMAIN_ICONS[domain] || "mdi:help-circle";
    const isActive = ACTIVE_STATES.includes(stateObj.state);
    const stateDisplay = this._localizeState(stateObj);
    const timeout = this._config.timeout ?? DEFAULT_TIMEOUT;

    return html`
      <ha-card>
        <div class="card-row" @click=${this._handleClick}>
          <ha-icon
            class="entity-icon ${isActive ? "active" : ""}"
            icon=${icon}
          ></ha-icon>

          <div class="entity-info">
            <div class="entity-name">${name}</div>
            <div class="entity-state">${stateDisplay}</div>
          </div>

          ${this._renderToggle(domain, stateObj)}

          <div class="lock-indicator">
            <ha-icon
              class="lock-icon ${this._unlocked ? "unlocked" : ""}"
              icon=${this._unlocked ? "mdi:lock-open" : "mdi:lock"}
            ></ha-icon>
          </div>

          ${this._unlocked
            ? html`<div
                class="timeout-bar"
                style="width: ${(this._timeoutRemaining / timeout) * 100}%;"
              ></div>`
            : nothing}
        </div>
      </ha-card>

      ${this._showPinDialog
        ? html`<pin-dialog
            .title=${"PIN eingeben"}
            @pin-valid=${this._onPinValid}
            @pin-cancelled=${this._onPinCancelled}
          ></pin-dialog>`
        : nothing}
    `;
  }

  protected updated(changedProps: Map<string, unknown>): void {
    if (this._showPinDialog && changedProps.has("_showPinDialog")) {
      const dialog = this.renderRoot.querySelector("pin-dialog") as any;
      if (dialog) {
        dialog.open(this._config.pin);
      }
    }
  }

  private _renderToggle(domain: string, stateObj: HassEntity) {
    const isToggleable = [
      "switch",
      "light",
      "fan",
      "input_boolean",
      "automation",
    ].includes(domain);

    if (!isToggleable) return nothing;

    const isOn = stateObj.state === "on";

    return html`
      <div class="toggle-container">
        <ha-switch .checked=${isOn} @click=${(e: Event) => e.stopPropagation()}></ha-switch>
      </div>
    `;
  }

  private _handleClick(e: Event): void {
    e.stopPropagation();

    if (this._unlocked) {
      this._performAction();
    } else {
      this._showPinDialog = true;
    }
  }

  private _onPinValid(): void {
    this._showPinDialog = false;
    this._unlock();
    this._performAction();
  }

  private _onPinCancelled(): void {
    this._showPinDialog = false;
  }

  private _unlock(): void {
    this._unlocked = true;
    const timeout = this._config.timeout ?? DEFAULT_TIMEOUT;
    this._timeoutRemaining = timeout;

    this._clearTimers();

    this._countdownInterval = setInterval(() => {
      this._timeoutRemaining = Math.max(0, this._timeoutRemaining - 0.1);
      this.requestUpdate();
    }, 100);

    this._timeoutTimer = setTimeout(() => {
      this._lock();
    }, timeout * 1000);
  }

  private _lock(): void {
    this._unlocked = false;
    this._timeoutRemaining = 0;
    this._clearTimers();
  }

  private _clearTimers(): void {
    if (this._timeoutTimer) {
      clearTimeout(this._timeoutTimer);
      this._timeoutTimer = undefined;
    }
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = undefined;
    }
  }

  private _performAction(): void {
    const entityId = this._config.entity;
    const domain = entityId.split(".")[0];

    switch (domain) {
      case "lock": {
        const isLocked = this.hass.states[entityId]?.state === "locked";
        this.hass.callService("lock", isLocked ? "unlock" : "lock", {
          entity_id: entityId,
        });
        break;
      }
      case "cover": {
        const isOpen = this.hass.states[entityId]?.state === "open";
        this.hass.callService("cover", isOpen ? "close_cover" : "open_cover", {
          entity_id: entityId,
        });
        break;
      }
      case "script":
        this.hass.callService("script", "turn_on", {
          entity_id: entityId,
        });
        break;
      case "scene":
        this.hass.callService("scene", "turn_on", {
          entity_id: entityId,
        });
        break;
      default:
        this.hass.callService("homeassistant", "toggle", {
          entity_id: entityId,
        });
    }
  }

  private _localizeState(stateObj: HassEntity): string {
    const state = stateObj.state;
    const translations: Record<string, string> = {
      on: "An",
      off: "Aus",
      open: "Offen",
      closed: "Geschlossen",
      opening: "Wird geoeffnet",
      closing: "Wird geschlossen",
      locked: "Verriegelt",
      unlocked: "Entriegelt",
      home: "Zuhause",
      not_home: "Abwesend",
      playing: "Wiedergabe",
      paused: "Pausiert",
      idle: "Inaktiv",
      unavailable: "Nicht verfuegbar",
      unknown: "Unbekannt",
      heat: "Heizen",
      cool: "Kuehlen",
      auto: "Automatisch",
    };
    return translations[state] || state;
  }
}

customElements.define("secured-card", SecuredCard);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "secured-card",
  name: "Secured Card",
  description: "PIN-geschuetzte Card fuer Home Assistant Entitaeten",
  preview: true,
});
