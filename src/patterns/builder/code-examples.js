export const builderExample = {
  title: 'Ejemplo del patrón (Builder)',
  subtitle: 'Separa <b>la construcción</b> de un objeto complejo de su <b>representación</b>. Un mismo proceso produce distintos resultados.',
  note: 'La idea: el <code>Director</code> orquesta pasos y el <code>Builder</code> decide cómo materializarlos. Útil para objetos con muchas combinaciones.',
  ts: {
    filename: 'builder.ts',
    code: `// builder.ts

type House = {
  walls: string;
  roof: string;
  garage?: boolean;
  pool?: boolean;
};

interface HouseBuilder {
  reset(): void;
  buildWalls(): void;
  buildRoof(): void;
  addGarage(): void;
  addPool(): void;
  getResult(): House;
}

class ConcreteHouseBuilder implements HouseBuilder {
  private house: House;

  constructor() {
    this.house = { walls: 'none', roof: 'none' };
  }

  reset() {
    this.house = { walls: 'none', roof: 'none' };
  }

  buildWalls() {
    this.house.walls = 'brick';
  }

  buildRoof() {
    this.house.roof = 'tile';
  }

  addGarage() {
    this.house.garage = true;
  }

  addPool() {
    this.house.pool = true;
  }

  getResult() {
    return this.house;
  }
}

class Director {
  constructor(private builder: HouseBuilder) {}

  buildMinimalHouse() {
    this.builder.reset();
    this.builder.buildWalls();
    this.builder.buildRoof();
    return this.builder.getResult();
  }

  buildLuxuryHouse() {
    this.builder.reset();
    this.builder.buildWalls();
    this.builder.buildRoof();
    this.builder.addGarage();
    this.builder.addPool();
    return this.builder.getResult();
  }
}

const builder = new ConcreteHouseBuilder();
const director = new Director(builder);

console.log(director.buildMinimalHouse());
console.log(director.buildLuxuryHouse());
`,
  },
  js: {
    filename: 'builder.js',
    code: `// builder.js

class ConcreteHouseBuilder {
  constructor() {
    this.house = { walls: 'none', roof: 'none' };
  }

  reset() {
    this.house = { walls: 'none', roof: 'none' };
  }

  buildWalls() {
    this.house.walls = 'brick';
  }

  buildRoof() {
    this.house.roof = 'tile';
  }

  addGarage() {
    this.house.garage = true;
  }

  addPool() {
    this.house.pool = true;
  }

  getResult() {
    return this.house;
  }
}

class Director {
  constructor(builder) {
    this.builder = builder;
  }

  buildMinimalHouse() {
    this.builder.reset();
    this.builder.buildWalls();
    this.builder.buildRoof();
    return this.builder.getResult();
  }

  buildLuxuryHouse() {
    this.builder.reset();
    this.builder.buildWalls();
    this.builder.buildRoof();
    this.builder.addGarage();
    this.builder.addPool();
    return this.builder.getResult();
  }
}

const builder = new ConcreteHouseBuilder();
const director = new Director(builder);

console.log(director.buildMinimalHouse());
console.log(director.buildLuxuryHouse());
`,
  },
};
