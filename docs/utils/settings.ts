import { cookies } from './cookies';

export interface UserSettings {
  theme?: 'light' | 'dark' | 'auto';
  volume?: number;
  animations?: boolean;
  language?: string;
  // Add your specific settings here
}

const SETTINGS_COOKIE_NAME = 'errl_portal_settings';
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  volume: 0.7,
  animations: true,
  language: 'en'
};

export class SettingsManager {
  private static settings: UserSettings | null = null;

  /**
   * Load settings from cookies or use defaults
   */
  static getSettings(): UserSettings {
    if (this.settings === null) {
      const saved = cookies.getJSON<UserSettings>(SETTINGS_COOKIE_NAME);
      this.settings = { ...DEFAULT_SETTINGS, ...saved };
    }
    return this.settings;
  }

  /**
   * Update specific setting and persist to cookies
   */
  static setSetting<K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ): void {
    const settings = this.getSettings();
    settings[key] = value;
    this.settings = settings;
    this.saveSettings();
  }

  /**
   * Update multiple settings at once
   */
  static updateSettings(newSettings: Partial<UserSettings>): void {
    const settings = this.getSettings();
    Object.assign(settings, newSettings);
    this.settings = settings;
    this.saveSettings();
  }

  /**
   * Get a specific setting value
   */
  static getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.getSettings()[key];
  }

  /**
   * Reset to default settings
   */
  static resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  /**
   * Save current settings to cookies
   */
  private static saveSettings(): void {
    cookies.setJSON(SETTINGS_COOKIE_NAME, this.settings, {
      expires: 365 // 1 year
    });
  }

  /**
   * Remove all settings
   */
  static clearSettings(): void {
    cookies.remove(SETTINGS_COOKIE_NAME);
    this.settings = null;
  }
}

// Convenience exports
export const settings = {
  get: SettingsManager.getSettings.bind(SettingsManager),
  set: SettingsManager.setSetting.bind(SettingsManager),
  update: SettingsManager.updateSettings.bind(SettingsManager),
  reset: SettingsManager.resetSettings.bind(SettingsManager),
  clear: SettingsManager.clearSettings.bind(SettingsManager)
};