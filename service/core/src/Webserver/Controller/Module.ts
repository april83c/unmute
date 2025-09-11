import Elysia, {
	getResponseSchemaValidator,
	getSchemaValidator,
	Static,
	t,
	ValidationError
} from 'elysia';
import { NotImplementedError, ResourceNotFoundError } from '../Error';
import { BaseOptionsSchema } from '../../types';
import InputModules from '../../Module/Input';
import OutputModules from '../../Module/Output';
import kernel from '../../kernel';

export default new Elysia()
	.get('/module/active', () => {
		type ModuleList = { [id: string]: Static<BaseOptionsSchema> };

		let input: ModuleList = {};
		kernel.Input.filter((m) => m.Enabled).forEach((i) => {
			input[i.InstanceID] = {};
			input[i.InstanceID].schema = i.Instance.OptionsSchema.properties;
			input[i.InstanceID].options = i.Instance.Options;
		});

		let output: ModuleList = {};
		kernel.Output.filter((m) => m.Enabled).forEach((o) => {
			output[o.InstanceID] = {};
			output[o.InstanceID].schema = o.Instance.OptionsSchema.properties;
			output[o.InstanceID].options = o.Instance.Options;
		});

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
			OutputModules.filter(
				(m) =>
					request.query.includeActive
					|| kernel.Output.find((activeModule) => activeModule.ModuleID == m.id)
						== undefined
			).forEach((o) => {
				((output[o.id] = {}),
					(output[o.id].schema = o.OptionsSchema.properties));
			});

			const response = { input, output };
			return Response.json(response) as unknown as typeof response;
		},
		{ query: t.Object({ includeActive: t.Boolean({ default: false }) }) }
	)
	.get(
		'/module/active/:type/:id',
		(request) => {
			const modules =
				request.params.type == 'input' ? kernel.Input : kernel.Output;
			const module = modules
				.filter((m) => m.Enabled)
				.find((m) => m.InstanceID == request.params.id);
			if (module == undefined) throw new ResourceNotFoundError();

			return Response.json(module.Instance.Options);
		},
		{
			params: t.Object({
				id: t.String(),
				type: t.Union([t.Literal('input'), t.Literal('output')])
			})
		}
	)
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
	)
	.patch(
		'/module/active/:type/:id',
		(request) => {
			const modules =
				request.params.type == 'input' ? kernel.Input : kernel.Output;
			const module = modules
				.filter((m) => m.Enabled)
				.find((m) => m.InstanceID == request.params.id);
			if (module == undefined) throw new ResourceNotFoundError();

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

			return Response.json(module.Instance.Options);
		},
		{
			params: t.Object({
				id: t.String(),
				type: t.Union([t.Literal('input'), t.Literal('output')])
			}),
			body: t.Unknown()
		}
	)
	.post(
		'/module/active',
		(request) => {
			const modules =
				request.params.type == 'input' ? kernel.Input : kernel.Output;
			const module = modules
				.filter((m) => m.Enabled)
				.find((m) => m.InstanceID == request.params.id);
			if (module == undefined) throw new ResourceNotFoundError();

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

			return Response.json(module.Instance.Options);
		},
		{
			body: t.Object({
				type: t.UnionEnum(['input', 'output']),
				moduleId: t.String()
			})
		}
	);
