import { Readable, Writable } from 'node:stream';

export type Words = string;

export abstract class InputModule {
    constructor() {};
};

export abstract class OutputModule {
    constructor() {};

    abstract Progress(text: Words): void;
    abstract Sentence(text: Words): void;
};

export abstract class AudioPlayer extends Writable {};
export abstract class AudioRecorder {};

export class Kernel {
    Input: InputModule[];

    Output: OutputModule[];
    Progress: OutputModule['Progress'] = (text) => {
        this.Output.forEach((o) => o.Progress(text));
    }
    Sentence: OutputModule['Sentence'] = (text) => {
        this.Output.forEach((o) => o.Sentence(text));
    }

    constructor() {
        this.Input = [];
        this.Output = [];
    }
}

export default new Kernel();