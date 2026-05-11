export type Config = {
	addr: string;
	hostname?: string;
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
	const parsedAddr = parseAddr(addr);
	return {
		addr,
		hostname: parsedAddr.hostname,
		port: parsedAddr.port,
		databaseUrl,
		sessionSecret,
		mcpWriteEnabled: process.env.DOWNWRITE_MCP_WRITE_ENABLED === "true",
	};
}

function parseAddr(addr: string): { hostname?: string; port: number } {
	const separator = addr.lastIndexOf(":");
	const hostname = separator > 0 ? addr.slice(0, separator) : undefined;
	const value = separator >= 0 ? addr.slice(separator + 1) : addr;
	const port = Number.parseInt(value, 10);
	if (!Number.isFinite(port) || port <= 0) {
		throw new Error(`invalid DOWNWRITE_ADDR port: ${addr}`);
	}
	return { hostname, port };
}
