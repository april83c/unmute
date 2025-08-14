import kernel from "./kernel";
import { WebKeysInput } from "./Module/Input/WebKeysInput";
import { EdgeTTSOutput } from "./Module/Output/EdgeTTSOutput";
import { LogOutput } from "./Module/Output/LogOutput";
import Webserver from "./Webserver";

// Temporary: make sure these imports aren't getting optimized out
const _ = [kernel, Webserver];

kernel.Output.push(new LogOutput());
kernel.Output.push(new EdgeTTSOutput({
    voice: 'en-US-JennyNeural'
}));
kernel.Input.push(new WebKeysInput());

export type { Words } from './kernel';
export type { Webserver } from './Webserver';