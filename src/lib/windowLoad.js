export function windowLoad() {
	return new Promise((res) => {
		window.addEventListener("load", () => {
			res()
		})
	})
}