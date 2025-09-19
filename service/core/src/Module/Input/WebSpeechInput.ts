import { Static, t } from 'elysia';
import { InputModule } from '../../types';

// Logic for this Input Module is in the Webserver
// The Input Module class for this is just used for configuration
export const WebSpeechInputOptionsSchema = t.Object({});
export type WebSpeechInputOptions = Static<typeof WebSpeechInputOptionsSchema>;

export class WebSpeechInput extends InputModule {
	static id = 'web_speech';
	static OptionsSchema = WebSpeechInputOptionsSchema;
	Options: WebSpeechInputOptions;

	constructor() {
		super();
		this.Options = {};
	}
}
