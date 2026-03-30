import { plainTitle } from "@/lib/styled-titles";

export const moreSections = [
	{
		slug: "email",
		label: "email",
		pageTitleSegments: plainTitle("email"),
	},
	{
		slug: "author-photos",
		label: "(author) photos",
		pageTitleSegments: [
			{ text: "(author) ", className: "text-[0.6em] text-lime-300" },
			{ text: "photo" },
			{ text: "(n)", className: "text-red-500" },
			{ text: "s" },
		],
	},
	{
		slug: "photos",
		label: "photos",
		pageTitleSegments: plainTitle("photos"),
	},
	{
		slug: "videos",
		label: "videos",
		pageTitleSegments: plainTitle("videos"),
	},
	{
		slug: "questions",
		label: "questions",
		pageTitleSegments: plainTitle("questions"),
	},
	{
		slug: "chapbooks",
		label: "chapbooks",
		pageTitleSegments: plainTitle("chapbooks"),
	},
	{
		slug: "artist-statements",
		label: "artist statements",
		pageTitleSegments: plainTitle("artist statements"),
	},
	{
		slug: "songs",
		label: "songs",

		pageTitleSegments: plainTitle("songs"),
	},
	{
		slug: "albums",
		label: "albums",
		pageTitleSegments: plainTitle("albums"),
	},
	{
		slug: "miscellaneous",
		label: "miscellaneous",
		pageTitleSegments: plainTitle("miscellaneous"),
	},
	{
		slug: "credits",
		label: "credits",
		pageTitleSegments: [
			{ text: "cr" },
			{ text: "ə", className: "text-orange-500" },
			{ text: "dits" },
		],
	},
] as const;
