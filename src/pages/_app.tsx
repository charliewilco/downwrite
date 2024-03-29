import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import Head from "next/head";
import { useEffect } from "react";
import * as Analytics from "fathom-client";
import { UIShell } from "@components/ui-shell";
import {
	OG_DESCRIPTION,
	OG_IMAGE_URL,
	BASE_OG_TITLE,
	BASE_PROD_URL
} from "@shared/constants";

import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/checkbox/styles.css";

const CustomAppWrapper = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();
	useEffect(() => {
		Analytics.load("FENETBXC", {
			includedDomains: [
				"downwrite.us",
				"alpha.downwrite.us",
				"beta.downwrite.us",
				"next.downwrite.us"
			]
		});

		function onRouteChangeComplete() {
			Analytics.trackPageview();
		}
		router.events.on("routeChangeComplete", onRouteChangeComplete);

		return () => {
			router.events.off("routeChangeComplete", onRouteChangeComplete);
		};
	}, [router.events]);

	return (
		<UIShell>
			<Head>
				<title>{BASE_OG_TITLE}</title>
				<link rel="icon" type="image/png" href="/transitional.png" />
				<meta name="description" content={OG_DESCRIPTION} />
				<meta name="title" content={BASE_OG_TITLE} />
				<meta name="theme-color" content="#050505" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={BASE_PROD_URL} />
				<meta property="og:title" content={BASE_OG_TITLE} />
				<meta property="og:description" content={OG_DESCRIPTION} />
				<meta property="og:image" content={OG_IMAGE_URL} />
				<meta property="twitter:url" content={BASE_PROD_URL} />
				<meta property="twitter:title" content={BASE_OG_TITLE} />
				<meta property="twitter:description" content={OG_DESCRIPTION} />
				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:image" content={OG_IMAGE_URL} />
			</Head>
			<Component {...pageProps} />
		</UIShell>
	);
};

export default CustomAppWrapper;
