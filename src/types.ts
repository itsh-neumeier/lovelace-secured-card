export interface SecuredCardConfig {
  type: string;
  entity: string;
  pin: string;
  timeout?: number;
  title?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>
  ): Promise<void>;
  localize(key: string, ...args: unknown[]): string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}
