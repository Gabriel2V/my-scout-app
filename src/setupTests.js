import '@testing-library/jest-dom';
import { vi } from 'vitest';


globalThis.jest = vi;

if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}