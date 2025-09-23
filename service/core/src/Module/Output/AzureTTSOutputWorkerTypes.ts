import { Words } from '../../types';

export type WorkerToMainMessage =
	| {
			type: 'ready';
	  }
	| {
			type: 'SentenceLength';
			words: Words;
	  };

export type MainToWorkerMessage =
	| { type: 'Hello' }
	| {
			type: 'InitializePlayer';
			deviceIndex: number;
	  }
	| {
			type: 'InitializeSynthesizer';
			azureKey: string;
			azureRegion: string;
	  }
	| {
			type: 'SpeakSsmlToPlayer';
			ssml: string;
			words: Words;
	  };
