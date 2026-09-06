module.exports = {
	arrowParens: "always",
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: "auto",
	endOfLine: "lf",
	htmlWhitespaceSensitivity: "css",
	jsxSingleQuote: true,
	proseWrap: "preserve",
	quoteProps: "as-needed",
	semi: true,
	singleAttributePerLine: false,
	singleQuote: false,
	trailingComma: "all",
	useTabs: true,
	// File type overrides.
	overrides: [
		{
			files: [
				"*.{md,toml,yaml,yml}",
				".{editorconfig,env,env.*,gitattributes,gitignore,npmrc,nvmrc}",
			],
			options: {
				useTabs: false,
			},
		},
	],
};
