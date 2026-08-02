import { VT323, Source_Serif_4 } from "next/font/google";

/**
 * Minecraft Pixel face — VT323 is the retro pixel font supporting Vietnamese.
 * Used universally across the entire application for all UI, headings, body, and HUD elements.
 */
export const fontPixel = VT323({
  variable: "--font-pixel",
  subsets: ["latin", "vietnamese"],
  weight: "400",
  display: "swap",
});

export const fontSans = VT323({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: "400",
  display: "swap",
});

export const fontSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
