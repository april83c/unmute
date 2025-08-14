import { Static, t } from "elysia";
import { OutputModule, Words } from "../../kernel";

export const LogOutputOptionsSchema = t.Object({});
export type LogOutputOptions = Static<typeof LogOutputOptionsSchema>

export class LogOutput extends OutputModule {
    static id = 'log';

    static OptionsSchema = LogOutputOptionsSchema;
    Options: LogOutputOptions;
    
    constructor() {
        super();
        this.Options = {};
    }

    Progress(text: Words) {
        console.log('LogOutput: Progress:', text);
    }

    Sentence(text: Words) {
        console.log('LogOutput: Sentence:', text);
    }
}