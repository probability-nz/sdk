import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import rehypeMermaid from "rehype-mermaid";
import starlightThemeFlexoki from "starlight-theme-flexoki";
import starlightTypeDoc from "starlight-typedoc";

export default defineConfig({
	base: "/sdk",
	markdown: {
		syntaxHighlight: { excludeLangs: ["mermaid"] },
		rehypePlugins: [[rehypeMermaid, { strategy: "img-svg" }]],
	},
	redirects: {
		"/react": "/sdk/react/readme",
		"/lib": "/sdk/lib/readme",
		"/types": "/sdk/types/readme",
	},
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
				{ slug: "platform" },
				{
					label: "Reference",
					items: [
						{ label: "React", slug: "react/readme" },
						{ label: "Lib", slug: "lib/readme" },
						{ label: "Types", slug: "types/readme" },
					],
				},
			],
			plugins: [
				starlightThemeFlexoki({ accentColor: "purple" }),
				starlightTypeDoc({
					entryPoints: ["../react/src/index.ts"],
					tsconfig: "./tsconfig.json",
					output: "react",
					sidebar: {
						label: "React",
						collapsed: false,
					},
					typeDoc: {
						name: "React",
						outputFileStrategy: "modules",
						membersWithOwnFile: [],
						mergeReadme: true,
						readme: "../react/README.md",
						groupOrder: ["Core", "Presence", "Advanced"],
					},
				}),
				starlightTypeDoc({
					entryPoints: ["../lib/src/index.ts"],
					tsconfig: "./tsconfig.json",
					output: "lib",
					sidebar: {
						label: "Lib",
						collapsed: false,
					},
					typeDoc: {
						name: "Lib",
						outputFileStrategy: "modules",
						membersWithOwnFile: [],
						mergeReadme: true,
						readme: "../lib/README.md",
						groupOrder: ["Core", "Presence", "Advanced"],
					},
				}),
				starlightTypeDoc({
					entryPoints: ["../types/src/index.ts"],
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
						groupOrder: ["Core", "Presence", "Advanced"],
					},
				}),
			],
		}),
	],
});
