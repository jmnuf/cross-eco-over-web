import { BasePage, PageTemplate } from "../base-page";
import type { AppModel } from "../main";

export class Home extends BasePage {
	declare private app: AppModel;
	declare private file_input: HTMLInputElement;

	constructor(app: AppModel) {
		super();
		this.app = app;
	}

	_on_file_submitted(ev: SubmitEvent) {
		ev.preventDefault();
		if (!this.file_input.files) {
			alert("Need to submit a file");
			return;
		}
	}

	get template() {
		return Home.template;
	}
	static readonly template = PageTemplate`<div class="flex flex-col justify-center items-center w-full h-full" ${{ bind: "view" }}>
		<h1 class="text-2xl">Cross-Eco-over</h1>
		<h2 class="text-xl">Load file</h2>
		<form class="flex flex-col" \${ submit @=> _on_file_submitted }>
			<input type="file" required ${{ bind: "element", to: "file_input" }} />
			<button type="submit">Eco</button>
		</form>
	</div>`;
}
