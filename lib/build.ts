import { convertPost } from "@lib/convert-post";
import { Liquid } from "liquidjs";

const config = (await import("../serving.config")).default;

const { input, output, layout, styles } = config;

const glob = new Bun.Glob(`**/*.{md,png,jpg,svg,webp}`);
const files = Array.from(glob.scanSync({ cwd: input }));

const [post_files, media_files] = files.reduce<[string[], string[]]>(
	(acc, file) =>
		file.endsWith(".md")
			? [acc[0].concat(file), acc[1]]
			: [acc[0], acc[1].concat(file)],
	[[], []]
);

media_files.forEach((filename) => {
	Bun.write(`${output}/${filename}`, Bun.file(`${input}/${filename}`));
});

const posts = await Promise.all(
	post_files.map((file) =>
		Bun.file(`${input}/${file}`)
			.text()
			.then((content) => convertPost(file, content))
	)
);

const engine = new Liquid();
const layout_content = await Bun.file(layout).text();

await Bun.write(`${output}/styles/main.css`, Bun.file(styles));

await Promise.all(
	posts.map(async (post) => {
		const [filename, ...path] = post.filename.split("/").toReversed();

		const content = engine.parseAndRenderSync(layout_content, {
			title: post.frontmatter.title,
			post: post.body,
		});

		return Bun.write(
			`${output}/${path.join("/")}/${filename}.html`,
			content
		);
	})
);

console.log("Built all pages");
