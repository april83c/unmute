import { Static, t } from "elysia";
import { InputModule } from "../../kernel";

// Logic for this Input Module is in the Webserver
// The Input Module class for this is just used for configuration
export const WebKeysInputOptionsSchema = t.Object({});
export type WebKeysInputOptions = Static<typeof WebKeysInputOptionsSchema>

export class WebKeysInput extends InputModule {
    static id = 'web_keys';
    static OptionsSchema = WebKeysInputOptionsSchema;
    Options: WebKeysInputOptions;
    
    constructor() {
        super();
        this.Options = {};
    }
};