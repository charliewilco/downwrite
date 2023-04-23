import { useMemo } from "react";
import UAParser from "ua-parser-js";

export const useWarningForMobile = () => {
	return useMemo(() => {
		const parser = new UAParser();
		const browser = parser.getBrowser();
		const device = parser.getDevice();
		const isMobile = device.type === "mobile" || device.type === "tablet";
		const isWebKit = browser.name === "Safari" || browser.name === "Mobile Safari";

		return isMobile && isWebKit;
	}, []);
};
