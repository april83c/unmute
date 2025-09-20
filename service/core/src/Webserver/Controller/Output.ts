import Elysia, { InternalServerError, t, type Static } from 'elysia';
import kernel from '../../kernel';
import { WebKeysInput } from '../../Module/Input/WebKeysInput';
import { FeatureDisabledError, KnownInternalServerError } from '../Error';
import { WebSpeechInput } from '../../Module/Input/WebSpeechInput';
import { BaseModule, InputModule } from '../../types';
import { WebSubtitleOutput } from '../../Module/Output/WebSubtitleOutput';

export const WS_HEARTBEAT = -1;

export function GetRealIpFromWs(ws: {
	data: { headers: Record<string, string | undefined> };
	remoteAddress: string;
}) {
	const header = ws.data.headers['x-forwarded-for'];
	// FIXME: if ws.remoteAddress isn't local/trusted, we shouldn't trust the header!
	if (header == undefined) return ws.remoteAddress;
	else return header.split(',')[0]; // FIXME: technically the spec says we should use the leftmost ip address *that is not a local/private ip address*, but since we are currently only dealing with cloudflare, i'm leaving it like this. may need to be changed
}

export default new Elysia().ws('/output/:module/:id/socket', {
	body: t.Union([t.Literal(WS_HEARTBEAT)]),

	open(ws) {
		const moduleInstance = kernel.Output.find(
			(m) =>
				m.Enabled
				&& m.ModuleID
					== (ws.data.params.module == 'subtitle' ? 'web_subtitle' : '?')
				&& m.InstanceID == ws.data.params.id
		);

		if (moduleInstance == undefined || !moduleInstance.Enabled) {
			ws.close();
			throw new FeatureDisabledError();
		}

		(moduleInstance.Instance as WebSubtitleOutput).Subscribe((words) => {
			ws.send(words);
		});

		console.log('OutputController: New connection:', GetRealIpFromWs(ws));
	},
	message(ws, message) {
		const moduleInstance = kernel.Output.find(
			(m) =>
				m.Enabled
				&& m.ModuleID
					== (ws.data.params.module == 'subtitle' ? 'web_subtitle' : '?')
				&& m.InstanceID == ws.data.params.id
		);

		// lol i have to make sure its enabled here cause it doesnt pick up on me checking it earlier
		if (moduleInstance == undefined || !moduleInstance.Enabled) {
			ws.close();
			throw new FeatureDisabledError();
		}

		if (message === WS_HEARTBEAT) ws.send(WS_HEARTBEAT);
		else throw new InternalServerError();
	},
	params: t.Object({
		id: t.String({ format: 'uuid' }),
		module: t.UnionEnum(['subtitle'])
	})
});
