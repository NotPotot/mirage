const HONEYPOT_NAMES = [
  'cc_number_confirm',
  'card_cvv2',
  'ssn_verify',
  'billing_phone_alt',
  'payment_routing',
  'account_pin_confirm',
  'card_number_2',
  'verify_ssn',
];

const HONEYPOT_ATTR = 'data-ch-honeypot';

interface HoneypotConfig {
  formSelector?: string;
  onTriggered?: (fieldName: string) => void;
}

export function injectHoneypots(config: HoneypotConfig = {}): () => void {
  const forms = document.querySelectorAll(
    config.formSelector || 'form'
  );
  const injected: HTMLElement[] = [];

  forms.forEach((formEl) => {
    const form = formEl as HTMLFormElement;
    const seed = hashCode(form.id || form.action || window.location.href);
    const selectedNames = selectNames(seed, 3);

    selectedNames.forEach((name) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute(HONEYPOT_ATTR, 'true');
      wrapper.setAttribute('aria-hidden', 'true');
      Object.assign(wrapper.style, {
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '0',
        height: '0',
        overflow: 'hidden',
        opacity: '0',
        pointerEvents: 'none',
      });

      const input = document.createElement('input');
      input.type = 'text';
      input.name = name;
      input.tabIndex = -1;
      input.autocomplete = 'off';
      input.setAttribute(HONEYPOT_ATTR, 'true');

      wrapper.appendChild(input);
      form.appendChild(wrapper);
      injected.push(wrapper);
    });

    form.addEventListener('submit', (e) => {
      const honeypotInputs = form.querySelectorAll(`[${HONEYPOT_ATTR}] input`);
      for (const input of honeypotInputs) {
        if ((input as HTMLInputElement).value) {
          e.preventDefault();
          config.onTriggered?.((input as HTMLInputElement).name);
          reportHoneypotTrigger((input as HTMLInputElement).name);
          return;
        }
      }
    });
  });

  return () => {
    injected.forEach((el) => el.remove());
  };
}

export function checkHoneypots(): { triggered: boolean; field: string | null } {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    `[${HONEYPOT_ATTR}]`
  );
  for (const input of inputs) {
    if (input.tagName === 'INPUT' && input.value) {
      return { triggered: true, field: input.name };
    }
  }
  return { triggered: false, field: null };
}

function reportHoneypotTrigger(fieldName: string) {
  const endpoint =
    document
      .querySelector('meta[name="mirage-report"]')
      ?.getAttribute('content') || '/api/mirage/report';

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'honeypot',
      field: fieldName,
      url: window.location.href,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

function selectNames(seed: number, count: number): string[] {
  const shuffled = [...HONEYPOT_NAMES];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
