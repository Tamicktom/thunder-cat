//* Libraries imports
import { Html } from "@elysia/html";

export type LayoutProps = {
  title: string;
  children: JSX.Element | JSX.Element[] | string;
};

export function Layout(props: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/public/dashboard.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.min.js"></script>
      </head>
      <body>
        <div class="page-bg" aria-hidden="true"></div>
        <div class="page">{props.children}</div>
      </body>
    </html>
  );
}
