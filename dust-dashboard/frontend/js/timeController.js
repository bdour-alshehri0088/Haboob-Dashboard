/**
 * Manages the timeline playback and filtering of data.
 */
export class TimeController {
    constructor(data, updateCallback) {
        this.allData = data;
        this.updateCallback = updateCallback;

        this.sortedTimes = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.playInterval = null;

        this.init();
    }

    init() {
        // Extract unique times from data (including minutes for SPECI, etc.)
        // Group by station and time to avoid duplicates
        const timeMap = new Map();

        this.allData.forEach(d => {
            const key = `${d.station}_${d.valid}`;
            if (!timeMap.has(key)) {
                timeMap.set(key, d.valid);
            }
        });

        // Get unique times and sort
        const uniqueTimes = Array.from(new Set(timeMap.values()));
        this.sortedTimes = uniqueTimes.sort();
        this.currentIndex = 0; // Start at oldest instead of latest

        this.renderControls();
        this.updateDisplay();
    }

    renderControls() {
        const container = document.getElementById('wmo-controls');
        if (!container) return;

        container.innerHTML = '';

        const playerDiv = document.createElement('div');
        playerDiv.className = 'time-player';
        playerDiv.innerHTML = `
            <div class="player-header">
                <div class="date-display" id="player-date"></div>
                <div class="time-display" id="player-time"></div>
            </div>
            <div class="player-body">
                <div class="player-controls">
                    <button id="prev-hour" class="player-btn" title="Previous">◀</button>
                    <button id="play-pause" class="player-btn play-btn" title="Play/Pause">▶</button>
                    <button id="next-hour" class="player-btn" title="Next">▶</button>
                </div>
                <input type="range" class="custom-slider" id="time-slider" min="0" max="${this.sortedTimes.length - 1}" value="${this.currentIndex}">
            </div>
        `;

        container.appendChild(playerDiv);

        // Bind events
        document.getElementById('prev-hour').onclick = () => this.step(-1);
        document.getElementById('next-hour').onclick = () => this.step(1);
        document.getElementById('play-pause').onclick = () => this.togglePlay();

        const slider = document.getElementById('time-slider');
        slider.oninput = (e) => {
            this.stopPlay(); // Stop playing if user drags slider
            this.jumpTo(parseInt(e.target.value));
        };
    }

    step(dir) {
        let newIndex = this.currentIndex + dir;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= this.sortedTimes.length) {
            newIndex = this.sortedTimes.length - 1;
            this.stopPlay();
        }

        this.currentIndex = newIndex;
        const slider = document.getElementById('time-slider');
        if (slider) slider.value = newIndex;

        this.updateDisplay();
    }

    jumpTo(index) {
        this.currentIndex = index;
        this.updateDisplay();
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('play-pause');
        if (this.isPlaying) {
            btn.innerHTML = '⏸'; // Pause symbol
            this.playInterval = setInterval(() => this.step(1), 1500); // 1.5s per step (faster)
        } else {
            btn.innerHTML = '▶'; // Play symbol
            clearInterval(this.playInterval);
        }
    }

    stopPlay() {
        this.isPlaying = false;
        const btn = document.getElementById('play-pause');
        if (btn) btn.innerHTML = '▶';
        clearInterval(this.playInterval);
    }

    updateDisplay() {
        if (this.sortedTimes.length === 0) return;

        const timeIso = this.sortedTimes[this.currentIndex];
        const date = new Date(timeIso);

        // Update Date Display (e.g., "Wed, 17 Dec")
        const dateEl = document.getElementById('player-date');
        if (dateEl) {
            dateEl.textContent = date.toLocaleString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }

        // Update Time Display (e.g., "10:00 UTC")
        const timeEl = document.getElementById('player-time');
        if (timeEl) {
            timeEl.textContent = date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }) + ' UTC';
        }

        // Filter Data
        const currentTimeData = this.allData.filter(d => d.valid === timeIso);
        this.updateCallback(currentTimeData);
    }
}
