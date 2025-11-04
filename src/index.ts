import { micromark } from "micromark";
import { gfmHtml, gfm } from "micromark-extension-gfm";

const mdString = "# Hello, world!";

console.log(
  micromark(mdString, { extensions: [gfm()], htmlExtensions: [gfmHtml()] })
);
