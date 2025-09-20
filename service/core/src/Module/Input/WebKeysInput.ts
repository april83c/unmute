import { Static, t } from 'elysia';
import {
	BaseModule,
	InputModule,
	InputModuleBaseOptionsSchemaTypebox
} from '../../types';

// Logic for this Input Module is in the Webserver
// The Input Module class for this is just used for configuration
export const WebKeysInputOptionsSchema = t.Composite([
	t.Object({}),
	InputModuleBaseOptionsSchemaTypebox
]);
export type WebKeysInputOptions = Static<typeof WebKeysInputOptionsSchema>;

export class WebKeysInput extends BaseModule implements InputModule {
	static id = 'web_keys';
	static OptionsSchema = WebKeysInputOptionsSchema;
	Options: WebKeysInputOptions;

	constructor(options?: WebKeysInputOptions) {
		super();
		this.Options = options ?? { target: 'all' };
	}
}
