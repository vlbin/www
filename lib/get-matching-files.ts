export const getMatchingFiles = (path: string, formats: string[]) => {
	const formats_pattern = formats.join(",");
	const glob = new Bun.Glob(`**/*.{${formats_pattern}}`);
	return Array.from(glob.scanSync({ cwd: path }));
};
