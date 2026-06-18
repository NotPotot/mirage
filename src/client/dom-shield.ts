const realValues = new WeakMap<HTMLInputElement, string>();
const originalDescriptors = new WeakMap<
  HTMLInputElement,
  PropertyDescriptor | undefined
>();
let inInputEvent = false;

export function protectSensitiveFields(selectors: string[]): () => void {
  const selector = selectors.join(', ');
  const elements = document.querySelectorAll<HTMLInputElement>(selector);
  const observers: MutationObserver[] = [];

  elements.forEach((el) => shieldElement(el));

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          const newInputs = node.querySelectorAll<HTMLInputElement>(selector);
          newInputs.forEach((el) => shieldElement(el));
          if (node.matches?.(selector) && node instanceof HTMLInputElement) {
            shieldElement(node);
          }
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  observers.push(observer);

  return () => {
    observers.forEach((o) => o.disconnect());
    elements.forEach((el) => unshieldElement(el));
  };
}

function shieldElement(el: HTMLInputElement) {
  if (realValues.has(el)) return;

  realValues.set(el, el.value);

  const originalDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  );
  originalDescriptors.set(el, originalDescriptor);

  Object.defineProperty(el, 'value', {
    get() {
      if (inInputEvent) return realValues.get(el) || '';
      return maskValue(realValues.get(el) || '');
    },
    set(newVal: string) {
      realValues.set(el, newVal);
      if (originalDescriptor?.set) {
        originalDescriptor.set.call(el, newVal);
      }
    },
    configurable: true,
  });

  el.addEventListener('input', handleInput);
  el.addEventListener('change', handleInput);

  const form = el.closest('form');
  if (form && !form.hasAttribute('data-ch-submit-hooked')) {
    form.setAttribute('data-ch-submit-hooked', 'true');
    form.addEventListener('submit', handleSubmit, { capture: true });
  }
}

function unshieldElement(el: HTMLInputElement) {
  const descriptor = originalDescriptors.get(el);
  if (descriptor) {
    Object.defineProperty(el, 'value', descriptor);
  } else {
    delete (el as any).value;
  }
  el.removeEventListener('input', handleInput);
  el.removeEventListener('change', handleInput);
  realValues.delete(el);
  originalDescriptors.delete(el);
}

function handleInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const descriptor = originalDescriptors.get(el);
  if (descriptor?.get) {
    const actualValue = descriptor.get.call(el);
    realValues.set(el, actualValue);
  }
  inInputEvent = true;
  setTimeout(() => { inInputEvent = false; }, 0);
}

function handleSubmit(e: Event) {
  const form = e.target as HTMLFormElement;
  const shielded = form.querySelectorAll<HTMLInputElement>('[data-sensitive]');

  shielded.forEach((el) => {
    const real = realValues.get(el);
    if (real !== undefined) {
      const descriptor = originalDescriptors.get(el);
      if (descriptor?.set) {
        descriptor.set.call(el, real);
      }
    }
  });

  setTimeout(() => {
    shielded.forEach((el) => {
      const descriptor = originalDescriptors.get(el);
      if (descriptor?.set) {
        descriptor.set.call(el, maskValue(realValues.get(el) || ''));
      }
    });
  }, 100);
}

function maskValue(value: string): string {
  if (!value) return value;
  if (value.length <= 4) return '*'.repeat(value.length);
  const visible = value.slice(-4);
  return '*'.repeat(value.length - 4) + visible;
}

export function getRealValue(el: HTMLInputElement): string | undefined {
  return realValues.get(el);
}
