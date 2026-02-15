import type { CharadesCommand } from '$lib/types/charades';
import { EventEmitter } from 'node:events';

interface EventMap {
	'charades:command': (cmd: CharadesCommand) => void;
}

class TypedEventBus {
	private emitter: EventEmitter = new EventEmitter();

	on<K extends keyof EventMap>(eventName: K, listener: EventMap[K]): void {
		this.emitter.on(eventName, listener as (...args: unknown[]) => void);
	}

	emit<K extends keyof EventMap>(eventName: K, ...args: Parameters<EventMap[K]>): boolean {
		return this.emitter.emit(eventName, ...args);
	}

	off<K extends keyof EventMap>(eventName: K, listener: EventMap[K]): void {
		this.emitter.off(eventName, listener as (...args: unknown[]) => void);
	}
}

export const GAME_MASTER = new TypedEventBus();
