import type { HenyoAction } from '$lib/types/henyo';

export class HenyoDispatcher {
	async send(action: HenyoAction) {
		try {
			const response = await fetch('/___/henyo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(action)
			});

			if (!response.ok) {
				throw new Error(`Server responded with ${response.status}`);
			}
		} catch (e) {
			console.error('Failed to dispatch action', action, e);
			throw e;
		}
	}
}
