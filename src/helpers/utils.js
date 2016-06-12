function copyProperties(target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}

export function getTouchCoordinate(evt, prop) {
    if (evt.touches && evt.touches.length > 0) {
        return evt.touches[0][prop];
    } else {
        return evt[prop];
    }
}

export function mix(target, ...mixins) {
    for (let mixin of mixins) {
        copyProperties(target, mixin);
        copyProperties(target.prototype, mixin.prototype);
    }
}
