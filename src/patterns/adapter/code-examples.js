export const adapterExample = {
  title: 'Ejemplo del patrón (Adapter)',
  subtitle: 'El cliente depende de <b>Target</b>. <b>Adapter</b> implementa Target y delega en <b>Adaptee</b>.',
  note: 'En JS/TS lo clave es que <code>Adapter</code> tiene la misma interfaz que <code>Target</code> y traduce la llamada hacia <code>Adaptee</code>.',
  ts: {
    filename: 'adapter.ts',
    code: `// adapter.ts

// Target: what the client expects
interface Target {
  request(): string;
}

// Adaptee: legacy/incompatible API
class Adaptee {
  specificRequest(): string {
    return "[[raw: legacy-data]]";
  }
}

// Adapter: implements Target and translates to Adaptee
class Adapter implements Target {
  constructor(private adaptee: Adaptee) {}

  request(): string {
    const raw = this.adaptee.specificRequest();
    return raw.replace("[[raw:", "").replace("]]", "").trim();
  }
}

// Client
function clientCode(target: Target) {
  console.log(target.request());
}

clientCode(new Adapter(new Adaptee()));
`,
  },
  js: {
    filename: 'adapter.js',
    code: `// adapter.js

// Adaptee (legacy)
class Adaptee {
  specificRequest() {
    return "[[raw: legacy-data]]";
  }
}

// Adapter (Target-compatible)
class Adapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
  }

  request() {
    const raw = this.adaptee.specificRequest();
    return raw.replace("[[raw:", "").replace("]]", "").trim();
  }
}

function clientCode(target) {
  console.log(target.request());
}

clientCode(new Adapter(new Adaptee()));
`,
  },
};
