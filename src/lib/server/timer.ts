export class Timer {
	private totalDuration: number;
	private remainingTime: number;
	private lastUpdated: number | null;
	private isRunning: boolean;
	private onExpired: () => void;
	private timeoutId: NodeJS.Timeout | null;

	constructor(durationMs: number, onExpired: () => void) {
		this.totalDuration = durationMs; // The initial limit (e.g., 60000)
		this.remainingTime = durationMs; // Time left in the "bank"
		this.lastUpdated = null; // Server timestamp of last start/pause
		this.isRunning = false;
		this.onExpired = onExpired; // Callback for when time hits zero
		this.timeoutId = null; // The "Safety Net" timer
	}

	// 1. Start or Resume the timer
	start() {
		if (this.isRunning) return;

		this.isRunning = true;
		this.lastUpdated = Date.now();

		// Set the safety net to trigger the 'Expired' event
		this.timeoutId = setTimeout(() => {
			this.handleExpiry();
		}, this.remainingTime);
	}

	// 2. Pause the timer
	pause() {
		if (!this.isRunning || !this.lastUpdated) {
			return;
		}

		// Calculate exactly how much time was used since the last 'start'
		const elapsed = Date.now() - this.lastUpdated;
		this.remainingTime = Math.max(0, this.remainingTime - elapsed);

		this.isRunning = false;
		this.lastUpdated = Date.now();

		// Cancel the safety net
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	// 3. Reset the timer
	reset(newDurationMs = this.totalDuration) {
		this.pause();
		this.totalDuration = newDurationMs;
		this.remainingTime = newDurationMs;
	}

	// Internal handler for when the setTimeout finishes
	handleExpiry() {
		this.isRunning = false;
		this.remainingTime = 0;
		this.lastUpdated = Date.now();
		if (this.onExpired) this.onExpired();
	}

	// 4. Get the state to broadcast via SSE
	get state() {
		return {
			remainingTime: this.remainingTime,
			isRunning: this.isRunning,
			serverTimestamp: Date.now() // Crucial for client-side sync
		};
	}
}
