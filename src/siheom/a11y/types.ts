export interface A11yNodeStates {
	checked?: boolean | "mixed";
	expanded?: boolean;
	selected?: boolean;
	disabled?: boolean;
	pressed?: boolean | "mixed";
	current?: string | boolean;
	busy?: boolean;
	invalid?: boolean | "grammar" | "spelling";
	required?: boolean;
	readonly?: boolean;
	valueNow?: number;
	valueMin?: number;
	valueMax?: number;
	valueText?: string;
}

export interface A11yRelation {
	id: string;
	name: string;
}

export interface A11yRelations {
	labelledBy?: A11yRelation[];
	describedBy?: A11yRelation[];
	errorMessage?: A11yRelation;
	controls?: A11yRelation[];
	owns?: A11yRelation[];
	flowTo?: A11yRelation[];
	details?: A11yRelation;
}

export interface A11yNode {
	role: string;
	name: string;
	level?: number;
	states: A11yNodeStates;
	description?: string;
	value?: string;
	posinset?: number;
	setsize?: number;
	relations?: A11yRelations;
	children: A11yNode[];
}
