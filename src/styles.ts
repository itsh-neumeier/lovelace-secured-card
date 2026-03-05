import { css } from "lit";

export const cardStyles = css`
  ha-card {
    overflow: hidden;
  }

  .card-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    cursor: pointer;
    position: relative;
  }

  .card-row:active {
    background: var(--secondary-background-color);
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

  .lock-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .lock-icon {
    --mdc-icon-size: 20px;
    color: var(--error-color, #db4437);
    transition: color 0.3s ease;
  }

  .lock-icon.unlocked {
    color: var(--success-color, #43a047);
  }

  .timeout-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--success-color, #43a047);
    transition: width linear;
    border-radius: 0 2px 2px 0;
  }

  .toggle-container {
    flex-shrink: 0;
  }

  ha-switch {
    --mdc-theme-secondary: var(--switch-checked-color, var(--primary-color));
  }
`;

export const pinDialogStyles = css`
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
    z-index: 999;
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
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  .key.backspace {
    font-size: 18px;
  }

  .key.submit {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .key.submit:active {
    opacity: 0.8;
  }

  .key.submit:disabled {
    opacity: 0.4;
    cursor: default;
  }

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

  .shake {
    animation: shake 0.4s ease;
  }
`;
