import { tts } from "edge-tts";
import { AudioPlayer, OutputModule, Words } from "../../kernel";
import Speaker from "speaker";

export default class EdgeTTSOutput extends OutputModule {
    private Player: AudioPlayer;

    constructor() {
        super();

        this.Player = new Speaker({
            sampleRate: 48000,
            bitDepth: 16,
            channels: 2
        });
    }

    Progress(text: Words) {}

    async Sentence(text: Words) {
        let time = performance.now();
        function timer(...s: string[]) {
            console.log(`[${((performance.now() - time) / 1000).toFixed(4)}s]`, ...s);
        }

        timer('Requesting TTS...');
        const mp3 = await tts(text);
        console.log(mp3.byteLength);
        timer('Got TTS data');

        this.Player.once('drain', () => timer('Drained'));

        // This took 4 seconds (fluent-ffmpeg)
        /*Ffmpeg(Readable.from(mp3))
            .inputFormat('mp3')
            .audioChannels(2)
            .audioFrequency(48000)
            .outputFormat('s16le')
            .output(this.Player, { end: false })
            .on('start', (s) => timer(s))
            .on('progress', (p) => timer(JSON.stringify(p, undefined, 4)))
            .run();*/
        
        // This took 0.05 seconds
        const ffmpeg = Bun.spawn([
            'ffmpeg', 
            '-f', 'mp3', 
            '-i', 'pipe:0', 
            '-ac', '2', 
            '-ar', '48000', 
            '-f', 's16le', 
            'pipe:1'
        ], {
            stdin: 'pipe',
            stdout: 'pipe',
            stderr: 'pipe'
        });

        ffmpeg.stdin.write(mp3);
        ffmpeg.stdin.end();
        for await (const chunk of ffmpeg.stdout) {
            this.Player.write(chunk);
        }
    }
}