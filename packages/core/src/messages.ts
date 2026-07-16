export type MessageMap = {
	logs?: string;
	originalErrorMessage?: string;
	a11ySnapshot?: string;
};

export const defaultMessageMap = {
	logs: "Logs",
	originalErrorMessage: "Original Error Message",
	a11ySnapshot: "A11y Snapshot",
} as const satisfies Required<MessageMap>;

export function resolveMessageMap(messages?: MessageMap): Required<MessageMap> {
	return { ...defaultMessageMap, ...messages };
}

export function formatFailureReport(
	logs: string[],
	error: Error,
	a11ySnapshot: string,
	messages?: MessageMap,
): string {
	const headers = resolveMessageMap(messages);
	const index = error.message.indexOf("Ignored node");
	const originalMessage = error.message.slice(
		0,
		index === -1 ? undefined : index,
	);

	return `[${headers.logs}]\n\n${logs.join("\n")}\n\n[${headers.originalErrorMessage}]\n\n${originalMessage}\n\n[${headers.a11ySnapshot}]\n\n${a11ySnapshot}`;
}
