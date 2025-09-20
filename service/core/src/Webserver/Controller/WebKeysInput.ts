import Elysia, { InternalServerError, t, type Static } from 'elysia';
import kernel from '../../kernel';
import { WebKeysInput } from '../../Module/Input/WebKeysInput';
import { FeatureDisabledError, KnownInternalServerError } from '../Error';
import { WebSpeechInput } from '../../Module/Input/WebSpeechInput';
import { BaseModule, InputModule } from '../../types';

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

export default new Elysia()
	.post(
		'/input/:module/:id',
		({ body, params }) => {
			const moduleInstance = kernel.Input.find(
				(m) =>
					m.Enabled
					&& m.ModuleID == (params.module == 'keys' ? 'web_keys' : 'web_speech')
					&& m.InstanceID == params.id
			);

			if (moduleInstance == undefined || !moduleInstance.Enabled)
				throw new FeatureDisabledError();

			if ('progress' in body) {
				kernel.Progress(
					{ text: body.progress, redacted: true },
					moduleInstance.Instance.Options.target
				);
			} else if ('sentence' in body) {
				kernel.Sentence(
					{ text: body.sentence, redacted: false },
					moduleInstance.Instance.Options.target
				);
			} else
				throw new KnownInternalServerError({
					details: 'POST /input/keys got a misshapen object'
				});
		},
		{
			body: t.Union([
				t.Object({
					progress: t.String()
				}),
				t.Object({
					sentence: t.String()
				})
			]),
			params: t.Object({
				id: t.String({ format: 'uuid' }),
				module: t.UnionEnum(['keys', 'speech'])
			})
		}
	)
	.ws('/input/:module/:id/socket', {
		body: t.Union([
			t.Object({
				progress: t.String()
			}),
			t.Object({
				sentence: t.String()
			}),
			t.Literal(WS_HEARTBEAT)
		]),

		open(ws) {
			const moduleInstance = kernel.Input.find(
				(m) =>
					m.Enabled
					&& m.ModuleID
						== (ws.data.params.module == 'keys' ? 'web_keys' : 'web_speech')
					&& m.InstanceID == ws.data.params.id
			);

			if (moduleInstance == undefined) {
				ws.close();
				throw new FeatureDisabledError();
			}
			console.log('WebKeysInput: New connection:', GetRealIpFromWs(ws));
		},
		message(ws, message) {
			const moduleInstance = kernel.Input.find(
				(m) =>
					m.Enabled
					&& m.ModuleID
						== (ws.data.params.module == 'keys' ? 'web_keys' : 'web_speech')
					&& m.InstanceID == ws.data.params.id
			);

			// lol i have to make sure its enabled here cause it doesnt pick up on me checking it earlier
			if (moduleInstance == undefined || !moduleInstance.Enabled) {
				ws.close();
				throw new FeatureDisabledError();
			}

			if (message === WS_HEARTBEAT) ws.send(WS_HEARTBEAT);
			else if ('progress' in message) {
				kernel.Progress(
					{ text: message.progress, redacted: true },
					moduleInstance.Instance.Options.target
				);
			} else if ('sentence' in message) {
				kernel.Sentence(
					{ text: message.sentence, redacted: false },
					moduleInstance.Instance.Options.target
				);
			} else throw new InternalServerError();
		},
		params: t.Object({
			id: t.String({ format: 'uuid' }),
			module: t.UnionEnum(['keys', 'speech'])
		})
	});
