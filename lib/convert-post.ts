import { micromark } from "micromark";
import { frontmatter, frontmatterHtml } from "micromark-extension-frontmatter";
import { gfm, gfmHtml } from "micromark-extension-gfm";

const delimiter = '---';

export const convertPost = (filename: string, content: string) => {
  const [_, frontmatter_raw, body_raw] = content.split(delimiter, 3);

  const body_formatted = micromark(content, {
    extensions: [gfm(), frontmatter()],
    htmlExtensions: [gfmHtml(), frontmatterHtml()],
  });

  const frontmatter_formatted = Bun.YAML.parse(frontmatter_raw) as Record<string, string>
  const filename_formatted = filename.slice(0, -3); // remove md

  return {
    filename: filename_formatted, 
    frontmatter: frontmatter_formatted,
    body: body_formatted,
  }
};