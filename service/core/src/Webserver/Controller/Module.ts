import Elysia, {
	getResponseSchemaValidator,
	getSchemaValidator,
	Static,
	t,
	ValidationError
} from 'elysia';
import {
	BadRequestError,
	NotImplementedError,
	ResourceNotFoundError
} from '../Error';
import {
	BaseModule,
	BaseOptionsSchema,
	EnabledModuleInstance,
	ModuleInstance
} from '../../types';
import InputModules from '../../Module/Input';
import OutputModules from '../../Module/Output';
import kernel from '../../kernel';

function moduleInstanceToJson<T extends BaseModule>(m: ModuleInstance<T>) {
	return {
		instanceId: m.InstanceID,
		moduleId: m.ModuleID,
		enabled: m.Enabled,
		schema: m.Enabled ? m.Instance.OptionsSchema.properties : undefined,
		options: m.Enabled ? m.Instance.Options : undefined
	};
}

export default new Elysia()
	.get('/module/active', () => {
		type ModuleList = { [id: string]: Static<BaseOptionsSchema> };

		let input = kernel.Input.map(moduleInstanceToJson);

		let output = kernel.Output.map(moduleInstanceToJson);

		const response = { input, output };
		return Response.json(response) as unknown as typeof response;
	})
	.get(
		'/module/available',
		(request) => {
			type ModuleList = { [id: string]: Static<BaseOptionsSchema> };

			let input: ModuleList = {};
			InputModules.filter(
				(m) =>
					request.query.includeActive
					|| kernel.Input.find((activeModule) => activeModule.ModuleID == m.id)
						== undefined
			).forEach((i) => {
				input[i.id] = {};
				input[i.id].schema = i.OptionsSchema.properties;
			});

			let output: ModuleList = {};
			OutputModules /*.filter(
				(m) =>
					request.query.includeActive
					|| kernel.Output.find((activeModule) => activeModule.ModuleID == m.id)
						== undefined
			)*/.forEach((o) => {
				((output[o.id] = {}),
					(output[o.id].schema = o.OptionsSchema.properties));
			});

			const response = { input, output };
			return Response.json(response) as unknown as typeof response;
		},
		{
			/*query: t.Object({ includeActive: t.Boolean({ default: false }) })*/
		}
	)
	.get(
		'/module/active/:type/:id',
		(request) => {
			const modules =
				request.params.type == 'input' ? kernel.Input : kernel.Output;
			const module = modules.find((m) => m.InstanceID == request.params.id);
			if (module == undefined) throw new ResourceNotFoundError();

			return Response.json(moduleInstanceToJson(module));
		},
		{
			params: t.Object({
				id: t.String(),
				type: t.Union([t.Literal('input'), t.Literal('output')])
			})
		}
	) /*
	.get(
		'/module/active/:type/:id/schema',
		(request) => {
			const modules =
				request.params.type == 'input' ? InputModules : OutputModules;
			const module = modules.find((m) => m.id == request.params.id);
			if (module == undefined) throw new ResourceNotFoundError();

			return Response.json(module.OptionsSchema.properties);
		},
		{
			params: t.Object({
				id: t.String(),
				type: t.Union([t.Literal('input'), t.Literal('output')])
			})
		}
	)*/
	.patch(
		'/module/active/:type/:id',
		(request) => {
			const modules =
				request.params.type == 'input' ? kernel.Input : kernel.Output;
			const module = modules.find((m) => m.InstanceID == request.params.id);
			if (module == undefined) throw new ResourceNotFoundError();

			if ('enabled' in (request.body as any)) {
				return new NotImplementedError(); // TODO: enable/disable modules
			} else if (!module.Enabled) {
				return new BadRequestError(); // youre trying to set options on a disabled module??
			}

			const partialValidator = getSchemaValidator(
				t.Partial(module.Instance.OptionsSchema)
			);

			// Get rid of the nulls and save the keys they're for, to delete those keys later
			if (typeof request.body != 'object')
				throw new ValidationError('body', partialValidator, request.body);
			let toDelete: string[] = [];
			for (const [key, value] of Object.entries(request.body as object)) {
				if (value != null) continue;
				toDelete.push(key);
				// @ts-expect-error
				request.body[key] = undefined;
			}

			if (!partialValidator.Check(request.body))
				throw new ValidationError('body', partialValidator, request.body);

			const newOptions: (typeof module)['Instance']['Options'] = {
				...module.Instance.Options,
				...(request.body as (typeof module)['Instance']['Options'])
			};

			toDelete.forEach((key) => {
				if (key in newOptions) newOptions[key] = undefined;
			});

			// We have to run this validation again because we may have deleted a key that is required
			const validator = getSchemaValidator(module.Instance.OptionsSchema);
			if (!validator.Check(newOptions))
				throw new ValidationError('options', validator, request.body);

			module.Instance.Options = newOptions;

			return Response.json(moduleInstanceToJson(module));
		},
		{
			params: t.Object({
				id: t.String(),
				type: t.Union([t.Literal('input'), t.Literal('output')])
			}),
			body: t.Union([
				t.Unknown(),
				t.Object({
					enabled: t.Boolean()
				})
			])
		}
	)
	.post(
		'/module/active',
		(request) => {
			const modules =
				request.body.type == 'input' ? InputModules : OutputModules;
			const module = modules.find((m) => m.id == request.body.moduleId);
			if (module == undefined) throw new ResourceNotFoundError();

			const moduleInstance = new module();

			const destination =
				request.body.type == 'input' ? kernel.Input : kernel.Output;

			destination.push({
				InstanceID: crypto.randomUUID(),
				ModuleID: module.id,
				Enabled: true,
				Instance: moduleInstance
			});

			return Response.json(
				moduleInstanceToJson(destination[destination.length - 1])
			);
		},
		{
			body: t.Object({
				type: t.UnionEnum(['input', 'output']),
				moduleId: t.String()
			})
		}
	);
