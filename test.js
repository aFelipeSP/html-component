class MyComponent extends HTMLComponent {
  static get observedAttributes () {
    return [
      'data-int-prop',
      'data-num-prop',
      'data-bool-prop',
      'data-str-prop'
    ]
  }
  get props() {
    return {
      intProp: {
        type: 'integer',
        default: 0,
        attr: 'data-int-prop',
        handler() {
          console.log('intProp', this.intProp);
        }
      },
      numProp: {
        type: 'number',
        default: 2.1,
        attr: 'data-num-prop',
        handler() {
          console.log(numProp);
        }
      },
      boolProp: {
        type: 'boolean',
        default: true,
        attr: 'data-bool-prop',
        handler() {
          console.log(this.boolProp);
        }
      },
      strProp: {
        type: 'string',
        default: 'hello world',
        attr: 'data-str-prop',
        handler() {
          console.log(this.strProp);
        }
      }
    }
  }

  constructor () {
    super();
    this.attachShadow({mode: 'open'})
    this.createElement([this.shadowRoot,
      ['div', 'label'],
      ['input', {name: 'yo', props: {name: 'yo', value: 'asdf'}}]  
    ])
    console.log(this.__refs__)
  }
}

customElements.define('my-input', MyComponent)