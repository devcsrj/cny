import type { CharadesAction } from '$lib/types/charades';

export class CharadesDispatcher {
	async send(action: CharadesAction) {
		try {
			const response = await fetch('/___/charades', {
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
