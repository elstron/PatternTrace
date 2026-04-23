export const prototypeExample = {
  title: 'Ejemplo del patrón (Prototype)',
  subtitle: 'Crea objetos copiando un <b>prototipo</b> en lugar de instanciarlos desde cero.',
  note: 'Útil cuando crear un objeto es caro o cuando quieres clonar configuraciones base. En JS, a menudo se hace con <code>Object.create</code> o copiando estructuras.',
  ts: {
    filename: 'prototype.ts',
    code: `// prototype.ts

type Cloneable<T> = {
  clone(): T;
};

class DocumentProto implements Cloneable<DocumentProto> {
  constructor(
    public title: string,
    public body: string,
    public tags: string[]
  ) {}

  clone(): DocumentProto {
    // Important: copy nested data
    return new DocumentProto(this.title, this.body, [...this.tags]);
  }
}

const base = new DocumentProto(
  'Template',
  'Hello...',
  ['draft']
);

const d1 = base.clone();
const d2 = base.clone();

d1.title = 'Doc A';
(d2.tags).push('review');

console.log(base, d1, d2);
`,
  },
  js: {
    filename: 'prototype.js',
    code: `// prototype.js

class DocumentProto {
  constructor(title, body, tags) {
    this.title = title;
    this.body = body;
    this.tags = tags;
  }

  clone() {
    // Copy nested data
    return new DocumentProto(this.title, this.body, [...this.tags]);
  }
}

const base = new DocumentProto('Template', 'Hello...', ['draft']);

const d1 = base.clone();
const d2 = base.clone();

d1.title = 'Doc A';
d2.tags.push('review');

console.log(base, d1, d2);
`,
  },
};
