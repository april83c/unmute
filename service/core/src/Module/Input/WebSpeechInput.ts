import { Static, t } from 'elysia';
import {
	BaseModule,
	InputModule,
	InputModuleBaseOptionsSchemaTypebox
} from '../../types';

// Logic for this Input Module is in the Webserver
// The Input Module class for this is just used for configuration
export const WebSpeechInputOptionsSchema = t.Composite([
	t.Object({}),
	InputModuleBaseOptionsSchemaTypebox
]);
export type WebSpeechInputOptions = Static<typeof WebSpeechInputOptionsSchema>;

export class WebSpeechInput extends BaseModule implements InputModule {
	static id = 'web_speech';
	static OptionsSchema = WebSpeechInputOptionsSchema;
	Options: WebSpeechInputOptions;

	constructor(options?: WebSpeechInputOptions) {
		super();
		this.Options = options ?? { target: 'all' };
	}
}
