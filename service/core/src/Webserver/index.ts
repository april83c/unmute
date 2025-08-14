import Elysia, { ValidationError } from "elysia";
import kernel from "../kernel";
import { swagger } from '@elysiajs/swagger'
import WebKeysInput from "./Controller/WebKeysInput";
import { AlreadyExistsError, BadRequestError, KnownInternalServerError, NotAuthenticatedError, NotAuthorizedError, NotImplementedError, ResourceNotFoundError } from "./Error";
import packageJson from '../../package.json';
import Module from "./Controller/Module";

const Webserver = new Elysia()
    .use(swagger({
        path: '/docs'
    }))
    .error({
		[new NotImplementedError().message]: NotImplementedError,
		[new NotAuthenticatedError().message]: NotAuthenticatedError,
		[new NotAuthorizedError().message]: NotAuthorizedError,
		[new BadRequestError().message]: BadRequestError,
		[new ResourceNotFoundError().message]: ResourceNotFoundError,
		[new AlreadyExistsError('EXAMPLE').message]: AlreadyExistsError,
		[new KnownInternalServerError({}).message]: KnownInternalServerError
	})
	.onError(({ code, error }): { code: string | number } | { code: string, details: ValidationError | string } => {
		// Log errors by severity
		// TODO: replace this with some log storage thing
		if (typeof code !== 'number' && ['NOT_IMPLEMENTED', 'NOT_AUTHENTICATED', 'NOT_AUTHORIZED', 'BAD_REQUEST', 'RESOURCE_NOT_FOUND', 'ALREADY_EXISTS', 'FEATURE_DISABLED', 'VALIDATION', 'NOT_FOUND'].includes(code)) {
			// User error
			console.debug(error);
		} else {
			// Internal error
			console.error(error);
		}

		if (code == 'VALIDATION') return { code, details: JSON.parse(error.message) };
		if (code == 'ALREADY_EXISTS') return { code, details: error.details };

		return { code };
	})
    .use(WebKeysInput)
	.use(Module)
    .get('/', () => 
        'Core is running.\n' +
        'Please see /docs for API documentation.\n' +
        '\n' +
        '# Kernel stats\n' +
        `- ${kernel.Input.length} input modules\n` +
        `- ${kernel.Output.length} output modules\n`
    )
	.get('/status', () => {
		return {
			package: {
				name: packageJson.name,
				version: packageJson.version
			},
			kernel: {
				inputs: kernel.Input.map((i) => i.id),
				outputs: kernel.Output.map((o) => o.id)
			}
		};
	})
    .listen(40000, (s) => { console.log(`Webserver is running at ${s.url}`) }); // TODO: Configurable port

export default Webserver;
export type Webserver = typeof Webserver;