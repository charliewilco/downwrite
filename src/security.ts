import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 18): string {
	return randomBytes(bytes).toString("base64url");
}

export function signValue(secret: string, value: string): string {
	const signature = createHmac("sha256", secret)
		.update(value)
		.digest("base64url");
	return `${value}.${signature}`;
}

export function verifySignedValue(
	secret: string,
	signed: string,
): string | null {
	const index = signed.lastIndexOf(".");
	if (index <= 0) {
		return null;
	}

	const value = signed.slice(0, index);
	const signature = signed.slice(index + 1);
	const expected = createHmac("sha256", secret)
		.update(value)
		.digest("base64url");
	const actualBuffer = Buffer.from(signature);
	const expectedBuffer = Buffer.from(expected);

	if (actualBuffer.length !== expectedBuffer.length) {
		return null;
	}

	return timingSafeEqual(actualBuffer, expectedBuffer) ? value : null;
}

export function slugify(value: string): string {
	const slug = value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return slug || "untitled";
}
