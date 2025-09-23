import { Static, t } from 'elysia';
import {
	BaseModule,
	InputModule,
	InputModuleBaseOptionsSchemaTypebox,
	OutputModule,
	Words
} from '../../types';
import kernel from '../../kernel';
import { GlobalKeyboardListener } from 'node-global-key-listener';

export const ApprovalModuleOptionsSchema = t.Composite([
	t.Object({
		rejectKey: t.String(),
		approveKey: t.String()
	}),
	InputModuleBaseOptionsSchemaTypebox
]);
export type ApprovalModuleOptions = Static<typeof ApprovalModuleOptionsSchema>;

export class ApprovalModule
	extends BaseModule
	implements InputModule, OutputModule
{
	static id = 'approval';
	static OptionsSchema = ApprovalModuleOptionsSchema;
	Options: ApprovalModuleOptions;

	private listener: GlobalKeyboardListener;

	private approvalBuffer: Words | undefined;

	constructor(options?: ApprovalModuleOptions) {
		super();
		this.Options = options ?? {
			target: 'all',
			rejectKey: 'X',
			approveKey: 'Z'
		};

		this.listener = new GlobalKeyboardListener();

		this.listener.addListener((e, isDown) => {
			if (e.state == 'UP') {
				switch (e.name) {
					case this.Options.approveKey: {
						console.log('ApprovalModule: approve key pressed');
						this.Approve();
						break;
					}
					case this.Options.rejectKey: {
						console.log('ApprovalModule: reject key pressed');
						this.Reject();
						break;
					}
				}
			}
		});
	}

	private Approve() {
		if (this.approvalBuffer) {
			kernel.Sentence(this.approvalBuffer, this.Options.target);
			this.approvalBuffer = undefined;
		}
	}

	private Reject() {
		if (this.approvalBuffer) {
			this.approvalBuffer = undefined;
			kernel.Progress({ text: '', redacted: false }, this.Options.target);
		}
	}

	Progress(text: Words) {
		console.log('ApprovalModule: Progress: ' + text.text);

		kernel.Progress({ text: text.text, redacted: true }, this.Options.target);
	}

	Sentence(text: Words) {
		console.log('ApprovalModule: Sentence: ' + text.text);
		this.approvalBuffer = text;
	}
}
