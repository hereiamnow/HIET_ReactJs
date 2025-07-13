/**
 * @file capacitor.config.ts
 * @description Capacitor configuration file for the Humidor Hub app.
 * @project Humidor Hub
 * @author Shawn Miller
 * @date 07/13/2025
 */

// Capacitor configuration file for the Humidor Hub app.

// This file defines the core settings used by Capacitor CLI and plugins.

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Unique app identifier, usually in reverse-DNS format
  appId: 'com.humidorhub.app',
  // Human-readable app name
  appName: 'humidor-hub',
  // Directory containing the web assets to be bundled into the native app
  webDir: 'build'
};

export default config;
