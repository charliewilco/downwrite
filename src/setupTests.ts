import { HelmetProvider } from "react-helmet-async";
import "@testing-library/jest-dom";

// @ts-ignore
HelmetProvider.canUseDOM = false;
