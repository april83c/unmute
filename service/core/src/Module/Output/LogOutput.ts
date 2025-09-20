import { Static, t } from 'elysia';
import { BaseModule, OutputModule, Words } from '../../types';

export const LogOutputOptionsSchema = t.Object({});
export type LogOutputOptions = Static<typeof LogOutputOptionsSchema>;

export class LogOutput extends BaseModule implements OutputModule {
	static id = 'log';

	static OptionsSchema = LogOutputOptionsSchema;
	Options: LogOutputOptions;

	constructor() {
		super();
		this.Options = {};
	}

	Progress(text: Words) {
		console.log(
			'LogOutput: Progress:',
			text.redacted ? '[redacted]' : text.text
		);
	}

	Sentence(text: Words) {
		console.log(
			'LogOutput: Sentence:',
			text.redacted ? '[redacted]' : text.text
		);
	}
}
