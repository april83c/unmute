import kernel from './kernel';
import { ApprovalModule } from './Module/Input/ApprovalModule';
import { WebKeysInput } from './Module/Input/WebKeysInput';
import { WebSpeechInput } from './Module/Input/WebSpeechInput';
import { AzureTTSOutput } from './Module/Output/AzureTTSOutput';
import { EdgeTTSOutput } from './Module/Output/EdgeTTSOutput';
import { LegacyAzureTTSOutput } from './Module/Output/LegacyAzureTTSOutput';
import { LogOutput } from './Module/Output/LogOutput';
import { WebSubtitleOutput } from './Module/Output/WebSubtitleOutput';
import { BaseModule, EnabledModuleInstance, OutputModule } from './types';
import Webserver from './Webserver';

// Temporary: make sure these imports aren't getting optimized out
const _ = [kernel, Webserver];

//kernel.Output.push(new LogOutput());
//kernel.Output.push(new EdgeTTSOutput({
//    voice: 'en-US-JennyNeural'
//}));
//kernel.Input.push(new WebKeysInput());

/*
const edgeTTSOutput = new EdgeTTSOutput();
kernel.Output.push({
	ModuleID: edgeTTSOutput.id,
	Instance: edgeTTSOutput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});
*/

const subtitleOutputInstance = new WebSubtitleOutput();
const subtitleOutput: EnabledModuleInstance<OutputModule> = {
	ModuleID: subtitleOutputInstance.id,
	Instance: subtitleOutputInstance,
	InstanceID: crypto.randomUUID(),
	Enabled: true
};
kernel.Output.push(subtitleOutput);

const logOutputInstance = new LogOutput();
const logOutput: EnabledModuleInstance<OutputModule> = {
	ModuleID: logOutputInstance.id,
	Instance: logOutputInstance,
	InstanceID: crypto.randomUUID(),
	Enabled: true
};
kernel.Output.push(logOutput);

const azureTTSOutputInstance = new AzureTTSOutput({
	voice: 'en-US-AshleyNeural',
	style: 'default',
	pitch: '+25%',
	azure_region: 'westeurope',
	azure_key: process.env.AZURE_KEY ?? '',
	device_index: 2,
	replacements: [
		{ original: 'lol', replacement: 'lawl' },
		{ original: 'nya', replacement: 'nyaa' },
		{ original: 'vtuber', replacement: 'v tuber' },
		{ original: 'osu', replacement: 'ohs' },
		{ original: 'tsundere', replacement: 'tsoon de ray' },
		{ original: 'cya', replacement: 'see ya' },
		{ original: 'sec', replacement: 'seck' },
		{ original: 'pxls', replacement: 'pixels' },
		{ original: 'eman', replacement: 'e man' },
		{ original: 'btw', replacement: 'by the way' },
		{ original: 'kekw', replacement: 'kek w' },
		{ original: 'sus', replacement: 'suss' },
		{ original: 'gif', replacement: 'guif' },
		{ original: 'sussy', replacement: 'suhssy' },
		{ original: 'mrekk', replacement: 'm reck' },
		{ original: 'neko', replacement: 'nekko' },
		{ original: 'gecco', replacement: 'gecko' },
		{ original: 'acc', replacement: 'ack' },
		{ original: 'bro', replacement: 'broh' },
		{ original: 'bros', replacement: 'brohs' },
		{
			original: 'Grzegorz Brzęczyszczykiewicz',
			replacement: `<phoneme alphabet="ipa" ph="ˈɡʒɛɡɔʒ">Grzegorz</phoneme> <phoneme alphabet="ipa" ph="ˌbʐɛ̃ŋʧɨʂʧɨˈkʲɛvʲiʧ">Brzęczyszczykiewicz</phoneme>`
		},
		{
			original: 'grzegorz brzęczyszczykiewicz',
			replacement: `<phoneme alphabet="ipa" ph="ˈɡʒɛɡɔʒ">Grzegorz</phoneme> <phoneme alphabet="ipa" ph="ˌbʐɛ̃ŋʧɨʂʧɨˈkʲɛvʲiʧ">Brzęczyszczykiewicz</phoneme>`
		},
		{ original: 'pokeball', replacement: 'pokey ball' },
		{ original: 'pokeballs', replacement: 'pokey balls' },
		{ original: 'apil', replacement: 'apple' },
		{ original: 'idk', replacement: "i don't know" },
		{ original: 'div', replacement: 'divv' },
		{ original: 'sigi', replacement: 'siggi' },
		{ original: 'fumo', replacement: 'foomo' },
		{ original: 'fumos', replacement: 'foomos' },
		{
			original: 'bydgoszcz',
			replacement: '<phoneme alphabet="ipa" ph="bɨdgɔʂʧ">bydgoszcz</phoneme>'
		},
		{
			original: 'Llanfair',
			replacement:
				'<phoneme alphabet="ipa" ph="ɬan.vair.pʊɬ.ˌɡwɨ̞ŋ.ɡɨ̞ɬ.ɡɔ.ˌɡɛ.rə.ˌχwərn.ˌdrɔ.bʊɬ.ˌɬan.tə.ˌsɪl.jɔˌɡɔ.ɡɔ.ˈɡoːχ">Llanfair</phoneme>'
		},
		{ original: 'abi', replacement: 'abby' },
		{ original: 'grenade', replacement: 'grenayde' },
		{ original: 'fic', replacement: 'fick' },
		{ original: 'ive', replacement: "i've" },
		{ original: 'im', replacement: "i'm" },
		{ original: 'nyan', replacement: 'nian' },
		{ original: 'vnyan', replacement: 'vnian' },
		{ original: 'id', replacement: "i'd" },
		{ original: 'mewo', replacement: 'meewo' },
		{ original: 'bakushin', replacement: 'bakshin' },
		{ original: 'bakushinshin', replacement: 'bakshinshin' },
		{ original: 'ongeki', replacement: 'ongheki' },
		{ original: 'unc', replacement: 'unck' }
	],
	target: [subtitleOutput.InstanceID, logOutput.InstanceID]
});
const azureTTSOutput: EnabledModuleInstance<OutputModule> = {
	ModuleID: azureTTSOutputInstance.id,
	Instance: azureTTSOutputInstance,
	InstanceID: crypto.randomUUID(),
	Enabled: true
};
kernel.Output.push(azureTTSOutput);

const approvalModuleInstance = new ApprovalModule({
	target: [azureTTSOutput.InstanceID],
	rejectKey: 'X',
	approveKey: 'Z'
});
const approvalModule: EnabledModuleInstance<ApprovalModule> = {
	ModuleID: approvalModuleInstance.id,
	Instance: approvalModuleInstance,
	InstanceID: crypto.randomUUID(),
	Enabled: true
};
kernel.Input.push(approvalModule);
kernel.Output.push(approvalModule);

const webKeysInput = new WebKeysInput({
	target: [azureTTSOutput.InstanceID]
});
kernel.Input.push({
	ModuleID: webKeysInput.id,
	Instance: webKeysInput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});

const webSpeechInput = new WebSpeechInput({
	target: [azureTTSOutput.InstanceID] //[approvalModule.InstanceID]
});
kernel.Input.push({
	ModuleID: webSpeechInput.id,
	Instance: webSpeechInput,
	InstanceID: crypto.randomUUID(),
	Enabled: true
});

export type { Words } from './types';
export type { Webserver } from './Webserver';
