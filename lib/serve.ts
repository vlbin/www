// serve.ts
Bun.serve({
	port: 5050,
	async fetch(req) {
		const url = new URL(req.url);
		let path = url.pathname;

		if (path === "/") {
			path = "/index.html";
		} else if (!path.includes(".")) {
			// Try path.html first
			const htmlFile = Bun.file(`./dist${path}.html`);
			if (await htmlFile.exists()) {
				return new Response(htmlFile);
			}
			// Then try path/index.html
			const indexFile = Bun.file(`./dist${path}/index.html`);
			if (await indexFile.exists()) {
				return new Response(indexFile);
			}
		}

		// Direct file serving
		const file = Bun.file(`./dist${path}`);
		if (await file.exists()) {
			return new Response(file);
		}

		// 404 handling
		const notFound = Bun.file("./dist/404.html");
		if (await notFound.exists()) {
			return new Response(notFound, { status: 404 });
		}

		return new Response("Not Found", { status: 404 });
	},
});

console.log("🔥 Firebase emulator running at http://localhost:5050");
