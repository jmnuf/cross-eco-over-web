// @ts-ignore
import { UI } from "@peasy-lib/peasy-ui";
import { missNorishre } from "@jmnuf/norishre";

const createRouter = (app: App) => missNorishre({
	home: {
		path: "/",
		async model() {
			const { Home } = await import("./pages/index");
			const page = new Home(app);
			return page;
		},
	},
	eco: {
		path: "/eco",
		async model() {
			const { Eco } = await import("./pages/eco");
			const page = new Eco(app);
			return page;
		}
	},
});
type Mistress = ReturnType<typeof createRouter>;

class App {
	file: string[];
	file_name: string;
	router: Mistress;

	constructor() {
		this.file_name = "";
		this.file = [];
		this.router = createRouter(this);
	}

	static readonly template = `<div class="w-[100vw] h-[100vh] bg-slate-100">
		<\${ router === }/>
	</div>`;
}

export type AppModel = App;

async function main() {
	const app = new App();
	const [arrow, params] = app.router.find_arrow_id_by_url(location.pathname);
	if (arrow != "%404%") {
		await app.router.pull_from_quiver(arrow, params);
	}
	UI.create(document.body, app, App.template);
}

main().catch(console.error);

