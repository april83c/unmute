import { getSchemaValidator, Static, t } from 'elysia';
import { Readable, Writable } from 'node:stream';
import InputModules from './Module/Input';
import OutputModules from './Module/Output';
import {
	ModuleInstance,
	InputModule,
	EnabledModuleInstance,
	OutputModule,
	Configuration,
	CONFIGURATION_VERSION,
	Words
} from './types';

export class Kernel {
	Input: ModuleInstance<InputModule>[];
	get EnabledInput(): EnabledModuleInstance<InputModule>[] {
		return this.Input.filter((i) => i.Enabled);
	}

	Output: ModuleInstance<OutputModule>[];
	get EnabledOutput(): EnabledModuleInstance<OutputModule>[] {
		return this.Output.filter((o) => o.Enabled);
	}

	Progress = (text: Words, target: string[] | 'all') => {
		const targetModules =
			target == 'all'
				? this.EnabledOutput
				: this.EnabledOutput.filter((o) =>
						(target as string[]).includes(o.InstanceID)
					);
		targetModules.forEach((o) => o.Instance.Progress(text));
	};
	Sentence = (text: Words, target: string[] | 'all') => {
		const targetModules =
			target == 'all'
				? this.EnabledOutput
				: this.EnabledOutput.filter((o) =>
						(target as string[]).includes(o.InstanceID)
					);
		targetModules.forEach((o) => o.Instance.Sentence(text));
	};

	asConfiguration(): Configuration {
		return {
			Version: CONFIGURATION_VERSION,
			Input: this.Input.map((i) => ({
				InstanceID: i.InstanceID,
				ModuleID: i.ModuleID,
				Enabled: i.Enabled,
				Options: i.Enabled ? i.Instance.Options : i.Options
			})),
			Output: this.Output.map((o) => ({
				InstanceID: o.InstanceID,
				ModuleID: o.ModuleID,
				Enabled: o.Enabled,
				Options: o.Enabled ? o.Instance.Options : o.Options
			}))
		};
	}

	applyConfiguration(configuration: Configuration) {
		if (configuration.Version > CONFIGURATION_VERSION)
			throw new Error(
				'Tried to apply a configuration that is too new for this version of Unmute'
			);
		if (configuration.Version < CONFIGURATION_VERSION)
			console.log(
				'Kernel: Applying a configuration that was saved with an older version of Unmute'
			);

		this.Input = configuration.Input.map((i) => {
			const module = InputModules.find((m) => m.id == i.ModuleID);
			if (!module)
				throw new Error(
					`ConfigurationModule with invalid ModuleID. (ModuleID ${i.ModuleID} InstanceID ${i.InstanceID})`
				);

			const validator = getSchemaValidator(module.OptionsSchema);
			if (!validator.Check(i.Options))
				throw Array.from(validator.Errors(i.Options));

			if (i.Enabled) {
				const instance = new module();
				instance.Options = i.Options as Static<
					(typeof module)['OptionsSchema']
				>;

				return {
					InstanceID: i.InstanceID,
					ModuleID: module.id,
					Enabled: true,
					Instance: instance
				};
			} else {
				return {
					InstanceID: i.InstanceID,
					ModuleID: module.id,
					Enabled: false,
					Options: i.Options
				};
			}
		});
	}

	constructor() {
		this.Input = [];
		this.Output = [];
	}
}

export default new Kernel();
