export const factoryExample = {
  title: 'Ejemplo del patrón (Factory Method)',
  subtitle: 'Creator define <b>factoryMethod()</b> y decide qué <b>Product</b> instanciar.',
  note: 'La idea: el <code>Client</code> llama <code>someOperation()</code> y el <code>Creator</code> crea el <code>Product</code> (A o B) sin condicionar al cliente.',
  ts: {
    filename: 'factory-method.ts',
    code: `// factory-method.ts

// Product
interface Product {
  operation(): string;
}

class ConcreteProductA implements Product {
  operation() {
    return "ConcreteProductA";
  }
}

class ConcreteProductB implements Product {
  operation() {
    return "ConcreteProductB";
  }
}

// Creator
abstract class Creator {
  // Factory Method
  protected abstract factoryMethod(): Product;

  // Logic that uses the product
  public someOperation(): string {
    const product = this.factoryMethod();
    return "Creator uses " + product.operation();
  }
}

class ConcreteCreatorA extends Creator {
  protected factoryMethod(): Product {
    return new ConcreteProductA();
  }
}

class ConcreteCreatorB extends Creator {
  protected factoryMethod(): Product {
    return new ConcreteProductB();
  }
}

// Client
function clientCode(creator: Creator) {
  console.log(creator.someOperation());
}

clientCode(new ConcreteCreatorA());
clientCode(new ConcreteCreatorB());
`,
  },
  js: {
    filename: 'factory-method.js',
    code: `// factory-method.js

class ProductA {
  operation() {
    return "ProductA";
  }
}

class ProductB {
  operation() {
    return "ProductB";
  }
}

class CreatorA {
  factoryMethod() {
    return new ProductA();
  }

  someOperation() {
    const product = this.factoryMethod();
    return "Creator uses " + product.operation();
  }
}

class CreatorB {
  factoryMethod() {
    return new ProductB();
  }

  someOperation() {
    const product = this.factoryMethod();
    return "Creator uses " + product.operation();
  }
}

function clientCode(creator) {
  console.log(creator.someOperation());
}

clientCode(new CreatorA());
clientCode(new CreatorB());
`,
  },
};
