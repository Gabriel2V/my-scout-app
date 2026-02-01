/**
 * CONFIG: setupTests.js
 * Configurazione dell'ambiente di test Vitest + React Testing Library.
 * Estende i matcher di Jest, mocka le API browser non disponibili in JSDOM (fetch, IntersectionObserver, scrollTo).
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';


globalThis.jest = vi;

// Mock globale di fetch
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

globalThis.IntersectionObserver = MockIntersectionObserver;

// Stub per scrollTo (JSDOM non lo implementa)
globalThis.scrollTo = vi.fn();
// Anche su window per sicurezza
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}