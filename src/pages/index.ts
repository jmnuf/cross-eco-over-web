import { Res } from "@jmnuf/results";
import { BasePage, PageTemplate } from "../base-page";
import type { AppModel } from "../main";

export class Home extends BasePage {
	declare private app: AppModel;
	declare private file_input: HTMLInputElement;
	declare private _reading: boolean;
	declare private file_name: string;

	constructor(app: AppModel) {
		super();
		this.app = app;
		this._reading = false;
		this.file_name = "";
	}

	get is_reading() {
		return this._reading;
	}

	private reset_form() {
		this.file_input.files = null;
		this.file_name = "";
		this._reading = false;
	}

	async _on_file_submitted(ev: SubmitEvent) {
		ev.preventDefault();
		if (!this.file_input.files || this.file_input.files.length < 1) {
			alert("Need to submit a file");
			return;
		}
		const file = this.file_input.files[0];
		this.file_name = file.name;
		this._reading = true;
		const contents_res = await file.text().then(Res.Ok).catch(Res.Err);
		if (!contents_res.ok) {
			this.reset_form();
			console.error(contents_res.error);
			return;
		}
		const contents = contents_res.value.split("\n").filter(x => x.length > 0);
		this.app.file = contents;
		this.app.file_name = file.name;
		console.log("File loaded with", contents.length, "lines");
		this.reset_form();
		await this.app.router.pull_from_quiver("eco");
	}

	get template() {
		return Home.template;
	}
	static readonly template = PageTemplate`<div class="flex flex-col justify-center items-center w-full h-full" ${{ bind: "view" }}>
		<h1 class="text-2xl">Cross-Eco-over</h1>
		<h2 class="text-xl" \${ !== is_reading }>Load file</h2>
		<h2 class="text-xl" \${ === is_reading }>Loading file \${file_name}</h2>
		<form class="flex flex-col" \${ !== is_reading } \${ submit @=> _on_file_submitted }>
			<input type="file" required ${{ bind: "element", to: "file_input" }} />
			<button type="submit">Eco</button>
		</form>
	</div>`;
}
