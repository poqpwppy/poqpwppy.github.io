import configuration from "../../content-collections.ts";
import { GetTypeByName } from "@content-collections/core";

export type Writeup = GetTypeByName<typeof configuration, "writeups">;
export declare const allWriteups: Array<Writeup>;

export type Research = GetTypeByName<typeof configuration, "research">;
export declare const allResearch: Array<Research>;

export type Tool = GetTypeByName<typeof configuration, "tools">;
export declare const allTools: Array<Tool>;

export type Certification = GetTypeByName<typeof configuration, "certifications">;
export declare const allCertifications: Array<Certification>;

export type JourneyEntry = GetTypeByName<typeof configuration, "journey">;
export declare const allJourneys: Array<JourneyEntry>;

export type RatingHistory = GetTypeByName<typeof configuration, "ratingHistory">;
export declare const allRatingHistories: Array<RatingHistory>;

export type PlatformStats = GetTypeByName<typeof configuration, "platformStats">;
export declare const allPlatformStats: Array<PlatformStats>;

export {};
