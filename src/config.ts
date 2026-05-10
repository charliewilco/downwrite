export type Config = {
	addr: string;
	port: number;
	databaseUrl: string;
	sessionSecret: string;
	mcpWriteEnabled: boolean;
};

export function loadConfig(): Config {
	const databaseUrl = process.env.DOWNWRITE_DATABASE_URL;
	const sessionSecret = process.env.DOWNWRITE_SESSION_SECRET;

	if (!databaseUrl) {
		throw new Error("DOWNWRITE_DATABASE_URL is required");
	}

	if (!sessionSecret) {
		throw new Error("DOWNWRITE_SESSION_SECRET is required");
	}

	const addr = process.env.DOWNWRITE_ADDR ?? ":7878";
	return {
		addr,
		port: parsePort(addr),
		databaseUrl,
		sessionSecret,
		mcpWriteEnabled: process.env.DOWNWRITE_MCP_WRITE_ENABLED === "true",
	};
}

function parsePort(addr: string): number {
	const value = addr.includes(":") ? addr.slice(addr.lastIndexOf(":") + 1) : addr;
	const port = Number.parseInt(value, 10);
	if (!Number.isFinite(port) || port <= 0) {
		throw new Error(`invalid DOWNWRITE_ADDR port: ${addr}`);
	}
	return port;
}
