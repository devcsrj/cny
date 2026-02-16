export class ReactiveClock {
	private _now = $state(Date.now());
	private _targetTimestamp = $state<number | null>(null);
	private _pausedTimeLeftMs = $state(60000);
	private _isRunning = $state(false);
	private _tickerId: ReturnType<typeof setInterval> | null = null;

	timeLeft = $derived.by(() => {
		if (!this._isRunning || !this._targetTimestamp) {
			return this._pausedTimeLeftMs / 1000;
		}
		return Math.max(0, (this._targetTimestamp - this._now) / 1000);
	});

	sync(remainingMs: number, serverTimestamp: number, isRunning: boolean) {
		const latency = Date.now() - serverTimestamp;
		this._isRunning = isRunning;

		if (isRunning) {
			this._targetTimestamp = Date.now() + remainingMs - latency;
			this.startTicker();
		} else {
			this._targetTimestamp = null;
			this._pausedTimeLeftMs = remainingMs;
			this.stopTicker();
		}
	}

	reset(durationMs: number) {
		this.stopTicker();
		this._isRunning = false;
		this._targetTimestamp = null;
		this._pausedTimeLeftMs = durationMs;
	}

	private startTicker() {
		if (typeof window === 'undefined' || this._tickerId) return;
		this._tickerId = setInterval(() => {
			this._now = Date.now();
			if (this.timeLeft <= 0) {
				this.stopTicker();
			}
		}, 100);
	}

	private stopTicker() {
		if (this._tickerId) {
			clearInterval(this._tickerId);
			this._tickerId = null;
		}
	}

	destroy() {
		this.stopTicker();
	}
}
