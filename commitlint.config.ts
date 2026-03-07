import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"subject-case": [2, "always", "sentence-case"],
		"subject-max-length": [2, "always", 72],
		"body-max-line-length": [2, "always", 100],
	},
};

export default config;
