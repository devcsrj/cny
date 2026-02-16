export class AudioController {
	private music: HTMLAudioElement | null = null;
	private sfx = new Map<string, HTMLAudioElement>();

	private _volume = $state(0.5);
	private _enabled = $state(false);

	private readonly BGM_MULTIPLIER = 0.4;
	private readonly SFX_MULTIPLIER = 0.9;

	constructor() {
		if (typeof window !== 'undefined') {
			this.music = new Audio('/audio/music-play.mp3');
			this.music.loop = true;

			this.sfx.set('correct', new Audio('/audio/sfx-correct.wav'));
			this.sfx.set('victory', new Audio('/audio/sfx-victory.wav'));
			this.sfx.set('times-up', new Audio('/audio/sfx-times-up.wav'));
		}
	}

	set volume(v: number) {
		this._volume = v;
		if (this.music) this.music.volume = v * this.BGM_MULTIPLIER;
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

		if (this.music) silentPlay(this.music);
		this.sfx.forEach(silentPlay);
	}

	playMusic(rate = 1.0) {
		if (!this._enabled || !this.music) return;
		this.music.playbackRate = rate;
		this.music.volume = this._volume * this.BGM_MULTIPLIER;
		this.music.play().catch(() => {});
	}

	pauseMusic(dim = false) {
		if (!this.music) return;
		if (dim) {
			this.music.volume = this._volume * this.BGM_MULTIPLIER * 0.2;
		} else {
			this.music.pause();
		}
	}

	stopAll() {
		if (this.music) {
			this.music.pause();
			this.music.currentTime = 0;
			this.music.playbackRate = 1.0;
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
		if (!this.music || !this._enabled) return;
		const steps = 20;
		const interval = duration / steps;
		const start = this.music.playbackRate;
		const delta = target - start;
		let step = 0;

		const timer = setInterval(() => {
			step++;
			if (this.music) this.music.playbackRate = start + delta * (step / steps);
			if (step >= steps) clearInterval(timer);
		}, interval);
	}

	destroy() {
		this.stopAll();
	}
}
