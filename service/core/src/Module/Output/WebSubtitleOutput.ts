import { Static, t } from 'elysia';
import { BaseModule, OutputModule, Words } from '../../types';

export const WebSubtitleOptionsSchema = t.Object({});
export type WebSubtitleOptions = Static<typeof WebSubtitleOptionsSchema>;

type Subscriber = (words: Words) => void;

export class WebSubtitleOutput extends BaseModule implements OutputModule {
	static id = 'web_subtitle';

	static OptionsSchema = WebSubtitleOptionsSchema;
	Options: WebSubtitleOptions;

	private Subscribed: Subscriber[];
	// TODO: add unsubscribing lol
	Subscribe(callback: Subscriber) {
		this.Subscribed.push(callback);
	}

	constructor() {
		super();
		this.Options = {};
		this.Subscribed = [];
	}

	Progress(text: Words) {
		this.Subscribed.forEach((s) => s(text));
	}

	Sentence(text: Words) {
		this.Subscribed.forEach((s) => s(text));
	}
}
