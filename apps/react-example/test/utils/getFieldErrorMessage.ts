export function getFieldErrorProps(error: Record<string, string | undefined>, name: string, errorId: string): {
	"aria-invalid": "true" | undefined,
	"aria-describedby": string,
	"aria-errormessage": string,
} {
	return {
		"aria-invalid": error[name] ? "true" : undefined,
		"aria-describedby": error[name] ? errorId : "",
		"aria-errormessage": error[name] ? errorId : "",
	};
}
