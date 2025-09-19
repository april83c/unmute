import kernel from './kernel';
import { WebKeysInput } from './Module/Input/WebKeysInput';
import { WebSpeechInput } from './Module/Input/WebSpeechInput';
import { AzureTTSOutput } from './Module/Output/AzureTTSOutput';
import { EdgeTTSOutput } from './Module/Output/EdgeTTSOutput';
import { LogOutput } from './Module/Output/LogOutput';
import Webserver from './Webserver';

// Temporary: make sure these imports aren't getting optimized out
const _ = [kernel, Webserver];

//kernel.Output.push(new LogOutput());
//kernel.Output.push(new EdgeTTSOutput({
//    voice: 'en-US-JennyNeural'
//}));
//kernel.Input.push(new WebKeysInput());
const webKeysInput = new WebKeysInput();
kernel.Input.push({
	ModuleID: webKeysInput.id,
	Instance: webKeysInput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});

const webSpeechInput = new WebSpeechInput();
kernel.Input.push({
	ModuleID: webSpeechInput.id,
	Instance: webSpeechInput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});

/*
const edgeTTSOutput = new EdgeTTSOutput();
kernel.Output.push({
	ModuleID: edgeTTSOutput.id,
	Instance: edgeTTSOutput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});
*/

const azureTTSOutput = new AzureTTSOutput({
	voice: 'en-US-AshleyNeural',
	style: 'default',
	pitch: '+25%',
	azure_region: 'westeurope',
	azure_key: 'd7567184ce70479d8cf73f2fb67606af',
	device_index: 1
});

kernel.Output.push({
	ModuleID: azureTTSOutput.id,
	Instance: azureTTSOutput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});

const logOutput = new LogOutput();
kernel.Output.push({
	ModuleID: logOutput.id,
	Instance: logOutput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});

export type { Words } from './types';
export type { Webserver } from './Webserver';
