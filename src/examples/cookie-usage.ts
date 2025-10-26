import { cookies } from '../utils/cookies';
import { settings } from '../utils/settings';

// Basic cookie usage
export function exampleBasicCookies() {
  // Set a simple cookie (expires in 365 days by default)
  cookies.set('username', 'Extrepa');
  
  // Set a cookie with custom options
  cookies.set('session_id', 'abc123', {
    expires: 7, // 7 days
    secure: true,
    sameSite: 'strict'
  });
  
  // Get cookie values
  const username = cookies.get('username');
  console.log('Username:', username); // "Extrepa"
  
  // Store complex data as JSON
  cookies.setJSON('userPrefs', {
    colorScheme: 'dark',
    notifications: true,
    lastVisit: new Date().toISOString()
  });
  
  // Retrieve JSON data
  const prefs = cookies.getJSON('userPrefs');
  console.log('Preferences:', prefs);
  
  // Check if cookie exists
  if (cookies.has('username')) {
    console.log('User is logged in');
  }
  
  // Remove a cookie
  cookies.remove('session_id');
}

// Settings management usage
export function exampleSettingsManager() {
  // Get all current settings
  const currentSettings = settings.get();
  console.log('Current settings:', currentSettings);
  
  // Update a specific setting
  settings.set('theme', 'dark');
  settings.set('volume', 0.8);
  settings.set('animations', false);
  
  // Update multiple settings at once
  settings.update({
    theme: 'light',
    language: 'es',
    volume: 0.5
  });
  
  // Get the current theme
  const theme = settings.get().theme;
  console.log('Current theme:', theme);
  
  // Reset all settings to defaults
  // settings.reset();
  
  // Clear all settings
  // settings.clear();
}

// Reactive settings with event listeners
export class ReactiveSettings {
  private listeners: Map<string, ((value: any) => void)[]> = new Map();
  
  constructor() {
    // Initialize with current settings
    this.loadSettings();
  }
  
  private loadSettings() {
    const currentSettings = settings.get();
    // Apply settings to your app
    this.applyTheme(currentSettings.theme || 'auto');
    this.applyVolume(currentSettings.volume || 0.7);
    this.applyAnimations(currentSettings.animations !== false);
  }
  
  setSetting<K extends keyof import('../utils/settings').UserSettings>(
    key: K, 
    value: import('../utils/settings').UserSettings[K]
  ) {
    settings.set(key, value);
    this.notifyListeners(key, value);
    this.applySetting(key, value);
  }
  
  onSettingChange<K extends keyof import('../utils/settings').UserSettings>(
    key: K,
    callback: (value: import('../utils/settings').UserSettings[K]) => void
  ) {
    if (!this.listeners.has(key as string)) {
      this.listeners.set(key as string, []);
    }
    this.listeners.get(key as string)!.push(callback);
  }
  
  private notifyListeners(key: string, value: any) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }
  
  private applySetting(key: string, value: any) {
    switch (key) {
      case 'theme':
        this.applyTheme(value);
        break;
      case 'volume':
        this.applyVolume(value);
        break;
      case 'animations':
        this.applyAnimations(value);
        break;
    }
  }
  
  private applyTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
    console.log(`Theme applied: ${theme}`);
  }
  
  private applyVolume(volume: number) {
    // Apply to audio elements or audio context
    console.log(`Volume set to: ${volume}`);
  }
  
  private applyAnimations(enabled: boolean) {
    document.documentElement.classList.toggle('no-animations', !enabled);
    console.log(`Animations ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Initialize reactive settings
export const reactiveSettings = new ReactiveSettings();

// Example usage with event listeners
reactiveSettings.onSettingChange('theme', (theme) => {
  console.log(`Theme changed to: ${theme}`);
});

reactiveSettings.onSettingChange('volume', (volume) => {
  console.log(`Volume changed to: ${volume}`);
});