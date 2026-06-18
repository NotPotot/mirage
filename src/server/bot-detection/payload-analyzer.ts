import { signal } from '../../shared/scoring';
import type { Signal } from '../../types';

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|CREATE)\b.*\b(FROM|INTO|TABLE|SET|WHERE)\b)/i,
  /(';\s*DROP\s)/i,
  /(\bOR\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
  /(--\s|\/\*|\*\/|;\s*--)/,
  /(\bUNION\s+ALL\s+SELECT\b)/i,
];

const XSS_PATTERNS = [
  /(<script[\s>])/i,
  /(javascript\s*:)/i,
  /(on(load|error|click|mouseover|focus|blur)\s*=)/i,
  /(<iframe|<object|<embed|<svg\s)/i,
  /(document\.(cookie|write|location))/i,
  /(eval\s*\(|setTimeout\s*\(|setInterval\s*\()/i,
];

const STRUCTURED_SCRAPING_PATTERNS = [
  /\b(extract|scrape|crawl|dump|exfiltrate)\b.*\b(data|card|credit|payment|ssn|password)\b/i,
  /\b(list|show|return|give)\b.*\b(all|every)\b.*\b(users?|cards?|accounts?|passwords?|emails?)\b/i,
  /\b(ignore|bypass|skip|disable)\b.*\b(security|auth|validation|filter|protection)\b/i,
  /\bsystem\s*prompt\b/i,
  /\b(act as|pretend|you are now|new instructions|ignore previous)\b/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e/i,
  /etc\/passwd/i,
  /\/proc\/self/i,
];

export function analyzePayload(body: string): Signal[] {
  const signals: Signal[] = [];
  if (!body || body.length === 0) return signals;

  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(body)) {
      signals.push(
        signal('sql-injection-attempt', 30, 1, `SQL injection pattern detected: ${pattern.source.slice(0, 40)}`)
      );
      break;
    }
  }

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(body)) {
      signals.push(
        signal('xss-attempt', 30, 1, `XSS pattern detected: ${pattern.source.slice(0, 40)}`)
      );
      break;
    }
  }

  for (const pattern of STRUCTURED_SCRAPING_PATTERNS) {
    if (pattern.test(body)) {
      signals.push(
        signal('structured-prompt', 25, 1, `Structured scraping/prompt injection pattern detected`)
      );
      break;
    }
  }

  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(body)) {
      signals.push(
        signal('path-traversal', 25, 1, `Path traversal pattern detected`)
      );
      break;
    }
  }

  const structureScore = measureStructureLevel(body);
  if (structureScore > 0.7) {
    signals.push(
      signal(
        'highly-structured-input',
        15,
        structureScore,
        `Input is ${Math.round(structureScore * 100)}% structured — likely machine-generated`
      )
    );
  }

  return signals;
}

function measureStructureLevel(body: string): number {
  let indicators = 0;
  let total = 0;

  total++;
  if (/^\s*[\[{]/.test(body) && /[\]}]\s*$/.test(body)) indicators++;

  total++;
  const specialChars = (body.match(/[{}[\]<>|;`$\\]/g) || []).length;
  if (specialChars / body.length > 0.05) indicators++;

  total++;
  const lines = body.split('\n');
  if (lines.length > 3) {
    const lengths = lines.map((l) => l.length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length;
    if (Math.sqrt(variance) < avgLen * 0.2) indicators++;
  }

  total++;
  if (/\b(function|const|let|var|import|require|class|def|SELECT)\b/.test(body))
    indicators++;

  return total > 0 ? indicators / total : 0;
}
