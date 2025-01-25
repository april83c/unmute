import { OutputModule, Words } from "../../kernel";

export default class LogOutput extends OutputModule {
    Progress(text: Words) {
        console.log('LogOutput: Progress:', text);
    }

    Sentence(text: Words) {
        console.log('LogOutput: Sentence:', text);
    }
}