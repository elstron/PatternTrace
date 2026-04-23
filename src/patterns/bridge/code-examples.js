export const bridgeExample = {
  title: 'Ejemplo del patrón (Bridge)',
  subtitle: 'Abstraction delega en Implementor para desacoplar dos jerarquías.',
  note: 'La clave: <code>Remote</code> no hereda de <code>TV</code>/<code>Radio</code>. En su lugar, <code>Remote</code> <b>compone</b> un <code>Device</code>.',
  ts: {
    filename: 'bridge.ts',
    code: `// bridge.ts

// Implementor
interface Device {
  enable(): void;
  disable(): void;
  setVolume(v: number): void;
  getName(): string;
}

class Tv implements Device {
  private on = false;
  private volume = 10;

  enable() { this.on = true; }
  disable() { this.on = false; }
  setVolume(v: number) { this.volume = Math.max(0, Math.min(100, v)); }
  getName() { return "TV"; }
}

class Radio implements Device {
  private on = false;
  private volume = 10;

  enable() { this.on = true; }
  disable() { this.on = false; }
  setVolume(v: number) { this.volume = Math.max(0, Math.min(100, v)); }
  getName() { return "Radio"; }
}

// Abstraction
class Remote {
  constructor(protected device: Device) {}

  operate(): string {
    this.device.enable();
    this.device.setVolume(20);
    return "Remote → " + this.device.getName() + " (vol=20)";
  }
}

class AdvancedRemote extends Remote {
  operate(): string {
    this.device.enable();
    this.device.setVolume(50);
    return "AdvancedRemote → " + this.device.getName() + " (vol=50)";
  }
}

// Client
const r1 = new Remote(new Tv());
console.log(r1.operate());

const r2 = new AdvancedRemote(new Radio());
console.log(r2.operate());
`,
  },
  js: {
    filename: 'bridge.js',
    code: `// bridge.js

class Tv {
  constructor() { this.on = false; this.volume = 10; }
  enable() { this.on = true; }
  disable() { this.on = false; }
  setVolume(v) { this.volume = Math.max(0, Math.min(100, v)); }
  getName() { return "TV"; }
}

class Radio {
  constructor() { this.on = false; this.volume = 10; }
  enable() { this.on = true; }
  disable() { this.on = false; }
  setVolume(v) { this.volume = Math.max(0, Math.min(100, v)); }
  getName() { return "Radio"; }
}

class Remote {
  constructor(device) { this.device = device; }
  operate() {
    this.device.enable();
    this.device.setVolume(20);
    return "Remote → " + this.device.getName() + " (vol=20)";
  }
}

class AdvancedRemote extends Remote {
  operate() {
    this.device.enable();
    this.device.setVolume(50);
    return "AdvancedRemote → " + this.device.getName() + " (vol=50)";
  }
}

const r1 = new Remote(new Tv());
console.log(r1.operate());

const r2 = new AdvancedRemote(new Radio());
console.log(r2.operate());
`,
  },
};
