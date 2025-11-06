export const rewriteImages = (
	post_path: string,
	content: string,
	img_dir: string
) => {
	const rewriter = new HTMLRewriter();
	rewriter.on("img", {
		element: (image_element) => {
			const original_src = image_element.getAttribute("src") ?? "";
			const transformed_src = post_path
				.concat("/")
				.concat(original_src)
				.replaceAll("/", "-");

			image_element.setAttribute("src", `${img_dir}/${transformed_src}`);
		},
	});

	return rewriter.transform(content);
};
