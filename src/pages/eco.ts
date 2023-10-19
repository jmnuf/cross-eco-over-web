import { Res, type Result } from "@jmnuf/results";
import { BasePage, PageTemplate } from "../base-page";
import type { AppModel } from "../main";

type EcoLog = {
	timestamp: number;
	loglevel: string;
	category: string;
	message: string;
	data: Record<string, unknown | undefined>;
	data_table_display: string;
};

function parse_eco_log(str: string): Result<EcoLog> {
	try {
		const json = JSON.parse(str);
		if (json == null) {
			throw new Error("Invalid log: JSON parse generated nothing");
		}
		if (typeof json != "object") {
			throw new Error("Invalid log: Logs must be json objects");
		}
		if (!("data" in json) || typeof json.data != "object") {
			throw new TypeError("Invalid log: Logs must include a data object even if empty");
		}
		const data_table_display = Object.keys(json.data).length == 0 ? "{  }" : "{..}";
		Object.defineProperty(json, "data_table_display", {
			value: data_table_display,
			configurable: true,
			enumerable: false,
			writable: false,
		});
		return {
			ok: true,
			value: json,
		};
	} catch (e) {
		return Res.Err(e as Error);
	}
}

export class Eco extends BasePage {
	declare private app: AppModel;
	declare private dialog_element: HTMLDialogElement;
	declare private dialog_contents: { template: string } | null;
	readonly headers: string[];
	private contents: EcoLog[];

	constructor(app: AppModel) {
		super();
		this.app = app;
		this.contents = [];
		this.headers = [
			"Timestamp",
			"Log Level",
			"Category",
			"Message",
			"Data",
		];
		this.dialog_contents = null;
	}

	protected async _close_dialog_element() {
		this.dialog_element?.close();
	}

	protected async _on_mounted() {
		const app = this.app;
		if (app.file.length < 1) {
			await app.router.pull_from_quiver("home");
			return;
		}
		this.load_app_file();
		if (!this.dialog_element) {
			this.dialog_element = document.getElementById("data-dialog") as HTMLDialogElement;
		}
	}

	protected async _on_full_data_display_request(this: { log: EcoLog }, _ev:PointerEvent, context:{ log: EcoLog & { $index: number } }, _clicked_elem: HTMLElement, _ev_name: string, pui: { $parent: { $model: Eco } }) {
		const eco = pui.$parent.$model;
		const dialog_elem = eco.dialog_element;
		const log = context.log;
		
		const extra = [];
		for (const key of Object.keys(log.data)) {
			const val = log.data[key];
			if (typeof val != "object") {
				extra.push({ key, val, template: `<li>\${key}: \${val}</li>` });
			} else {
				extra.push({ key, val: JSON.stringify(val, undefined, "  "), template: `<li>\${key}: <pre><code>\${val}</code></pre></li>` });
			}
		}
		
		const dialog = {
			extra,
			request_close_dialog: () => {
				eco._close_dialog_element();
			},
			template: `<div class="flex flex-col w-full h-full justify-center items-center text-wrap">
				<h3 class="text-xl pt-4">${log.message}</h3>
				<p class="py-2 px-4">
					<ul>
						<li>Date (UTC): ${(new Date(log.timestamp)).toUTCString()}</li>
						<li>Category: ${log.category}</li>
						<\${ item === } \${ item <=* extra }/>
					</ul>
				</p>
				<button \${ click @=> request_close_dialog }>Close</button>
			</div>`,
		};
		eco.dialog_contents = dialog;
		
		dialog_elem.addEventListener("close", () => {
			eco.dialog_contents = null;
		}, { once: true });

		// @ts-ignore
		UI.queue(() => {
			dialog_elem.showModal();
		});
	}

	get file_name() {
		return this.app.file_name;
	}

	private async load_app_file() {
		const file_contents = this.app.file;
		this.contents.length = 0;
		for (const line of file_contents) {
			const res = parse_eco_log(line);
			if (!res.ok) {
				console.error(res.error);
			} else {
				this.contents.push(res.value);
			}
		}
	}

	get template() {
		return Eco.template;
	}
	static readonly template = PageTemplate`<div class="flex flex-col items-center mx-auto w-full lg:w-5/6 h-full" ${{ bind: "view" }}>
		<h1 class="text-2xl pt-3">\${ file_name }</h1>
		<div class="w-full scroll overflow-auto h-max-content">
		<table class="table w-full py-6 text-center">
				<thead>
					<tr class="text-slate-100">
						<th class="sticky top-0 bg-slate-800 py-2" ${{ bind: "iter", from: "headers", to: "value" }}>
							\${ value }
						</th>
					</tr>
				</thead>
				<tbody>
					<tr ${{ bind: "iter", from: "contents", to: "log" }}>
						<td>\${ log.timestamp }</td>
						<td>\${ log.loglevel }</td>
						<td>\${ log.category }</td>
						<td>\${ log.message }</td>
						<td><pre class="cursor-pointer" \${ click @=> _on_full_data_display_request }><code>\${ log.data_table_display }</code></pre></td>
					</tr>
				</tbody>
			</table>
		</div>
		<dialog id="data-dialog" class="w-full h-full bg-slate-200 rounded lg:w-5/6 lg:h-5/6" ${{ bind: "element", to: "dialog_element" }}>
			<${{ bind: "component", name: "dialog_contents" }} \${ === dialog_contents }/>
		</dialog>
	</div>`;
}

