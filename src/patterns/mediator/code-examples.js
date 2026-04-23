export const mediatorExample = {
  title: "Mediator (TS/JS)",
  subtitle: "Los componentes no se hablan directo; el Mediator coordina.",
  note: "En UI reales, el mediador suele ser un controller/store/event-bus. Este ejemplo es intencionalmente pequeño.",
  ts: {
    filename: "mediator.ts",
    code:
      "type EventName = 'login' | 'logout' | 'cart:add' | 'cart:clear';\n\ninterface Mediator {\n  notify(sender: object, event: EventName): void;\n}\n\nclass Header {\n  constructor(private mediator: Mediator) {}\n  clickLogin() { this.mediator.notify(this, 'login'); }\n  clickLogout() { this.mediator.notify(this, 'logout'); }\n}\n\nclass Cart {\n  items = 0;\n  constructor(private mediator: Mediator) {}\n  add() { this.items++; this.mediator.notify(this, 'cart:add'); }\n  clear() { this.items = 0; this.mediator.notify(this, 'cart:clear'); }\n}\n\nclass AppMediator implements Mediator {\n  private loggedIn = false;\n  constructor(private header: Header, private cart: Cart) {}\n\n  notify(sender: object, event: EventName) {\n    if (event === 'login') this.loggedIn = true;\n    if (event === 'logout') { this.loggedIn = false; this.cart.clear(); }\n\n    if (!this.loggedIn && event === 'cart:add') {\n      console.log('Denied: login required');\n      return;\n    }\n\n    console.log('event:', event, 'loggedIn:', this.loggedIn, 'items:', this.cart.items);\n  }\n}\n\n// wiring\nlet mediator!: AppMediator;\nconst header = new Header({ notify: (s,e) => mediator.notify(s,e) });\nconst cart = new Cart({ notify: (s,e) => mediator.notify(s,e) });\nmediator = new AppMediator(header, cart);\n\nheader.clickLogin();\ncart.add();\nheader.clickLogout();\n",
  },
  js: {
    filename: "mediator.js",
    code:
      "class Header {\n  constructor(mediator) { this.mediator = mediator; }\n  clickLogin() { this.mediator.notify(this, 'login'); }\n  clickLogout() { this.mediator.notify(this, 'logout'); }\n}\n\nclass Cart {\n  constructor(mediator) { this.mediator = mediator; this.items = 0; }\n  add() { this.items++; this.mediator.notify(this, 'cart:add'); }\n  clear() { this.items = 0; this.mediator.notify(this, 'cart:clear'); }\n}\n\nclass AppMediator {\n  constructor(header, cart) {\n    this.header = header;\n    this.cart = cart;\n    this.loggedIn = false;\n  }\n\n  notify(sender, event) {\n    if (event === 'login') this.loggedIn = true;\n    if (event === 'logout') { this.loggedIn = false; this.cart.clear(); }\n\n    if (!this.loggedIn && event === 'cart:add') {\n      console.log('Denied: login required');\n      return;\n    }\n\n    console.log('event:', event, 'loggedIn:', this.loggedIn, 'items:', this.cart.items);\n  }\n}\n\nlet mediator;\nconst header = new Header({ notify: (s,e) => mediator.notify(s,e) });\nconst cart = new Cart({ notify: (s,e) => mediator.notify(s,e) });\nmediator = new AppMediator(header, cart);\n\nheader.clickLogin();\ncart.add();\nheader.clickLogout();\n",
  },
};
