import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";
import { pinDialogStyles } from "./styles";

const MAX_PIN_LENGTH = 10;

export class PinDialog extends LitElement {
  static styles = pinDialogStyles;

  @property() public title = "PIN eingeben";
  @state() private _pin = "";
  @state() private _error = "";
  @state() private _shaking = false;

  private _expectedPin = "";

  public open(expectedPin: string): void {
    this._expectedPin = expectedPin;
    this._pin = "";
    this._error = "";
    this._shaking = false;
  }

  protected render() {
    const dots = Array.from({ length: MAX_PIN_LENGTH }, (_, i) => i < this._pin.length);

    return html`
      <div class="overlay" @click=${this._onOverlayClick}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="dialog-title">
            <ha-icon icon="mdi:lock"></ha-icon>
            ${this.title}
          </div>

          <div class="pin-display ${this._shaking ? "shake" : ""}">
            ${dots
              .filter((_, i) => i < Math.max(this._pin.length, 4))
              .map(
                (filled) =>
                  html`<div class="pin-dot ${filled ? "filled" : ""}"></div>`
              )}
          </div>

          <div class="pin-error">${this._error}</div>

          <div class="keypad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
              (n) =>
                html`<button class="key" @click=${() => this._addDigit(String(n))}>${n}</button>`
            )}
            <button class="key backspace" @click=${this._removeDigit}>
              <ha-icon icon="mdi:backspace-outline"></ha-icon>
            </button>
            <button class="key" @click=${() => this._addDigit("0")}>0</button>
            <button
              class="key submit"
              ?disabled=${this._pin.length === 0}
              @click=${this._submit}
            >
              <ha-icon icon="mdi:check"></ha-icon>
            </button>
          </div>

          <div class="dialog-actions">
            <button class="cancel-btn" @click=${this._cancel}>Abbrechen</button>
          </div>
        </div>
      </div>
    `;
  }

  private _addDigit(digit: string): void {
    if (this._pin.length >= MAX_PIN_LENGTH) return;
    this._pin += digit;
    this._error = "";
  }

  private _removeDigit(): void {
    this._pin = this._pin.slice(0, -1);
    this._error = "";
  }

  private _submit(): void {
    if (this._pin === this._expectedPin) {
      this.dispatchEvent(
        new CustomEvent("pin-valid", { bubbles: true, composed: true })
      );
    } else {
      this._error = "Falscher PIN";
      this._shaking = true;
      this._pin = "";
      setTimeout(() => {
        this._shaking = false;
      }, 400);
    }
  }

  private _cancel(): void {
    this.dispatchEvent(
      new CustomEvent("pin-cancelled", { bubbles: true, composed: true })
    );
  }

  private _onOverlayClick(): void {
    this._cancel();
  }
}

customElements.define("pin-dialog", PinDialog);
