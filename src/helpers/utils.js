export function getTouchCoordinate(evt, prop) {
    if (evt.touches && evt.touches.length > 0) {
        return evt.touches[0][prop];
    } else {
        return evt[prop];
    }
}
