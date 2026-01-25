import { describe, it } from "vitest";
import { assertions, query, runSiheom } from "../../src";
import { given } from "../../src/siheom/given";

function RelationsDemo() {
	return (
		<form aria-label="relations-demo">
			<label id="email-label" htmlFor="email">Email</label>
			<span id="email-hint">Enter your email address</span>
			<span id="email-error" role="alert">Email is required</span>
			<input
				id="email"
				type="email"
				aria-labelledby="email-label"
				aria-describedby="email-hint"
				aria-errormessage="email-error"
				aria-invalid="true"
			/>

			<div id="panel" aria-labelledby="panel-title">
				<h2 id="panel-title">Settings Panel</h2>
				<button
					id="toggle-btn"
					type="button"
					aria-controls="panel"
					aria-expanded="true"
				>
					Toggle Panel
				</button>
			</div>

			<section id="detail-info" aria-label="Feature details">More information about this feature</section>
			<button type="button" aria-details="detail-info">Help</button>

			<nav aria-label="Main navigation">
				<div id="menu" role="menu">
					<button type="button" role="menuitem">Home</button>
					<button type="button" role="menuitem">About</button>
				</div>
				<button type="button" aria-owns="menu" aria-haspopup="menu">Menu</button>
			</nav>
		</form>
	);
}

describe("Relations", () => {
	it("shows aria relations in snapshot", () => {
		return runSiheom(
			given.render(<RelationsDemo />),
			assertions.a11ySnapshot(query.form("relations-demo"), "relations-demo.snap")
		);
	});
});
