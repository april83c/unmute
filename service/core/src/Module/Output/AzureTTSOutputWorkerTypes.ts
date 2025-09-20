export type WorkerToMainMessage = {
	type: 'ready';
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
	  };
