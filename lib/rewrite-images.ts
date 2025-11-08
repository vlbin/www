export const rewriteImages = (
	post_path: string,
	content: string,
	img_dir: string
) => {
	return new HTMLRewriter()
		.on("img", {
			element: (image_element) => {
				const original_src = image_element.getAttribute("src") ?? "";

				if (original_src.startsWith("https://")) {
					return;
				}

				const transformed_src = post_path
					.concat("/")
					.concat(original_src);
				image_element.setAttribute(
					"src",
					`/${img_dir}/${transformed_src}`
				);
			},
		})
		.transform(content);
};
