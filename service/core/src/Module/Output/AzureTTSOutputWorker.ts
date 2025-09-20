import { PvSpeaker } from '@picovoice/pvspeaker-node';
import type {
	WorkerToMainMessage,
	MainToWorkerMessage
} from './AzureTTSOutputWorkerTypes';
import * as Speech from 'microsoft-cognitiveservices-speech-sdk';

console.log('AzureTTSOutputWorker: I exist...');

let player: PvSpeaker | undefined = undefined;
let synthesizer: Speech.SpeechSynthesizer | undefined = undefined;

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
			if (!player || !synthesizer) {
				console.error(
					'AzureTTSOutputWorker: Worker received SpeakSsmlToPlayer before InitializePlayer and InitializeSynthesizer were called.',
					ev.data
				);
				break;
			}

			synthesizer.speakSsmlAsync(
				ev.data.ssml,
				(result: Speech.SpeechSynthesisResult) => {
					if (result.reason == Speech.ResultReason.SynthesizingAudioCompleted) {
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
