import { Static, t } from 'elysia';
import { BaseModule, OutputModule, Words } from '../../types';

export const WebSubtitleOptionsSchema = t.Object({});
export type WebSubtitleOptions = Static<typeof WebSubtitleOptionsSchema>;

type Subscriber = (data: {
	words: Words;
	type: 'progress' | 'sentence';
}) => void;

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

	Progress(words: Words) {
		this.Subscribed.forEach((s) => s({ words, type: 'progress' }));
	}

	Sentence(words: Words) {
		this.Subscribed.forEach((s) => s({ words, type: 'sentence' }));
	}
}
