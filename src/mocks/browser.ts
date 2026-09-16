import { setupWorker } from 'msw/browser';
import { handlers } from '../../tests/mocks/handlers';

export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null;
