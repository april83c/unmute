import { PvSpeaker } from '@picovoice/pvspeaker-node';
import type {
	WorkerToMainMessage,
	MainToWorkerMessage
} from './AzureTTSOutputWorkerTypes';
import * as Speech from 'microsoft-cognitiveservices-speech-sdk';

console.log('AzureTTSOutputWorker: I exist...');

let player: PvSpeaker | undefined = undefined;
let synthesizer: Speech.SpeechSynthesizer | undefined = undefined;

const getPcmDurationMs = (
	bytes: number,
	khz: number,
	bits: number,
	channels: number
) => (bytes / (khz * 1000 * (bits / 8) * channels)) * 1000;

self.addEventListener('message', (ev: MessageEvent<MainToWorkerMessage>) => {
	switch (ev.data.type) {
		case 'Hello': {
			console.log('AzureTTSOutputWorker: hiiii');
			break;
		}
		case 'InitializePlayer': {
			if (player) {
				player.stop();
				player.release();
			}

			player = new PvSpeaker(48000, 16, {
				deviceIndex: ev.data.deviceIndex
			});

			player.start();
			break;
		}
		case 'InitializeSynthesizer': {
			let speechConfig = Speech.SpeechConfig.fromSubscription(
				ev.data.azureKey,
				ev.data.azureRegion
			);
			speechConfig.speechSynthesisOutputFormat =
				Speech.SpeechSynthesisOutputFormat.Raw48Khz16BitMonoPcm;

			synthesizer = new Speech.SpeechSynthesizer(speechConfig, null);
			break;
		}
		case 'SpeakSsmlToPlayer': {
			console.log('AzureTTSOutputWorker: SpeakSsmlToPlayer');
			if (!player || !synthesizer) {
				console.error(
					'AzureTTSOutputWorker: Worker received SpeakSsmlToPlayer before InitializePlayer and InitializeSynthesizer were called.',
					ev.data
				);
				break;
			}

			const ssml = ev.data.ssml;
			const words = ev.data.words;

			synthesizer.speakSsmlAsync(
				ssml,
				(result: Speech.SpeechSynthesisResult) => {
					if (result.reason == Speech.ResultReason.SynthesizingAudioCompleted) {
						self.postMessage({
							type: 'SentenceLength',
							words: {
								...words,
								lengthMs:
									getPcmDurationMs(result.audioData.byteLength, 48, 16, 1)
									+ 2000
							}
						} as WorkerToMainMessage);

						if (!player)
							console.error(
								'AzureTTSOutputWorker: The player disappeared from us after running speech synthesis.'
							);
						else player.flush(result.audioData);
					}
				}
			);

			break;
		}
		default: {
			console.log(
				'AzureTTSOutputWorker: Worker received unknown message:',
				ev.data
			);
		}
	}
});

self.postMessage({ type: 'ready' } as WorkerToMainMessage);
