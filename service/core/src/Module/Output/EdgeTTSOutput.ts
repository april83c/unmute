import { tts, options as EdgeTTSOptions } from "edge-tts";
import { AudioPlayer, OutputModule, Words } from "../../kernel";
import Speaker from "speaker";
import { Static, t } from 'elysia';

export const EdgeTTSOutputOptionsSchema = t.Object({
    voice: t.Optional(t.String()),
    volume: t.Optional(t.String()),
    rate: t.Optional(t.String()),
    pitch: t.Optional(t.String())
});
export type EdgeTTSOutputOptions = Static<typeof EdgeTTSOutputOptionsSchema>

export class EdgeTTSOutput extends OutputModule {
    static id = 'edge_tts';

    static OptionsSchema = EdgeTTSOutputOptionsSchema;
    Options: EdgeTTSOutputOptions; 
    private Player: AudioPlayer;

    constructor(options: EdgeTTSOutputOptions) {
        super();

        this.Options = options;
        this.Player = new Speaker({
            sampleRate: 48000,
            bitDepth: 16,
            channels: 2
        });
    }

    Progress(text: Words) {}

    async Sentence(text: Words) {
        const mp3 = await tts(text, this.Options);
        
        // This took 4 seconds (fluent-ffmpeg)
        /*Ffmpeg(Readable.from(mp3))
            .inputFormat('mp3')
            .audioChannels(2)
            .audioFrequency(48000)
            .outputFormat('s16le')
            .output(this.Player, { end: false })
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