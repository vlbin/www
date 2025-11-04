import { micromark } from "micromark";
import { frontmatter, frontmatterHtml } from "micromark-extension-frontmatter";
import { gfmHtml, gfm } from "micromark-extension-gfm";

const glob = new Bun.Glob("**/*.{md,png,jpg,svg,webp}");

const postsDir = "./posts";
const outDir = "./dist";
const layoutFile = "../includes/layout.ts";

const Layout = (await import(layoutFile)).default;

const frontmatterExtractor = (content: string) => {
  const startIndex = content.indexOf("---");
  const endIndex = content.indexOf("---", startIndex + 3);
  const frontmatter = content.slice(startIndex + 3, endIndex);

  return Bun.YAML.parse(frontmatter) as Record<string, string>;
};

const converter = (file: string, content: string) => {
  const body = micromark(content, {
    extensions: [gfm(), frontmatter()],
    htmlExtensions: [gfmHtml(), frontmatterHtml()],
  });

  const data = frontmatterExtractor(content);

  return {
    file: file.slice(0, -3), // remove .md
    data,
    body,
  };
};

const files = Array.from(glob.scanSync({ cwd: postsDir }));

const nonMdFiles = files.filter((file) => !file.endsWith(".md"));
const mdFiles = files.filter((file) => file.endsWith(".md"));

nonMdFiles.forEach((file) => {
  Bun.write(`${outDir}/${file}`, Bun.file(`${postsDir}/${file}`));
});

const posts = await Promise.all(
  mdFiles.map((file) => {
    return Bun.file(`${postsDir}/${file}`)
      .text()
      .then((content) => converter(file, content));
  })
);

posts.forEach(async (post) => {
  const fileName = post.file.split("/").slice(0, -1).join("/");

  const wrappedContent = Layout({
    children: post.body,
    postMeta: post.data,
  });

  Bun.write(`${outDir}/${fileName}/index.html`, wrappedContent);
});
