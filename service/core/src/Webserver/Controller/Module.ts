import Elysia, { getResponseSchemaValidator, getSchemaValidator, Static, t, ValidationError } from "elysia";
import { NotImplementedError, ResourceNotFoundError } from "../Error";
import kernel, { BaseOptionsSchema } from "../../kernel";
import InputModules from '../../Module/Input';
import OutputModules from '../../Module/Output';

export default new Elysia()
    .get('/module/active', () => {
        type ModuleList = {[id: string]: Static<BaseOptionsSchema>}

        let input: ModuleList = {};
        kernel.Input.forEach((i) => {
            input[i.id] = {};
            input[i.id].schema = i.OptionsSchema.properties;
            input[i.id].options = i.Options;
        });

        let output: ModuleList = {};
        kernel.Output.forEach((o) => {
            output[o.id] = {};
            output[o.id].schema = o.OptionsSchema.properties;
            output[o.id].options = o.Options;
        });

        const response = { input, output };
        return Response.json(response) as unknown as typeof response;
    })
    .get('/module/available', (request) => {
        type ModuleList = {[id: string]: Static<BaseOptionsSchema>}

        let input: ModuleList = {};
        InputModules
            .filter(m => request.query.includeActive || kernel.Input.find(activeModule => activeModule.id == m.id) == undefined)
            .forEach((i) => {
                input[i.id] = {};
                input[i.id].schema = i.OptionsSchema.properties;
            });

        let output: ModuleList = {};
        OutputModules
            .filter(m => request.query.includeActive || kernel.Output.find(activeModule => activeModule.id == m.id) == undefined)
            .forEach((o) => {
                output[o.id] = {},
                output[o.id].schema = o.OptionsSchema.properties;
            });

        const response = { input, output };
        return Response.json(response) as unknown as typeof response;
    }, { query: t.Object({ includeActive: t.Boolean({ default: false }) }) })
    .get('/module/active/:type/:id', (request) => {
        const modules = request.params.type == 'input' ? kernel.Input : kernel.Output;
        const module = modules.find(m => m.id == request.params.id);
        if (module == undefined) throw new ResourceNotFoundError();

        return Response.json(module.Options);
    }, {
        params: t.Object({ id: t.String(), type: t.Union([t.Literal('input'), t.Literal('output')]) })
    })
    .get('/module/active/:type/:id/schema', (request) => {
        const modules = request.params.type == 'input' ? InputModules : OutputModules;
        const module = modules.find(m => m.id == request.params.id);
        if (module == undefined) throw new ResourceNotFoundError();

        return Response.json(module.OptionsSchema.properties);
    }, {
        params: t.Object({ id: t.String(), type: t.Union([t.Literal('input'), t.Literal('output')]) })
    })
    .patch('/module/active/:type/:id', (request) => {
        const modules = request.params.type == 'input' ? kernel.Input : kernel.Output;
        const module = modules.find(m => m.id == request.params.id);
        if (module == undefined) throw new ResourceNotFoundError();

        const partialValidator = getSchemaValidator(t.Partial(module.OptionsSchema));

        // Get rid of the nulls and save the keys they're for, to delete those keys later
        if (typeof request.body != 'object') throw new ValidationError('body', partialValidator, request.body);
        let toDelete: string[] = [];
        for (const [key, value] of Object.entries(request.body as object)) {
            if (value != null) continue;
            toDelete.push(key);
            // @ts-expect-error
            request.body[key] = undefined;
        }

        if (!partialValidator.Check(request.body)) throw new ValidationError('body', partialValidator, request.body);
        
        const newOptions: typeof module['Options'] = {
            ...module.Options,
            ...(request.body as typeof module['Options'])
        };

        toDelete.forEach((key) => {
            if (key in newOptions) newOptions[key] = undefined;
        });

        // We have to run this validation again because we may have deleted a key that is required
        const validator = getSchemaValidator(module.OptionsSchema);
        if (!validator.Check(newOptions)) throw new ValidationError('options', validator, request.body);

        module.Options = newOptions;

        return Response.json(module.Options);
    }, {
        params: t.Object({ id: t.String(), type: t.Union([t.Literal('input'), t.Literal('output')])  }),
        body: t.Unknown()
    });