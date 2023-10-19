
export abstract class BasePage {
	element: HTMLElement | null = null;
	protected _on_mounted() {}
	protected _on_unmounted() {}
	set page_ui_view(view: any) {
		view.attached.then(() => this._on_mounted());
		view.detached.then(() => {
			this.element = null;
			this._on_unmounted()
		});
	}
}

type ViewBinding = {
	bind: "view";
};
type ComponentBinding = {
	bind: "component";
	name: string;
};
type ElementBinding = {
	bind: "element";
	to: string;
};

type UIBindings =
	| ViewBinding
	| ComponentBinding
	| ElementBinding;

export function PageTemplate(strings: TemplateStringsArray, ...args: Array<string | UIBindings>) {
	let str = "";
	for (let i = 0; i < strings.length; i++) {
		str += strings[i];
		if (i >= args.length) {
			continue;
		}
		const binding = args[i];
		if (typeof binding == "string") {
			str += binding;
			continue;
		}
		switch (binding.bind) {
			case "view": {
				str += "${ ==> element:page_ui_view }";
			} break;
			case "component": {
				str += `\${ ${binding.name} === }`;
			} break;
			case "element": {
				str += `\${ ==> ${binding.to} }`;
			} break;
		}
	}
	return str;
}

