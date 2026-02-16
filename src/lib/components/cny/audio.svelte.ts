export class AudioController {
	private bgm: HTMLAudioElement | null = null;
	private sfx = new Map<string, HTMLAudioElement>();

	private _volume = $state(0.5);
	private _enabled = $state(false);

	private readonly BGM_MULTIPLIER = 0.4;
	private readonly SFX_MULTIPLIER = 0.9;

	constructor() {
		if (typeof window !== 'undefined') {
			this.bgm = new Audio('/audio/bgm.mp3');
			this.bgm.loop = true;

			this.sfx.set('correct', new Audio('/audio/sfx-correct.wav'));
			this.sfx.set('victory', new Audio('/audio/sfx-victory.wav'));
			this.sfx.set('times-up', new Audio('/audio/sfx-times-up.wav'));
		}
	}

	set volume(v: number) {
		this._volume = v;
		if (this.bgm) this.bgm.volume = v * this.BGM_MULTIPLIER;
	}

	set enabled(e: boolean) {
		this._enabled = e;
		if (!e) this.stopAll();
	}

	unlock() {
		const silentPlay = (a: HTMLAudioElement) => {
			a.play()
				.then(() => {
					a.pause();
					a.currentTime = 0;
				})
				.catch((e) => console.error('Audio unlock failed:', e));
		};

		if (this.bgm) silentPlay(this.bgm);
		this.sfx.forEach(silentPlay);
	}

	playMusic(rate = 1.0) {
		if (!this._enabled || !this.bgm) return;
		this.bgm.playbackRate = rate;
		this.bgm.volume = this._volume * this.BGM_MULTIPLIER;
		this.bgm.play().catch(() => {});
	}

	pauseMusic(dim = false) {
		if (!this.bgm) return;
		if (dim) {
			this.bgm.volume = this._volume * this.BGM_MULTIPLIER * 0.2;
		} else {
			this.bgm.pause();
		}
	}

	stopAll() {
		if (this.bgm) {
			this.bgm.pause();
			this.bgm.currentTime = 0;
			this.bgm.playbackRate = 1.0;
		}
		this.sfx.forEach((s) => {
			s.pause();
			s.currentTime = 0;
		});
	}

	playSfx(name: 'correct' | 'victory' | 'times-up') {
		if (!this._enabled) return;
		const effect = this.sfx.get(name);
		if (effect) {
			effect.currentTime = 0;
			effect.volume = this._volume * this.SFX_MULTIPLIER;
			effect.play().catch(() => {});
		}
	}

	rampPlaybackRate(target: number, duration = 1000) {
		if (!this.bgm || !this._enabled) return;
		const steps = 20;
		const interval = duration / steps;
		const start = this.bgm.playbackRate;
		const delta = target - start;
		let step = 0;

		const timer = setInterval(() => {
			step++;
			if (this.bgm) this.bgm.playbackRate = start + delta * (step / steps);
			if (step >= steps) clearInterval(timer);
		}, interval);
	}

	destroy() {
		this.stopAll();
	}
}
