import { treaty } from "@elysiajs/eden";
import type { Webserver } from "@unmute/core";

// TODO: figure out how finding core's URL will work
export default treaty<Webserver>('http://localhost:40000', {
	// headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
	onResponse: async (res) => {
		if (!res.ok) {
			throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
		}
	}
});