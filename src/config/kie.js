/**
 * KIE API Configuration
 * ----------------------
 * Initializes the KIE (Key Image Engine) API client configuration.
 * KIE is the PRIMARY image generation engine for the platform.
 *
 * Required env vars:
 *   KIE_API_URL     — Base URL of the KIE API
 *   KIE_API_KEY     — Authentication key for KIE
 *   KIE_TIMEOUT_MS  — Request timeout in milliseconds (default: 120000)
 */

const KIE_API_URL = process.env.KIE_API_URL;
const KIE_API_KEY = process.env.KIE_API_KEY;
const KIE_TIMEOUT_MS = parseInt(process.env.KIE_TIMEOUT_MS, 10) || 120000;

if (!KIE_API_URL) {
  throw new Error('KIE_API_URL is required in environment variables.');
}

if (!KIE_API_KEY) {
  throw new Error('KIE_API_KEY is required in environment variables.');
}

/** @type {{ baseUrl: string, apiKey: string, timeoutMs: number }} */
const kieConfig = Object.freeze({
  baseUrl: KIE_API_URL.replace(/\/+$/, ''),
  apiKey: KIE_API_KEY,
  timeoutMs: KIE_TIMEOUT_MS,
});

export default kieConfig;
