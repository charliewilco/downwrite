import css from "styled-jsx/css";

export const variables = css.global`
	:root {
		--monospace: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
			Liberation Mono, monospace;
		--sans-serif: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
			sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
		--serif: "Newsreader", "Charter", "Times", system-ui, -apple-system,
			BlinkMacSystemFont, "Segoe UI", Helvetica, serif, "Apple Color Emoji",
			"Segoe UI Emoji", "Segoe UI Symbol";
		--base-spacing: 1rem;

		--onyx-100: #e3e4e4;
		--onyx-200: #c8c9ca;
		--onyx-300: #aeafb1;
		--onyx-400: #949698;
		--onyx-500: #7b7d80;
		--onyx-600: #636669;
		--onyx-700: #4c4f52;
		--onyx-800: #36393d;
		--onyx-900: #212529;
		--onyx-1000: #15171a;
		--pixieblue-100: #d4ecfe;
		--pixieblue-200: #a9d8fd;
		--pixieblue-300: #7cc3fc;
		--pixieblue-400: #4cadfb;
		--pixieblue-500: #2597f1;
		--pixieblue-600: #2082cf;
		--pixieblue-700: #1c6dae;
		--pixieblue-800: #185a8f;
		--pixieblue-900: #144770;
		--goldar-100: #fff3d4;
		--goldar-200: #ffe7a8;
		--goldar-300: #ffdb79;
		--goldar-400: #ffcd46;
		--goldar-500: #ffbe0f;
		--goldar-600: #fdaf04;
		--goldar-700: #fb9f0a;
		--goldar-800: #f89011;
		--goldar-900: #f57f17;

		--bg: var(--onyx-100);
		--fg: var(--onyx-900);
		--surface: #fff;
		--bg-offset: rgb(211, 211, 211);
		--highlight: var(--pixieblue-500);
		--highlight-hover: #5486a4;
	}
`;

export const reset = css.global`
	* {
		margin: 0;
		padding: 0;
	}

	*,
	*::before,
	*::after {
		box-sizing: inherit;
	}

	html {
		box-sizing: border-box;
		text-size-adjust: 100%;
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
		-webkit-tap-highlight-color: transparent;
	}

	body {
		min-height: 100vh;
		scroll-behavior: smooth;
	}

	aside,
	figcaption,
	figure,
	hgroup,
	main,
	menu,
	details {
		display: block;
	}

	[hidden],
	template {
		display: none;
	}

	audio,
	canvas,
	progress,
	video {
		display: inline-block;
		vertical-align: baseline;
	}

	audio:not([controls]) {
		display: none;
		height: 0;
	}

	abbr[title] {
		border-bottom-width: 0.5px;
		border-bottom-style: dotted;
	}

	b,
	strong {
		font-weight: bold;
	}

	i,
	em {
		font-style: italic;
	}

	a {
		background-color: transparent;
		text-decoration: none;
	}

	small {
		font-size: 80%;
	}

	figure {
		margin: 0;
	}

	hr {
		border: 0;
		height: 1px;
		overflow: visible;
	}

	img {
		border-style: none;
		font-style: italic;
		vertical-align: middle;
	}

	svg:not(:root) {
		overflow: hidden;
	}

	pre {
		overflow: auto;
	}

	table {
		border-collapse: collapse;
	}

	textarea {
		white-space: revert;
	}

	button,
	input,
	optgroup,
	select,
	textarea {
		margin: 0;
		font-family: inherit;
	}

	select,
	button {
		text-transform: none;
	}

	button {
		overflow: visible;
	}

	fieldset {
		padding: 0.375rem 0.75rem 0.625rem;
	}

	legend {
		color: inherit;
		display: table;
		max-width: 100%;
		padding: 0;
		white-space: normal;
	}
`;
