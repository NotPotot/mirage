import type { SensitivityLevel } from '../../types';

interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
  'form-action': string[];
  'base-uri': string[];
}

function getDirectives(sensitivity: SensitivityLevel): CSPDirectives {
  const base: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
  };

  if (sensitivity === 'standard') {
    base['script-src'].push("'unsafe-inline'");
  }

  return base;
}

export function generateCSPHeader(sensitivity: SensitivityLevel): string {
  const directives = getDirectives(sensitivity);
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}
