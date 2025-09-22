import * as Speech from 'microsoft-cognitiveservices-speech-sdk';
import { AudioPlayer, BaseModule, OutputModule, Words } from '../../types';
import { Static, t } from 'elysia';
import type { PvSpeaker as PvSpeakerType } from '@picovoice/pvspeaker-node/dist/types/index';
import { PvSpeaker } from '@picovoice/pvspeaker-node';

export const LegacyAzureTTSOutputOptionsSchema = t.Object({
	style: t.String(),
	voice: t.String(),
	pitch: t.Optional(t.String()),
	azure_key: t.String(),
	azure_region: t.String(),
	device_index: t.Number()
});
export type LegacyAzureTTSOutputOptions = Static<
	typeof LegacyAzureTTSOutputOptionsSchema
>;

export class LegacyAzureTTSOutput extends BaseModule implements OutputModule {
	static id = 'legacy_azure_tts';

	static OptionsSchema = LegacyAzureTTSOutputOptionsSchema;
	Options: LegacyAzureTTSOutputOptions;
	private _Options: LegacyAzureTTSOutputOptions;
	private Player: AudioPlayer;

	private Synthesizer: Speech.SpeechSynthesizer;

	constructor(
		options: LegacyAzureTTSOutputOptions = {
			style: 'default',
			voice: 'en-US-JennyNeural',
			azure_key: '',
			azure_region: '',
			device_index: 0
		}
	) {
		super();

		this._Options = options;

		this.Options = new Proxy(this._Options, {
			set: (obj, prop, value) => {
				// @ts-expect-error: idgaf
				obj[prop] = value;

				this.Synthesizer = this.MakeSynthesizer();
				this.Player = this.MakePlayer();

				return true;
			}
		});

		this.Synthesizer = this.MakeSynthesizer();
		this.Player = this.MakePlayer();
	}

	MakeSynthesizer() {
		// Set up Azure TTS
		let audioConfig = null;
		let speechConfig = Speech.SpeechConfig.fromSubscription(
			this.Options.azure_key,
			this.Options.azure_region
		);
		speechConfig.speechSynthesisOutputFormat =
			Speech.SpeechSynthesisOutputFormat.Raw48Khz16BitMonoPcm;
		return new Speech.SpeechSynthesizer(speechConfig, audioConfig);
	}

	MakePlayer() {
		console.log(PvSpeaker.getAvailableDevices());

		const player = new PvSpeaker(48000, 16, {
			deviceIndex: this.Options.device_index
		});

		player.start();

		return player;
	}

	Progress(text: Words) {}

	async Sentence(text: Words) {
		const ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="${this.Options.voice}">${this.Options.style != 'default' ? `<mstts:express-as style="${this.Options.style}">` : ''}${this.Options.pitch ? `<prosody pitch="${this.Options.pitch}">` : ''}${text}${this.Options.pitch ? `</prosody>` : ''}${this.Options.style != 'default' ? `</mstts:express-as>` : ''}</voice></speak>`;
		console.log(ssml);

		this.Synthesizer.speakSsmlAsync(
			ssml,
			(result: Speech.SpeechSynthesisResult) => {
				if (result.reason == Speech.ResultReason.SynthesizingAudioCompleted) {
					//this.Player.cork(); // we cork and uncork so that it doesn't do that bug where it cuts off the last part (although the bug could be actually caused by airpods)
					this.Player.flush(result.audioData);
					//this.Player.write(Buffer.alloc(32000)); // putting some silence in just in case
					//this.Player.uncork();
				} else {
					console.error(
						'Something went wrong with speech synthesis: ' + result.errorDetails
					);
				}
			}
		);
	}
}
