(function () {

    const container = document.querySelector('.tiles-container');

    function generateTiles(containerEl) {
        const tiles = [
            'home', 'alarm', 'assignment', 'bookmark', 'done',
            'help', 'pan_tool', 'visibility', 'videocam', 'info',
            'motorcycle', 'opacity', 'lock', 'label', 'http',
            'translate', 'verified_user', 'zoom_in', 'work',
            'voicemail', 'phone', 'email', 'dialpad', 'weekend',
            'nfc', 'usb', 'storage', 'attachment', 'cloud_queue'
        ];

        tiles.forEach(function (tile) {
            let tileEl = containerEl.appendChild(document.createElement('div'));
            tileEl.className = 'tile at-tile';

            let tileIconEl = tileEl.appendChild(document.createElement('div'));
            tileIconEl.className = 'tile__icon material-icons';
            tileIconEl.textContent = tile;

            let tileTextEl = tileEl.appendChild(document.createElement('div'));
            tileTextEl.className = 'tile__text';
            tileTextEl.textContent = tile;
        });
    }

    generateTiles(container);

    const adapter = new SilkyTiles.adapters.SimpleFlowAdapter(container);
    const layout = new SilkyTiles.layouts.FlowLayout();
    const silkyTiles = new SilkyTiles.SilkyTiles();

    silkyTiles.adapter = adapter;
    silkyTiles.layout = layout;

})();
