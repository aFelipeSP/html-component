class HTMLComponent extends HTMLElement {
    constructor() {
        super();
        let props = this.props || {};
        Object.defineProperties(this, Object.entries(props).reduce(
            (accum, [key, prop]) => {
                accum[key] = {
                    get: () => {
                        if (prop.type === 'boolean') {
                            return this['_' + key] != null;
                        } else {
                            let val = this['_' + key];
                            return val == null ? prop.default : val;
                        }
                    },
                    set: (v) => {
                        this.__checkType__(key, v, prop.type);
                        let attr = prop.attr || this.__getPropDefault__(key);
                        if (prop.type === 'boolean') {
                            if (v) this.setAttribute(attr, '');
                            else this.removeAttribute(attr);
                        } else {
                            this.setAttribute(attr, v);
                        }
                    }
                };
                return accum;
            }, {}
        ))

    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            let [propName, prop] = this.__propFromAttr__(name);
            let success = true;
            let propValue;
            if (prop.type != 'boolean') {
                propValue = this.__attrToProp__(newValue, prop.type);
                try {
                    this.__checkType__(propName, propValue, prop.type);
                } catch (error) {
                    console.error(error);
                    if (oldValue == null) this.removeAttribute(name); 
                    else this.setAttribute(name, oldValue);
                    success = false;
                }
            }
            if (success) {
                let value = (prop.type === 'boolean') ? newValue != null : (
                    propValue == null ? prop.default : propValue
                );
                if (value != this['_' + propName]) {
                    this['_' + propName] = value
                    if (prop.handler) prop.handler.apply(this);
                }
            }
        }
    }

    connectedCallback() {
        this.__upgradeProperties__();
    }

    __checkType__ (name, value, type) {
        if ((type == 'integer' && !Number.isInteger(value))
            || ((type == 'string' || type == 'boolean' || type == 'number')
                 && !typeof value === type
            )
        ) {
            throw new TypeError(`Type of "${name}" is ${type}. Value given: ${value}`);
        }
    }

    __getPropDefault__(prop) {
        return this.props[prop].attr || 'data-' + prop.toLowerCase();
    }

    __propFromAttr__(attr) {
        for (let key in this.props) {
            let prop = this.props[key];
            if ((prop.attr || this.__getPropDefault__(key)) === attr) {
                return [key, prop];
            } 
        }
    }
    
    __attrToProp__ (value, type) {
        if (type === 'number' || type === 'integer') {
            return Number(value);
        } else if (type === 'boolean') {
            return value != null;
        } else {
            return value
        }
    }

    __upgradeProperties__() {
        for (let prop in Object.keys(this.props)) {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }
    }
}
