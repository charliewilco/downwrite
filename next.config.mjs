// @ts-check
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true"
});

/**
 * @type {import('next').NextConfig}
 */
const config = {
	reactStrictMode: true,
	swcMinify: true,
	cleanDistDir: true
};

export default withBundleAnalyzer(config);
