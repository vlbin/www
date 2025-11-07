export const buildCss = () => {
	Bun.build({
		entrypoints: ["./src/styles/main.css"],
		outdir: "./dist/styles",
	});
};
