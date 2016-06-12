import Listenable from '../helpers/listenable';
import {mix} from '../helpers/utils';

export default class SimpleAdapter {
    constructor (containerElement) {
        Listenable.call(this, ['tileadded', 'tilechanged', 'tileremoved']);

        this._containerElement = containerElement;
        this._tiles = Array.from(containerElement.children);

        this._onChildrenMutated = this._onChildrenMutated.bind(this);

        this._observer = new MutationObserver(this._onChildrenMutated);
        this._observer.observe(containerElement, {
            childList: true
        });
    }

    _onChildrenMutated (records) {
        for (let record of records) {
            for (let node of record.addedNodes) {
                if (node instanceof Element) {
                    this._tiles.push(node);
                    this.dispatchEvent('tileadded', node);
                }
            }

            for (let node of record.removedNodes) {
                if (node instanceof Element) {
                    const index = this._tiles.indexOf(node);
                    this._tiles.splice(index, 1);
                    this.dispatchEvent('tileremoved', node);
                }
            }
        }
    }

    get container () {
        return this._containerElement;
    }

    get tiles () {
        return this._tiles;
    }

    getContainerBounds () {
        const bounds = this._containerElement.getBoundingClientRect();

        let absoluteTop = 0;
        let absoluteLeft = 0;
        let currentElement = this._containerElement;
        do {
            absoluteTop += currentElement.offsetTop;
            absoluteLeft += currentElement.offsetLeft;
            currentElement = currentElement.offsetParent;
        } while (currentElement);

        return {
            top: bounds.top,
            left: bounds.left,
            absoluteTop,
            absoluteLeft
        };
    }

    getTileBounds (tile) {
        const containerBounds = this.getContainerBounds();
        const bounds = tile.getBoundingClientRect();

        return {
            width: bounds.width,
            height: bounds.width,
            x: bounds.left - containerBounds.left,
            y: bounds.top - containerBounds.top
        };
    }
}

mix(SimpleAdapter, Listenable);
