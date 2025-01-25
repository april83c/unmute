import Elysia, { InternalServerError, t, type Static } from "elysia";
import kernel from "../kernel";
import WebKeysInput from "../Module/Input/WebKeysInput";
import { FeatureDisabledError, KnownInternalServerError } from "./Error";

export const WS_HEARTBEAT = -1;

export function GetRealIpFromWs(ws: { data: { headers: Record<string, string | undefined> }, remoteAddress: string }) {
    const header = ws.data.headers['x-forwarded-for'];
	// FIXME: if ws.remoteAddress isn't local/trusted, we shouldn't trust the header!
	if (header == undefined) return ws.remoteAddress;
	else return header.split(',')[0]; // FIXME: technically the spec says we should use the leftmost ip address *that is not a local/private ip address*, but since we are currently only dealing with cloudflare, i'm leaving it like this. may need to be changed
}

export default new Elysia()
    .post('/input/keys', ({ body }) => {
        if (kernel.Input.find(m => m instanceof WebKeysInput) == undefined) throw new FeatureDisabledError();

        if ('progress' in body) {
            kernel.Progress(body.progress);
        } else if ('sentence' in body) {
            kernel.Sentence(body.sentence);
        } else throw new KnownInternalServerError({ details: 'POST /input/keys got a misshapen object' });
    }, {
        body: t.Union([
            t.Object({
                progress: t.String()
            }),
            t.Object({
                sentence: t.String()
            })
        ])
    })
    .ws('/input/keys/socket', {
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
            if (kernel.Input.find(m => m instanceof WebKeysInput) == undefined) {
                ws.close();
                throw new FeatureDisabledError();
            }
            console.log('WebKeysInput: New connection:', GetRealIpFromWs(ws));
        },
        message(ws, message) {
            if (message === WS_HEARTBEAT) ws.send(WS_HEARTBEAT);
            else if ('progress' in message) {
                kernel.Progress(message.progress);
            } else if ('sentence' in message) {
                kernel.Sentence(message.sentence);
            } else throw new InternalServerError();
        }
    });