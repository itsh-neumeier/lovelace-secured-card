import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import type { SecuredCardConfig, HomeAssistant } from "./types";

const DEFAULT_TIMEOUT = 30;

export class SecuredCardEditor extends LitElement {
  static styles = css`
    .editor-row {
      margin-bottom: 16px;
    }
    .editor-row label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    ha-entity-picker,
    ha-textfield {
      width: 100%;
    }
  `;

  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: SecuredCardConfig;

  public setConfig(config: SecuredCardConfig): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="editor-row">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config.entity || ""}
          .label=${"Entity"}
          .includeDomains=${[
            "switch",
            "light",
            "fan",
            "cover",
            "lock",
            "script",
            "scene",
            "climate",
            "input_boolean",
            "automation",
          ]}
          @value-changed=${this._entityChanged}
          allow-custom-entity
        ></ha-entity-picker>
      </div>

      <div class="editor-row">
        <ha-textfield
          .label=${"PIN"}
          .value=${this._config.pin || ""}
          type="password"
          inputmode="numeric"
          @input=${this._pinChanged}
        ></ha-textfield>
      </div>

      <div class="editor-row">
        <ha-textfield
          .label=${"Timeout (Sekunden)"}
          .value=${String(this._config.timeout ?? DEFAULT_TIMEOUT)}
          type="number"
          min="5"
          max="3600"
          @input=${this._timeoutChanged}
        ></ha-textfield>
      </div>

      <div class="editor-row">
        <ha-textfield
          .label=${"Titel (optional)"}
          .value=${this._config.title || ""}
          @input=${this._titleChanged}
        ></ha-textfield>
      </div>
    `;
  }

  private _entityChanged(ev: CustomEvent): void {
    this._updateConfig({ entity: ev.detail.value });
  }

  private _pinChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this._updateConfig({ pin: target.value });
  }

  private _timeoutChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (!isNaN(val) && val >= 5) {
      this._updateConfig({ timeout: val });
    }
  }

  private _titleChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    this._updateConfig({ title: target.value || undefined });
  }

  private _updateConfig(update: Partial<SecuredCardConfig>): void {
    this._config = { ...this._config, ...update };
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
