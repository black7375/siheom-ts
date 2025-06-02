import { useState } from "react";

export function Counter() {
	const [state, setState] = useState(0);

	return (
		<button
			type="button"
			onClick={() => {
				setState((old) => old + 1);
			}}
		>
			{state}
		</button>
	);
}
