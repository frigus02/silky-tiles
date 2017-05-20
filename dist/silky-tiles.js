(function (exports) {
'use strict';

function Listenable(supportedEvents) {
    this._listeners = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = supportedEvents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var eventName = _step.value;

            this._listeners[eventName] = [];
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

Listenable.prototype.addEventListener = function addEventListener(eventName, callback) {
    this._listeners[eventName].push(callback);
};

Listenable.prototype.dispatchEvent = function dispatchEvent(eventName) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = this._listeners[eventName][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var listener = _step2.value;

            listener.apply(undefined, args);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }
};

Listenable.prototype.removeEventListener = function removeEventListener(eventName, callback) {
    var index = this._listeners[eventName].indexOf(callback);
    if (index > -1) {
        this._listeners[eventName].splice(index, 1);
    }
};

function copyProperties(target, source) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Reflect.ownKeys(source)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
                var desc = Object.getOwnPropertyDescriptor(source, key);
                Object.defineProperty(target, key, desc);
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}

function getTouchCoordinate(evt, prop) {
    if (evt.touches && evt.touches.length > 0) {
        return evt.touches[0][prop];
    } else {
        return evt[prop];
    }
}

function mix(target) {
    for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        mixins[_key - 1] = arguments[_key];
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = mixins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var mixin = _step2.value;

            copyProperties(target, mixin);
            copyProperties(target.prototype, mixin.prototype);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var DragHandler = function () {
    function DragHandler(silkyTiles) {
        classCallCheck(this, DragHandler);

        Listenable.call(this, ['dragstart', 'dragend']);

        this._silkyTiles = silkyTiles;
        this._adapter = null;
        this._tile = null;
        this._startX = 0;
        this._startY = 0;
        this._currentX = 0;
        this._currentY = 0;

        this._initEventListeners = this._initEventListeners.bind(this);
        this._destroyEventListeners = this._destroyEventListeners.bind(this);
        this._onDragStart = this._onDragStart.bind(this);
        this._onDragMove = this._onDragMove.bind(this);
        this._onDragEnd = this._onDragEnd.bind(this);
    }

    createClass(DragHandler, [{
        key: '_initEventListeners',
        value: function _initEventListeners(tile) {
            if (window.PointerEvent) {
                tile.addEventListener('pointerdown', this._onDragStart);
            } else {
                tile.addEventListener('touchstart', this._onDragStart);
                tile.addEventListener('mousedown', this._onDragStart);
            }
        }
    }, {
        key: '_destroyEventListeners',
        value: function _destroyEventListeners(tile) {
            if (window.PointerEvent) {
                tile.removeEventListener('pointerdown', this._onDragStart);
            } else {
                tile.removeEventListener('touchstart', this._onDragStart);
                tile.removeEventListener('mousedown', this._onDragStart);
            }
        }
    }, {
        key: '_onDragStart',
        value: function _onDragStart(evt) {
            if (this._tile) return;

            evt.preventDefault();

            this._tile = evt.currentTarget;

            var currentPosition = this._silkyTiles.getTilePosition(this._tile);

            this._currentX = getTouchCoordinate(evt, 'pageX');
            this._currentY = getTouchCoordinate(evt, 'pageY');
            this._startX = this._currentX - currentPosition.x;
            this._startY = this._currentY - currentPosition.y;

            this._tile.classList.add('st-is-dragging');

            if (window.PointerEvent) {
                this._tile.addEventListener('pointermove', this._onDragMove);
                this._tile.addEventListener('pointerup', this._onDragEnd);
                this._tile.addEventListener('pointercancel', this._onDragEnd);

                this._tile.setPointerCapture(evt.pointerId);
            } else {
                document.addEventListener('touchmove', this._onDragMove);
                document.addEventListener('touchend', this._onDragEnd);
                document.addEventListener('mousemove', this._onDragMove);
                document.addEventListener('mouseup', this._onDragEnd);
            }

            this.dispatchEvent('dragstart', this._tile);
        }
    }, {
        key: '_onDragMove',
        value: function _onDragMove(evt) {
            if (!this._tile) return;

            this._currentX = getTouchCoordinate(evt, 'pageX');
            this._currentY = getTouchCoordinate(evt, 'pageY');
        }
    }, {
        key: '_onDragEnd',
        value: function _onDragEnd() {
            if (!this._tile) return;

            if (window.PointerEvent) {
                this._tile.removeEventListener('pointermove', this._onDragMove);
                this._tile.removeEventListener('pointerup', this._onDragEnd);
                this._tile.removeEventListener('pointercancel', this._onDragEnd);
            } else {
                document.removeEventListener('touchmove', this._onDragMove);
                document.removeEventListener('touchend', this._onDragEnd);
                document.removeEventListener('mousemove', this._onDragMove);
                document.removeEventListener('mouseup', this._onDragEnd);
            }

            this._tile.classList.remove('st-is-dragging');

            this.dispatchEvent('dragend', this._tile);

            this._tile = null;
        }
    }, {
        key: '_getTileAtPosition',
        value: function _getTileAtPosition(x, y) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._adapter.tiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var tile = _step.value;

                    var position = this._silkyTiles.getTilePosition(tile);

                    if (tile !== this._tile && x > position.x && x < position.x + position.width && y > position.y && y < position.y + position.height) {
                        return tile;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: 'layout',
        value: function layout() {
            if (!this._tile) return;

            var containerBounds = this._adapter.getContainerBounds();
            var targetTile = this._getTileAtPosition(this._currentX - containerBounds.absoluteLeft, this._currentY - containerBounds.absoluteTop);

            if (targetTile) {
                this._adapter.onTileMoved(this._tile, targetTile);
            }

            return {
                x: this._currentX - this._startX,
                y: this._currentY - this._startY
            };
        }
    }, {
        key: 'adapter',
        get: function get$$1() {
            return this._adapter;
        },
        set: function set$$1(adapter) {
            if (this._adapter) {
                this._adapter.removeEventListener('tileadded', this._initEventListeners);
                this._adapter.tiles.forEach(this._destroyEventListeners);
            }

            this._adapter = adapter;
            this._adapter.tiles.forEach(this._initEventListeners);
            this._adapter.addEventListener('tileadded', this._initEventListeners);
        }
    }]);
    return DragHandler;
}();

mix(DragHandler, Listenable);

var BaseLayout = function () {
    function BaseLayout() {
        classCallCheck(this, BaseLayout);

        this._positions = new WeakMap();
    }

    createClass(BaseLayout, [{
        key: "getTilePosition",
        value: function getTilePosition(tile) {
            return this._positions.get(tile);
        }
    }, {
        key: "layout",
        value: function layout() {}
    }, {
        key: "onTileAdded",
        value: function onTileAdded() /*tile*/{}
    }, {
        key: "onTileChanged",
        value: function onTileChanged() /*tile*/{}
    }, {
        key: "onTileRemoved",
        value: function onTileRemoved() /*tile*/{}
    }, {
        key: "onWidthChanged",
        value: function onWidthChanged() /*width*/{}
    }, {
        key: "setTilePosition",
        value: function setTilePosition(tile, position) {
            this._positions.set(tile, position);
        }
    }, {
        key: "height",
        get: function get$$1() {}
    }]);
    return BaseLayout;
}();

var ColumnLayout = function (_BaseLayout) {
    inherits(ColumnLayout, _BaseLayout);

    function ColumnLayout(options) {
        classCallCheck(this, ColumnLayout);

        var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ColumnLayout).call(this));

        _this._options = {
            columns: 5,
            margin: 8,
            outerMargin: true
        };
        Object.assign(_this._options, options);

        _this._tiles = [];
        _this._queue = [];
        _this._tileWidth = 1;
        _this._height = 0;
        return _this;
    }

    createClass(ColumnLayout, [{
        key: 'layout',
        value: function layout(layoutParamsGetter) {
            var _this2 = this;

            var queue = this._queue;
            this._queue = [];

            queue.forEach(function (tile) {
                var layoutParams = layoutParamsGetter(tile);
                var row = Math.floor(layoutParams.position / _this2._options.columns);
                var col = layoutParams.position - row * _this2._options.columns;
                var translateX = col * (_this2._tileWidth + _this2._options.margin);
                var translateY = row * (_this2._tileWidth + _this2._options.margin);
                if (_this2._options.outerMargin) {
                    translateX += _this2._options.margin;
                    translateY += _this2._options.margin;
                }

                _this2._height = Math.max(_this2._height, (row + 1) * (_this2._tileWidth + _this2._options.margin) + (_this2._options.outerMargin ? _this2._options.margin : -_this2._options.margin));

                _this2.setTilePosition(tile, {
                    x: translateX,
                    y: translateY,
                    width: _this2._tileWidth,
                    height: _this2._tileWidth
                });
            });

            return queue;
        }
    }, {
        key: 'onTileAdded',
        value: function onTileAdded(tile) {
            this._tiles.push(tile);
            this._queue.push(tile);
        }
    }, {
        key: 'onTileChanged',
        value: function onTileChanged(tile) {
            this._queue.push(tile);
        }
    }, {
        key: 'onTileRemoved',
        value: function onTileRemoved(tile) {
            var index = this._tiles.indexOf(tile);
            if (index > -1) {
                var _queue;

                this._tiles.splice(index, 1);
                (_queue = this._queue).push.apply(_queue, toConsumableArray(this._tiles));
            }
        }
    }, {
        key: 'onWidthChanged',
        value: function onWidthChanged(width) {
            var _queue2;

            (_queue2 = this._queue).push.apply(_queue2, toConsumableArray(this._tiles));

            if (this._options.outerMargin) {
                this._tileWidth = (width - (this._options.columns + 1) * this._options.margin) / this._options.columns;
            } else {
                this._tileWidth = (width - (this._options.columns - 1) * this._options.margin) / this._options.columns;
            }

            this._height = 0;
        }
    }, {
        key: 'height',
        get: function get$$1() {
            return this._height;
        }
    }]);
    return ColumnLayout;
}(BaseLayout);

var FlowLayout = function (_BaseLayout) {
    inherits(FlowLayout, _BaseLayout);

    function FlowLayout(options) {
        classCallCheck(this, FlowLayout);

        var _this = possibleConstructorReturn(this, Object.getPrototypeOf(FlowLayout).call(this));

        _this._options = {
            tileWidth: 96,
            tileHeight: 96,
            margin: 8,
            outerMargin: true
        };
        Object.assign(_this._options, options);

        _this._tiles = [];
        _this._queue = [];
        _this._tilesInRow = 1;
        _this._height = 0;
        return _this;
    }

    createClass(FlowLayout, [{
        key: 'layout',
        value: function layout(layoutParamsGetter) {
            var _this2 = this;

            var queue = this._queue;
            this._queue = [];

            queue.forEach(function (tile) {
                var layoutParams = layoutParamsGetter(tile);
                var row = Math.floor(layoutParams.position / _this2._tilesInRow);
                var col = layoutParams.position - row * _this2._tilesInRow;
                var translateX = col * (_this2._options.tileWidth + _this2._options.margin);
                var translateY = row * (_this2._options.tileHeight + _this2._options.margin);
                if (_this2._options.outerMargin) {
                    translateX += _this2._options.margin;
                    translateY += _this2._options.margin;
                }

                _this2._height = Math.max(_this2._height, (row + 1) * (_this2._options.tileHeight + _this2._options.margin) + (_this2._options.outerMargin ? _this2._options.margin : -_this2._options.margin));

                _this2.setTilePosition(tile, {
                    x: translateX,
                    y: translateY,
                    width: _this2._options.tileWidth,
                    height: _this2._options.tileHeight
                });
            });

            return queue;
        }
    }, {
        key: 'onTileAdded',
        value: function onTileAdded(tile) {
            this._tiles.push(tile);
            this._queue.push(tile);
        }
    }, {
        key: 'onTileChanged',
        value: function onTileChanged(tile) {
            this._queue.push(tile);
        }
    }, {
        key: 'onTileRemoved',
        value: function onTileRemoved(tile) {
            var index = this._tiles.indexOf(tile);
            if (index > -1) {
                var _queue;

                this._tiles.splice(index, 1);
                (_queue = this._queue).push.apply(_queue, toConsumableArray(this._tiles));
            }
        }
    }, {
        key: 'onWidthChanged',
        value: function onWidthChanged(width) {
            var _queue2;

            (_queue2 = this._queue).push.apply(_queue2, toConsumableArray(this._tiles));

            if (this._options.outerMargin) {
                this._tilesInRow = Math.floor((width - this._options.margin) / (this._options.tileWidth + this._options.margin));
            } else {
                this._tilesInRow = Math.floor((width + this._options.margin) / (this._options.tileWidth + this._options.margin));
            }

            if (this._tilesInRow < 1) {
                this._tilesInRow = 1;
            }

            this._height = 0;
        }
    }, {
        key: 'height',
        get: function get$$1() {
            return this._height;
        }
    }]);
    return FlowLayout;
}(BaseLayout);

var BaseAdapter = function () {
    function BaseAdapter(containerElement) {
        classCallCheck(this, BaseAdapter);

        Listenable.call(this, ['tileadded', 'tilechanged', 'tileremoved']);

        this._containerElement = containerElement;
        this._tiles = Array.from(containerElement.children);

        this._onChildrenMutated = this._onChildrenMutated.bind(this);

        this._observer = new MutationObserver(this._onChildrenMutated);
        this._observer.observe(containerElement, {
            childList: true
        });
    }

    createClass(BaseAdapter, [{
        key: '_onChildrenMutated',
        value: function _onChildrenMutated(records) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var record = _step.value;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = record.addedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var node = _step2.value;

                            if (node instanceof Element) {
                                this._tiles.push(node);
                                this.dispatchEvent('tileadded', node);
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = record.removedNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var _node = _step3.value;

                            if (_node instanceof Element) {
                                var index = this._tiles.indexOf(_node);
                                this._tiles.splice(index, 1);
                                this.dispatchEvent('tileremoved', _node);
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: 'getContainerBounds',
        value: function getContainerBounds() {
            var bounds = this._containerElement.getBoundingClientRect();

            var absoluteTop = 0;
            var absoluteLeft = 0;
            var currentElement = this._containerElement;
            do {
                absoluteTop += currentElement.offsetTop;
                absoluteLeft += currentElement.offsetLeft;
                currentElement = currentElement.offsetParent;
            } while (currentElement);

            return {
                top: bounds.top,
                left: bounds.left,
                absoluteTop: absoluteTop,
                absoluteLeft: absoluteLeft
            };
        }
    }, {
        key: 'getTileBounds',
        value: function getTileBounds(tile) {
            var containerBounds = this.getContainerBounds();
            var bounds = tile.getBoundingClientRect();

            return {
                width: bounds.width,
                height: bounds.width,
                x: bounds.left - containerBounds.left,
                y: bounds.top - containerBounds.top
            };
        }
    }, {
        key: 'getTileLayoutParams',
        value: function getTileLayoutParams() /*tile*/{}
    }, {
        key: 'onTileMoved',
        value: function onTileMoved() /*tile, targetTile*/{}
    }, {
        key: 'container',
        get: function get$$1() {
            return this._containerElement;
        }
    }, {
        key: 'tiles',
        get: function get$$1() {
            return this._tiles;
        }
    }]);
    return BaseAdapter;
}();

mix(BaseAdapter, Listenable);

var FlowAdapter = function (_BaseAdapter) {
    inherits(FlowAdapter, _BaseAdapter);

    function FlowAdapter(containerElement, moveMode) {
        classCallCheck(this, FlowAdapter);

        var _this = possibleConstructorReturn(this, Object.getPrototypeOf(FlowAdapter).call(this, containerElement));

        _this._moveMode = moveMode;
        return _this;
    }

    createClass(FlowAdapter, [{
        key: 'getTileLayoutParams',
        value: function getTileLayoutParams(tile) {
            return {
                position: this._tiles.indexOf(tile)
            };
        }
    }, {
        key: 'onTileMoved',
        value: function onTileMoved(tile, targetTile) {
            var index = this._tiles.indexOf(tile);
            var targetIndex = this._tiles.indexOf(targetTile);

            if (this._moveMode === 'switch') {
                this._tiles[index] = targetTile;
                this._tiles[targetIndex] = tile;

                this.dispatchEvent('tilechanged', tile);
                this.dispatchEvent('tilechanged', targetTile);
            } else {
                this._tiles.splice(index, 1);
                this._tiles.splice(targetIndex, 0, tile);

                var from = Math.min(index, targetIndex);
                var to = Math.max(index, targetIndex);
                for (var i = from; i <= to; i++) {
                    this.dispatchEvent('tilechanged', this._tiles[i]);
                }
            }
        }
    }]);
    return FlowAdapter;
}(BaseAdapter);

var SilkyTiles = function () {
    function SilkyTiles() {
        classCallCheck(this, SilkyTiles);

        this._adapter = null;
        this._layout = null;
        this._layoutWidth = 0;
        this._layoutHeight = 0;
        this._dragHandler = new DragHandler(this);
        this._draggingTile = null;

        this._onTileAdded = this._onTileAdded.bind(this);
        this._onTileChanged = this._onTileChanged.bind(this);
        this._onTileRemoved = this._onTileRemoved.bind(this);
        this._onTileDragStart = this._onTileDragStart.bind(this);
        this._onTileDragEnd = this._onTileDragEnd.bind(this);
        this._update = this._update.bind(this);

        this._dragHandler.addEventListener('dragstart', this._onTileDragStart);
        this._dragHandler.addEventListener('dragend', this._onTileDragEnd);

        requestAnimationFrame(this._update);
    }

    createClass(SilkyTiles, [{
        key: '_onTileAdded',
        value: function _onTileAdded(tile) {
            if (this._layout) {
                this._layout.onTileAdded(tile);
            }
        }
    }, {
        key: '_onTileChanged',
        value: function _onTileChanged(tile) {
            if (this._layout) {
                this._layout.onTileChanged(tile);
            }
        }
    }, {
        key: '_onTileRemoved',
        value: function _onTileRemoved(tile) {
            if (this._layout) {
                this._layout.onTileRemoved(tile);
            }
        }
    }, {
        key: '_onTileDragStart',
        value: function _onTileDragStart(tile) {
            this._draggingTile = tile;
        }
    }, {
        key: '_onTileDragEnd',
        value: function _onTileDragEnd(tile) {
            this._draggingTile = null;
            this._onTileChanged(tile);
        }
    }, {
        key: '_update',
        value: function _update() {
            var _this = this;

            if (!this._adapter || !this._layout) return;

            // Get layout from drag handler first, because it might add
            // additional tiles to the queue.
            var draggingTilePosition = void 0;
            if (this._draggingTile) {
                this._layout.onTileChanged(this._draggingTile);
                draggingTilePosition = this._dragHandler.layout();
            }

            // If the container width changed, we need to layout all tiles.
            if (this._layoutWidth !== this._adapter.container.clientWidth) {
                this._layoutWidth = this._adapter.container.clientWidth;
                this._layout.onWidthChanged(this._layoutWidth);
            }

            // Get layout queue.
            var changedTiles = this._layout.layout(function (tile) {
                return _this._adapter.getTileLayoutParams(tile);
            });

            // Layout all tiles in queue.
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = changedTiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var tile = _step.value;

                    var position = this._layout.getTilePosition(tile);
                    if (tile === this._draggingTile) {
                        Object.assign(position, draggingTilePosition);
                    }

                    tile.style.width = position.width + 'px';
                    tile.style.height = position.height + 'px';
                    tile.style.transform = 'translateX(' + position.x + 'px) translateY(' + position.y + 'px)';
                }

                // Update container height.
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (this._layoutHeight !== this._layout.height) {
                this._layoutHeight = this._layout.height;
                this._adapter.container.style.height = this._layoutHeight + 'px';
            }

            requestAnimationFrame(this._update);
        }
    }, {
        key: 'getTilePosition',
        value: function getTilePosition(tile) {
            return this._layout && this._layout.getTilePosition(tile);
        }
    }, {
        key: 'adapter',
        get: function get$$1() {
            return this._adapter;
        },
        set: function set$$1(adapter) {
            if (this._adapter) {
                this._adapter.removeEventListener('tileadded', this._onTileAdded);
                this._adapter.removeEventListener('tilechanged', this._onTileChanged);
                this._adapter.removeEventListener('tileremoved', this._onTileRemoved);
                this._adapter.tiles.forEach(this._onTileRemoved);
            }

            this._adapter = adapter;
            this._adapter.tiles.forEach(this._onTileAdded);
            this._adapter.addEventListener('tileadded', this._onTileAdded);
            this._adapter.addEventListener('tilechanged', this._onTileChanged);
            this._adapter.addEventListener('tileremoved', this._onTileRemoved);

            this._dragHandler.adapter = this._adapter;
        }
    }, {
        key: 'layout',
        get: function get$$1() {
            return this._layout;
        },
        set: function set$$1(layout) {
            if (this._layout && this._adapter) {
                this._adapter.tiles.forEach(this._onTileRemoved);
            }

            this._layout = layout;
            if (this._adapter) {
                this._adapter.tiles.forEach(this._onTileAdded);
            }
        }
    }]);
    return SilkyTiles;
}();

var layouts = {
    ColumnLayout: ColumnLayout,
    FlowLayout: FlowLayout
};

var adapters = {
    BaseAdapter: BaseAdapter,
    FlowAdapter: FlowAdapter
};

exports.SilkyTiles = SilkyTiles;
exports.layouts = layouts;
exports.adapters = adapters;

}((this.SilkyTiles = this.SilkyTiles || {})));
//# sourceMappingURL=silky-tiles.js.map
