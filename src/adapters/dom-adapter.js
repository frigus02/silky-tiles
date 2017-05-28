import BaseAdapter from './base-adapter';

export default class DomAdapter extends BaseAdapter {
    constructor(containerElement) {
        super();

        this._containerElement = containerElement;
        this._containerElement.classList.add('st-container');
        this._tiles = Array.from(containerElement.children);
        this._tiles.forEach(tile => {
            tile.classList.add('st-tile');
        })

        this._onChildrenMutated = this._onChildrenMutated.bind(this);

        this._observer = new MutationObserver(this._onChildrenMutated);
        this._observer.observe(containerElement, {
            childList: true
        });
    }

    _onChildrenMutated(records) {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node instanceof Element) {
                    node.classList.add('st-tile');
                    this._tiles.push(node);
                    this.dispatchEvent('tileadded', node);
                }
            }

            for (const node of record.removedNodes) {
                if (node instanceof Element) {
                    const index = this._tiles.indexOf(node);
                    this._tiles.splice(index, 1);
                    this.dispatchEvent('tileremoved', node);
                }
            }
        }
    }

    get container() {
        return this._containerElement;
    }

    get tiles() {
        return this._tiles;
    }

    getContainerBounds() {
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

    getTileBounds(tile) {
        const containerBounds = this.getContainerBounds();
        const bounds = tile.getBoundingClientRect();

        return {
            width: bounds.width,
            height: bounds.width,
            x: bounds.left - containerBounds.left,
            y: bounds.top - containerBounds.top
        };
    }

    getTileLayoutParams(tile) {
        return {
            position: parseInt(tile.dataset.tilePosition, 10),
            width: parseInt(tile.dataset.tileWidth, 10) || 1,
            height: parseInt(tile.dataset.tileHeight, 10) || 1
        };
    }

    onTilePositionChanged(tile, newPosition) {
        tile.dataset.tilePosition = newPosition;
    }
}
