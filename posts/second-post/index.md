---
title: Building a static site generator
date: 2025-11-07
---

I recently wanted to update my website using methods and techniques I don't use on a day-to-day basis (React, basically), to go somewhere outside my comfort zone. Naturally, I fell into the trap most web interested engineers find themselves in at some point: I built my own static site generator. This post is a short summary and log of that process.

While thinking about the rewrite before starting, I came to the following conclusions:

1. I wanted to write my posts in markdown
2. I wanted to use some templating language I hadn't used before to create layouts
3. I did not want to use a frontend framework

I landed on using Bun as the main driver of the static site generator, utilizing its fast and convenient functionality for reading and writing files. I also came to enjoy some of the other functionality Bun offers out of the box.

The first point is quite straight-forward. For each post on the site, I'll make a directory with the name of that directory serving as the slug of the post. The directory will then contain an `index.md` with the post's content, and any images referenced in the post.

For transforming this markdown to HTML, there are tons of great static site generators out there that can do this (and do a lot more), and many of them have substantial open source communities (e.g. 11ty). However, as I wanted to make my own static site generator, I looked at solutions a level below this in the stack, and found _micromark_.

Micromark takes a markdown file and converts it to an abstract syntax tree (AST), meaning you can traverse through the tree and apply transformations independently to each node. _Micromark also enables you to not think about that at all_, and just convert markdown to HTML. That is how I used it, with the small addition of an extension to allow for GitHub-flavored markdown. To parse the frontmatter of my markdown files, I simply extract the content between the first sets of thriple-dashes and parse this with Bun's built-in YAML parser.

```typescript
const body_formatted = micromark(body_raw, {
	extensions: [gfm()],
	htmlExtensions: [gfmHtml()],
});
```

For transforming the images, I decided on having a single `img` directory in my output, containing a separate directory of images for each post. I then used Bun's built-in `HTMLRewriter` to point the `src` at the correct image.

![](img.png)
