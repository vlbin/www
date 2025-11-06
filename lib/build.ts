import { convertPost } from "@lib/convert-post";
import { Liquid } from "liquidjs";
import { rewriteImages } from "./rewrite-images";

const config = (await import("../serving.config")).default;

const { input, output, layout, img_dir, layouts } = config;
const img_output = `${output}/${img_dir}`;

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
	Bun.write(
		`${img_output}/${filename.replaceAll("/", "-")}`,
		Bun.file(`${input}/${filename}`)
	);
});

const posts = await Promise.all(
	post_files.map((file) =>
		Bun.file(`${input}/${file}`)
			.text()
			.then((content) => convertPost(file, content))
	)
);

const engine = new Liquid({ extname: ".liquid", layouts });

const content = engine.renderFileSync("src/pages/index.liquid");
console.log(content);

await Promise.all(
	posts.map(async (post) => {
		const [filename, ...path] = post.filename.split("/").toReversed();
		const path_str = path.join("/");

		const content = engine.renderFileSync(layout, {
			title: post.frontmatter.title,
			post: post.body,
		});

		const transformed = rewriteImages(path_str, content, img_dir);

		return Bun.write(`${output}/${path_str}/${filename}.html`, transformed);
	})
);

console.log("Built all pages");
