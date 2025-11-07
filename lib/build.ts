import { convertPost } from "@lib/convert-post";
import { Liquid } from "liquidjs";
import { rewriteImages } from "./rewrite-images";
import { getMatchingFiles } from "./get-matching-files";

const config = (await import("../serving.config")).default;

const { posts: posts_config, output_dir, img_dir, layouts_dir } = config;
const { input_dir, layout } = posts_config;
const img_output = `${output_dir}/${img_dir}`;
const template_engine = new Liquid({
	extname: ".liquid",
	layouts: layouts_dir,
});

const posts_files = getMatchingFiles(input_dir, ["md"]);
const media_files = getMatchingFiles(input_dir, ["png", "jpg", "webp", "avif"]);
const pages_files = getMatchingFiles("./src/pages", ["liquid"]);

media_files.forEach((filename) => {
	Bun.write(
		`${img_output}/${filename.replaceAll("/", "-")}`,
		Bun.file(`${input_dir}/${filename}`)
	);
});

const posts = await Promise.all(
	posts_files.map((file) =>
		Bun.file(`${input_dir}/${file}`)
			.text()
			.then((content) => convertPost(file, content))
	)
);

// BUILD POSTS
await Promise.all(
	posts.map(async (post) => {
		const [filename] = post.filename.split("/");

		const post_path = `${layouts_dir}/${layout}.liquid`;

		const content = template_engine.renderFileSync(post_path, {
			title: post.frontmatter.title,
			post: post.body,
		});

		const transformed = rewriteImages(filename, content, img_dir);

		return Bun.write(`${output_dir}/posts/${filename}.html`, transformed);
	})
);

// BUILD PAGES
await Promise.all(
	pages_files.map(async (page_file) => {
		const page_path = `./src/pages/${page_file}`;
		const page_slug = page_file.substring(0, page_file.indexOf("."));

		const content = template_engine.renderFileSync(page_path, {});

		const transformed = rewriteImages(page_slug, content, img_dir);

		return Bun.write(`${output_dir}/${page_slug}.html`, transformed);
	})
);

console.log("Built all pages");
