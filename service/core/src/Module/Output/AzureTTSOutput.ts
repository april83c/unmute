import {
	BaseModule,
	InputModule,
	InputModuleBaseOptionsSchemaTypebox,
	OutputModule,
	Words
} from '../../types';
import { Static, t } from 'elysia';
import {
	MainToWorkerMessage,
	WorkerToMainMessage
} from './AzureTTSOutputWorkerTypes';
import kernel from '../../kernel';

export const AzureTTSOutputOptionsSchema = t.Composite([
	t.Object({
		style: t.String(),
		voice: t.String(),
		pitch: t.Optional(t.String()),
		azure_key: t.String(),
		azure_region: t.String(),
		device_index: t.Number(),
		replacements: t.Array(
			t.Object({
				original: t.String(),
				replacement: t.String()
			})
		)
	}),
	InputModuleBaseOptionsSchemaTypebox
]);
export type AzureTTSOutputOptions = Static<typeof AzureTTSOutputOptionsSchema>;

export class AzureTTSOutput
	extends BaseModule
	implements OutputModule, InputModule
{
	static id = 'azure_tts';

	static OptionsSchema = AzureTTSOutputOptionsSchema;
	Options: AzureTTSOutputOptions;
	private _Options: AzureTTSOutputOptions;

	private Worker: Worker;

	constructor(
		options: AzureTTSOutputOptions = {
			style: 'default',
			voice: 'en-US-JennyNeural',
			azure_key: '',
			azure_region: '',
			device_index: 0,
			replacements: [],
			target: 'all'
		}
	) {
		super();

		this._Options = options;

		this.Options = new Proxy(this._Options, {
			set: (obj, prop, value) => {
				// @ts-expect-error: idc
				obj[prop] = value;

				this.Worker.postMessage({
					type: 'InitializeSynthesizer',
					azureKey: this.Options.azure_key,
					azureRegion: this.Options.azure_region
				});

				this.Worker.postMessage({
					type: 'InitializePlayer',
					deviceIndex: this.Options.device_index
				});

				return true;
			}
		});

		this.Worker = new Worker('src/Module/Output/AzureTTSOutputWorker.ts');
		this.Worker.addEventListener('close', (event) => {
			console.log('worker is being closed');
		});

		this.Worker.onmessage = (ev: MessageEvent<WorkerToMainMessage>) => {
			switch (ev.data.type) {
				case 'ready': {
					console.log('AzureTTSOutput: got Ready from worker');
					this.Worker.postMessage({
						type: 'InitializeSynthesizer',
						azureKey: this.Options.azure_key,
						azureRegion: this.Options.azure_region
					});

					this.Worker.postMessage({
						type: 'InitializePlayer',
						deviceIndex: this.Options.device_index
					});
					break;
				}
				case 'SentenceLength': {
					kernel.Sentence(ev.data.words, this.Options.target);
					break;
				}
				default: {
					console.log(
						'AzureTTSOutput: Unknown message received from worker:',
						ev.data
					);
				}
			}
		};

		this.Worker.postMessage({ type: 'Hello' });
	}

	Progress(text: Words) {
		// Pass through Progress
		kernel.Progress(text, this.Options.target);
	}

	private ApplyReplacements(text: string) {
		let newText = text;
		this.Options.replacements.forEach((replacement) => {
			// Escape special characters in the original word
			const esc = replacement.original.replace(
				/[-\/\\^$*+?.()|[\]{}]/g,
				'\\$&'
			);
			// Modify the regex to include optional punctuation after the word
			const regex = new RegExp(`\b${esc}(?=[.,!?\\s]|$)`, 'ig');

			newText = newText.replaceAll(regex, replacement.replacement);
		});
		return newText;
	}

	async Sentence(words: Words) {
		const ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="${this.Options.voice}">${this.Options.style != 'default' ? `<mstts:express-as style="${this.Options.style}">` : ''}${this.Options.pitch ? `<prosody pitch="${this.Options.pitch}">` : ''}${words.redacted ? 'Redacted.' : this.ApplyReplacements(words.text.replaceAll('.', ','))}${this.Options.pitch ? `</prosody>` : ''}${this.Options.style != 'default' ? `</mstts:express-as>` : ''}</voice></speak>`;
		//console.log(ssml);

		this.Worker.postMessage({
			type: 'SpeakSsmlToPlayer',
			ssml,
			words
		} as MainToWorkerMessage);
	}
}
