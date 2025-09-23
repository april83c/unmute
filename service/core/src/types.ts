import type { PvSpeaker } from '@picovoice/pvspeaker-node';
import { Static, t } from 'elysia';

export type Words = { text: string; redacted: boolean; lengthMs?: number };

export type BaseOptionsSchema = ReturnType<typeof t.Object>;
export const InputModuleBaseOptionsSchemaTypebox = t.Object({
	target: t.Union([t.Array(t.String({ format: 'uuid' })), t.Literal('all')])
});
export type InputModuleBaseOptionsSchema =
	typeof InputModuleBaseOptionsSchemaTypebox;

export abstract class BaseModule {
	static id: string = 'unknown';
	get id() {
		return (this.constructor as typeof BaseModule).id;
	}
	static OptionsSchema: BaseOptionsSchema;
	get OptionsSchema() {
		return (this.constructor as typeof BaseModule).OptionsSchema;
	}
	abstract Options: Static<BaseOptionsSchema>; // FIXME: this is wrong but whatever
}

export interface InputModule extends BaseModule {
	Options: Static<typeof InputModuleBaseOptionsSchemaTypebox>;
}

export interface OutputModule extends BaseModule {
	Progress(text: Words): void;
	Sentence(text: Words): void;
}

export type AudioPlayer = PvSpeaker;
export abstract class AudioRecorder {}

export type ConfigurationModule = {
	InstanceID: string;
	ModuleID: string;
	Enabled: boolean;
	Options: unknown;
};

export const CONFIGURATION_VERSION = 1;

export type Configuration = {
	Version: number;

	Input: ConfigurationModule[];
	Output: ConfigurationModule[];
};

export type ModuleInstance<T> = {
	InstanceID: string;
	ModuleID: string;
} & (
	| {
			Enabled: true;
			Instance: T;
	  }
	| {
			Enabled: false;
			Options: unknown;
	  }
);

export type EnabledModuleInstance<T> = Extract<
	ModuleInstance<T>,
	{ Enabled: true }
>;
export type InactiveModuleInstance<T> = Extract<
	ModuleInstance<T>,
	{ Enabled: false }
>;
