import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeFlexoki from "starlight-theme-flexoki";
import starlightTypeDoc from "starlight-typedoc";

export default defineConfig({
	base: "/sdk",
	integrations: [
		starlight({
			title: "Probability SDK",
			description: "SDK for building Probability plugins.",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/probability-nz/sdk",
				},
			],
			customCss: ["./src/styles/custom.css"],
			sidebar: [
				{ slug: "index" },
				{ slug: "plugins" },
				{ slug: "types" },
			],
			plugins: [
				starlightThemeFlexoki({ accentColor: "purple" }),
				starlightTypeDoc({
					entryPoints: ["./api-entry.ts"],
					tsconfig: "./tsconfig.json",
					output: "plugins",
					sidebar: {
						label: "Plugins",
						collapsed: false,
					},
					typeDoc: {
						name: "Plugins",
						outputFileStrategy: "modules",
						membersWithOwnFile: [],
						mergeReadme: true,
						readme: "../plugins/README.md",
						entryFileName: "index",
						groupOrder: ["Core", "Presence", "Advanced"],
					},
				}),
				starlightTypeDoc({
					entryPoints: ["./types-entry.ts"],
					tsconfig: "./tsconfig.json",
					output: "types",
					sidebar: {
						label: "Types",
						collapsed: false,
					},
					typeDoc: {
						name: "Types",
						outputFileStrategy: "modules",
						membersWithOwnFile: [],
						entryFileName: "index",
						groupOrder: ["Core", "Presence", "Advanced"],
					},
				}),
			],
		}),
	],
});
