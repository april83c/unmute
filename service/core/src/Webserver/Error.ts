// Errors
// These should be registered in the main Elysia()

export class NotImplementedError extends Error {
	message: 'NOT_IMPLEMENTED' = 'NOT_IMPLEMENTED';
	status: 501 = 501;

	constructor() {
		super();
	}
}

export class NotAuthenticatedError extends Error {
	message: 'NOT_AUTHENTICATED' = 'NOT_AUTHENTICATED';
	status: 401 = 401;

	constructor() {
		super();
	}
}

export class NotAuthorizedError extends Error {
	message: 'NOT_AUTHORIZED' = 'NOT_AUTHORIZED';
	status: 403 = 403;

	constructor() {
		super();
	}
}

export class BadRequestError extends Error {
	message: 'BAD_REQUEST' = 'BAD_REQUEST';
	status: 400 = 400;

	constructor() {
		super();
	}
}

// This signifies that a *resource* wasn't found, unlike NotFoundError which
// signifies that a *route* wasn't found.
//
// Example: GET /team/not-a-team -> ResourceNotFoundError
//          GET /not-a-route -> NotFoundError
export class ResourceNotFoundError extends Error {
	message: 'RESOURCE_NOT_FOUND' = 'RESOURCE_NOT_FOUND';
	status: 404 = 404;

	constructor() {
		super();
	}
}

export class AlreadyExistsError extends Error {
	message: 'ALREADY_EXISTS' = 'ALREADY_EXISTS';
	status: 409 = 409;

	details: string;

	constructor(details: string) {
		super();
		this.details = details;
	}
}

export class FeatureDisabledError extends Error {
	message: 'FEATURE_DISABLED' = 'FEATURE_DISABLED';
	status: 421 = 421;

	constructor() {
		super();
	}
}

export class KnownInternalServerError extends Error {
	message: 'KNOWN_INTERNAL_SERVER_ERROR' = 'KNOWN_INTERNAL_SERVER_ERROR';
	internal: object;

	constructor(internal: object) {
		super();
		this.internal = internal;
	}
}