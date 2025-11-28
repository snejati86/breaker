import type { DeviceType } from '../constants/devices';

// Environment variables - set in .env.local (see .env.example)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_ID = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const FALLBACK_DEVICE: DeviceType = { name: '', watts: 100, icon: 'fa-question-circle', category: 'other' };

const normalizeWatts = (value: unknown, fallback = 100): number => {
  const watts = Number(value);
  return Number.isFinite(watts) && watts > 0 ? watts : fallback;
};

const withLogging = <T>(label: string, payload: T): T => {
  console.log(`[deviceApi] ${label}`, payload);
  return payload;
};

export const fetchCustomDeviceSpecs = async (query: string): Promise<DeviceType> => {
  const fallback = { ...FALLBACK_DEVICE, name: query };

  if (!API_KEY) {
    console.warn('[deviceApi] Missing Gemini API key, returning fallback device.');
    return fallback;
  }

  const prompt = [
    'You are part of an electrical panel planning tool.',
    'Use the Google Search tool if you need current information.',
    'Return a compact JSON object with keys: name (<= 30 chars), watts (number only), icon (Font Awesome name without "fa-").',
    `Device to research: "${query}".`,
  ].join('\n');

  try {
    withLogging('LLM request', { model: MODEL_ID, query, prompt });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      const message = await response.text();
      console.error('[deviceApi] LLM request failed', response.status, message);
      return fallback;
    }

    const data = await response.json();
    withLogging('LLM raw response', data);

    const firstCandidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!firstCandidate) {
      console.warn('[deviceApi] LLM returned no structured text.');
      return fallback;
    }

    const parsed = JSON.parse(firstCandidate);
    const normalizedDevice: DeviceType = {
      name: parsed.name?.slice(0, 30) || query,
      watts: normalizeWatts(parsed.watts, fallback.watts),
      icon: parsed.icon ? `fa-${String(parsed.icon).replace(/^fa-/, '')}` : fallback.icon,
      category: 'other',
    };

    withLogging('LLM parsed device', normalizedDevice);
    return normalizedDevice;
  } catch (error) {
    console.error('[deviceApi] Failed to fetch custom device specs:', error);
    return fallback;
  }
};