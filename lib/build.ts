import { convertPost } from "@lib/convert-post";
import { Liquid } from "liquidjs";
import { rewriteImages } from "./rewrite-images";
import { getMatchingFiles } from "./get-matching-files";

const config = (await import("../serving.config")).default;

const {
	posts: posts_config,
	output_dir,
	img_dir,
	layouts_dir,
	pages_dir,
} = config;

const { posts_dir, post_layout } = posts_config;

const img_output_dir = `${output_dir}/${img_dir}`;
const posts_output_dir = `${output_dir}/${posts_dir}`;
const post_layout_path = `${layouts_dir}/${post_layout}.liquid`;

export const build = async () => {
	const posts_files = getMatchingFiles(posts_dir, ["md"]);
	const media_files = getMatchingFiles(posts_dir, ["png", "jpg", "webp"]);
	const pages_files = getMatchingFiles(pages_dir, ["liquid"]);

	media_files.forEach((filename) => {
		Bun.write(
			`${img_output_dir}/${filename.replaceAll("/", "-")}`,
			Bun.file(`${posts_dir}/${filename}`)
		);
	});

	const posts = await Promise.all(
		posts_files.map((file) =>
			Bun.file(`${posts_dir}/${file}`)
				.text()
				.then((content) => convertPost(file, content, posts_dir))
		)
	);

	const template_engine = new Liquid({
		extname: ".liquid",
		layouts: layouts_dir,
		globals: {
			post_data: posts.map((post) => ({
				slug: post.slug,
				title: post.frontmatter.title,
			})),
		},
	});

	const posts_promises = posts.map(async (post) => {
		const [filename] = post.filename.split("/");

		const content = template_engine.renderFileSync(post_layout_path, {
			title: post.frontmatter.title,
			post: post.body,
		});

		const transformed = rewriteImages(filename, content, img_dir);

		return Bun.write(`${posts_output_dir}/${filename}.html`, transformed);
	});

	const pages_promises = pages_files.map(async (page_file) => {
		const page_path = `${pages_dir}/${page_file}`;
		const page_slug = page_file.substring(0, page_file.indexOf("."));

		const content = template_engine.renderFileSync(page_path, {
			posts,
		});

		const transformed = rewriteImages(page_slug, content, img_dir);

		return Bun.write(`${output_dir}/${page_slug}.html`, transformed);
	});

	await Promise.all([...posts_promises, ...pages_promises]);
};
