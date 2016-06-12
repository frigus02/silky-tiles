export default function Listenable(supportedEvents) {
    this._listeners = {};

    for (let eventName of supportedEvents) {
        this._listeners[eventName] = [];
    }
}

Listenable.prototype.addEventListener = function addEventListener(eventName, callback) {
    this._listeners[eventName].push(callback);
};

Listenable.prototype.dispatchEvent = function dispatchEvent(eventName, ...args) {
    for (let listener of this._listeners[eventName]) {
        listener(...args);
    }
};

Listenable.prototype.removeEventListener = function removeEventListener(eventName, callback) {
    const index = this._listeners[eventName].indexOf(callback);
    if (index > -1) {
        this._listeners[eventName].splice(index, 1);
    }
};
