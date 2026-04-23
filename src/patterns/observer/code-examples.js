export const observerExample = {
  title: 'Ejemplo del patrón (Observer)',
  subtitle: '<b>Subject</b> mantiene una lista de <b>Observers</b> y los notifica cuando cambia su estado.',
  note: 'La demo de esta página usa JS “vanilla” para interactuar con la UI, pero el contrato del patrón se ve igual en TS.',
  ts: {
    filename: 'observer.ts',
    code: `// observer.ts

interface IObserver {
  update(state: string): void;
}

class Subject {
  private observers = new Set<IObserver>();
  private state = "";

  attach(o: IObserver) { this.observers.add(o); }
  detach(o: IObserver) { this.observers.delete(o); }

  setState(next: string) {
    this.state = next;
    this.notify();
  }

  notify() {
    for (const o of this.observers) o.update(this.state);
  }
}

class Observer implements IObserver {
  constructor(private name: string) {}
  update(state: string) {
    console.log(this.name + " received: " + state);
  }
}

const subject = new Subject();
const a = new Observer("Observer A");
const b = new Observer("Observer B");

subject.attach(a);
subject.attach(b);
subject.setState("new-state");
`,
  },
  js: {
    filename: 'observer.js',
    code: `// observer.js

class Subject {
  constructor() {
    this.state = "";
    this.observers = new Set();
  }
  attach(o) { this.observers.add(o); }
  detach(o) { this.observers.delete(o); }
  setState(next) {
    this.state = next;
    this.notify();
  }
  notify() {
    for (const o of this.observers) o.update(this.state);
  }
}

class Observer {
  constructor(name) { this.name = name; }
  update(state) {
    console.log(this.name + " received: " + state);
  }
}

const subject = new Subject();
const a = new Observer("Observer A");
const b = new Observer("Observer B");

subject.attach(a);
subject.attach(b);
subject.setState("new-state");
`,
  },
};
