import { raw } from "hono/html";

export default function Layout({
  children,
  postMeta,
}: {
  children: string;
  postMeta: {
    title: string;
  };
}) {
  const { title } = postMeta;

  return raw(
    `
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body>
        ${children}
      </body>
    </html>
  `;
}
