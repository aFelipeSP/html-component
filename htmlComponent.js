class HTMLComponent extends HTMLElement {
    constructor() {
        super();
        this.__attrs__ = {}
        this.__initialValues__ = {};
        this.__initialValuesStarted__ = false;

        let props = this.props || {};
        Object.defineProperties(this, Object.entries(props).reduce(
            (accum, [key, prop]) => {
                let attr = prop.attr || this.__getDefaulAttr__(key);
                this.__attrs__[attr] = {name: key, prop};
                if (this.hasOwnProperty(key))
                    this.__initialValues__[key] = this[key];
                accum[key] = {
                    get: () => {
                        this.__setInitialValues__();
                        let attr = prop.attr || this.__getDefaulAttr__(key);
                        let attrValue = this.getAttribute(attr);
                        if (
                            (attrValue == null || attrValue === "")
                            && prop.type != 'boolean'
                        ) return prop.default;
                        return this.__attrToProp__(attrValue, prop.type);
                    },
                    set: (v) => {
                        this.__setInitialValues__(key);
                        this.__checkType__(key, v, prop.type);
                        let attr = prop.attr || this.__getDefaulAttr__(key);
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

    __setInitialValues__(propSetting) {
        if (this.__initialValuesStarted__) return;
        this.__initialValuesStarted__ = true;
        for (let key in this.__initialValues__) {
            if (key === propSetting) continue;
            this[key] = this.__initialValues__[key];
        }
    }

    __getDefaulAttr__(prop) {
        return 'data-' + prop.replaceAll(/[A-Z]/g, l => `-${l.toLowerCase()}`);
    }

    __checkType__(name, value, type) {
        if (
            (type == 'integer' && !Number.isInteger(value))
            || (
                ['string', 'boolean', 'number'].includes(type)
                && !(typeof value === type)
            )
        ) {
            throw new TypeError(
                `Type of "${name}" is ${type}. Value given: ${value}`
            );
        }
    }

    __attrToProp__(value, type) {
        if (type === 'number' || type === 'integer') return Number(value);
        else if (type === 'boolean') return value != null;
        else return value;
    }

    connectedCallback() { this.__setInitialValues__(); }

    attributeChangedCallback(name, oldValue, newValue) {
        let attrElement = this.__attrs__[name];
        let propName = attrElement.name, prop = attrElement.prop;

        let initialValuesStarted = this.__initialValuesStarted__;
        this.__setInitialValues__();
        if (!initialValuesStarted && propName in this.__initialValues__)
            return;

        if (oldValue !== newValue) {
            if (propName == null) return;
            if (prop.type != 'boolean') {
                let propValue = this.__attrToProp__(newValue, prop.type);
                try {
                    this.__checkType__(propName, propValue, prop.type);
                } catch (error) {
                    console.error(error);
                    if (oldValue == null) this.removeAttribute(attrName); 
                    else this.setAttribute(attrName, oldValue);
                    return;
                }
            }
            if (prop.handler)
                prop.handler.apply(this, [oldValue, newValue]);
        }
    }
}
