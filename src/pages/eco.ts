import { Res, type Result } from "@jmnuf/results";
import { BasePage, PageTemplate } from "../base-page";
import type { AppModel } from "../main";

type EcoLog = {
	timestamp: number;
	loglevel: string;
	category: string;
	message: string;
	data: Record<string, unknown | undefined>;
};

function parseEcoLog(str: string): Result<EcoLog> {
	try {
		const json = JSON.parse(str);
		if (json == null) {
			throw new Error("Invalid log: JSON parse generated nothing");
		}
		if (typeof json != "object") {
			throw new Error("Invalid log: Logs must be json objects");
		}
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
		];
	}

	protected async _on_mounted() {
		const app = this.app;
		if (app.file.length < 1) {
			await app.router.pull_from_quiver("home");
			return;
		}
		this.load_app_file();
	}

	get file_name() {
		return this.app.file_name;
	}

	private async load_app_file() {
		const file_contents = this.app.file;
		this.contents.length = 0;
		for (const line of file_contents) {
			const res = parseEcoLog(line);
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
	static readonly template = PageTemplate`<div class="flex flex-col items-center mx-auto w-3/4 h-full" ${{ bind: "view" }}>
		<h1 class="text-2xl pt-3">\${ file_name }</h1>
		<div class="w-full scroll overflow-auto h-max-content">
		<table class="w-full">
				<thead>
					<tr>
						<th ${{ bind: "iter", from: "headers", to: "value" }}>
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
					</tr>
				</tbody>
			</table>
		</div>
	</div>`;
}

