(function () {

    const container = document.querySelector('.tiles-container');

    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function generateTiles(containerEl) {
        const tiles = [
            'home', 'alarm', 'assignment', 'bookmark', 'done',
            'help', 'pan_tool', 'visibility', 'videocam', 'info',
            'motorcycle', 'opacity', 'lock', 'label', 'http',
            'translate', 'verified_user', 'zoom_in', 'work',
            'voicemail', 'phone', 'email', 'dialpad', 'weekend',
            'nfc', 'usb', 'storage', 'attachment', 'cloud_queue'
        ];

        tiles.forEach((tile, index) => {
            let tileEl = containerEl.appendChild(document.createElement('div'));
            tileEl.className = 'tile';
            tileEl.dataset.tilePosition = index + 1;
            tileEl.dataset.tileWidth = randInt(1, 3);
            tileEl.dataset.tileHeight = randInt(1, 3);

            let tileIconEl = tileEl.appendChild(document.createElement('div'));
            tileIconEl.className = 'tile__icon material-icons';
            tileIconEl.textContent = tile;

            let tileTextEl = tileEl.appendChild(document.createElement('div'));
            tileTextEl.className = 'tile__text';
            tileTextEl.textContent = tile;
        });
    }

    generateTiles(container);

    const adapter = new SilkyTiles.adapters.DomAdapter(container);
    const layout = new SilkyTiles.layouts.FlowLayout({
        tileWidth: 96,
        tileHeight: 96,
        margin: 8,
        outerMargin: true,
        moveMode: 'push' // switch || push
    });
    const silkyTiles = new SilkyTiles.SilkyTiles();

    silkyTiles.adapter = adapter;
    silkyTiles.layout = layout;

})();
