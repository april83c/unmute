import { Static, t } from 'elysia';
import { Readable, Writable } from 'node:stream';

export type Words = string;

export type BaseOptionsSchema = ReturnType<typeof t.Object>;
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

export abstract class InputModule extends BaseModule {}

export abstract class OutputModule extends BaseModule {
	abstract Progress(text: Words): void;
	abstract Sentence(text: Words): void;
}

export abstract class AudioPlayer extends Writable {}
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
	{ Enabled: true }
>;
