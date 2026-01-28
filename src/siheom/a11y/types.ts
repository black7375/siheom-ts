export interface A11yStates {
	hidden?: boolean;
	disabled?: boolean;

	focusable?: boolean;
	focused?: boolean;
	modal?: boolean;

	expanded?: boolean;
	pressed?: boolean | "mixed";
	checked?: boolean | "mixed";
	selected?: boolean;
	current?: string | boolean;

	invalid?: boolean | "grammar" | "spelling";
	required?: boolean;
	readonly?: boolean;

	busy?: boolean;
}

export interface A11yProperties {
	level?: number;
	haspopup?: string | boolean;
	orientation?: "horizontal" | "vertical";
	multiselectable?: boolean;
	autocomplete?: string;

	valuemin?: number;
	valuemax?: number;
	valuenow?: number;
	valuetext?: string;

	posinset?: number;
	setsize?: number;

	colcount?: number;
	colindex?: number;
	colspan?: number;
	rowcount?: number;
	rowindex?: number;
	rowspan?: number;
	sort?: "ascending" | "descending" | "none" | "other";
}

export interface A11yRelation {
	id: string;
	name: string;
}

export interface A11yRelations {
	activedescendant?: A11yRelation;
	controls?: A11yRelation[];
	describedby?: A11yRelation[];
	details?: A11yRelation;
	errormessage?: A11yRelation;
	flowto?: A11yRelation[];
	labelledby?: A11yRelation[];
	owns?: A11yRelation[];
}

export interface A11yLiveRegion {
	live?: "off" | "polite" | "assertive";
	atomic?: boolean;
	relevant?: string;
}

export interface A11yDragDrop {
	grabbed?: boolean;
	dropeffect?: string;
}

export interface A11yNode {
	role: string;
	name: string;
	description?: string;
	value?: string;

	states?: A11yStates;
	properties?: A11yProperties;
	relations?: A11yRelations;
	liveRegion?: A11yLiveRegion;
	dragDrop?: A11yDragDrop;
	other?: Record<string, unknown>;

	children: A11yNode[];
}
