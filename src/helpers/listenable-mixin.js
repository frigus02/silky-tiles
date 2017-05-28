const ListenableMixin = (superclass = Object) => class extends superclass {
    constructor() {
        super();
        this._listeners = {};
    }

    addEventListener(eventName, callback) {
        this._getListeners(eventName).push(callback);
    }

    dispatchEvent(eventName, ...args) {
        const listeners = this._getListeners(eventName);
        for (const listener of listeners) {
            listener(...args);
        }
    }

    removeEventListener(eventName, callback) {
        const listeners = this._getListeners(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    _getListeners(eventName) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            this._listeners[eventName] = [];
        }

        return this._listeners[eventName];
    }
};

export default ListenableMixin;
