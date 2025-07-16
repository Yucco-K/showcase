export interface BlogEntry {
	id: string;
	title: string;
	description: string;
	url: string;
	publishDate: string;
	updateDate?: string;
	tags: string[];
	readTime: number; // 分
	platform: BlogPlatform;
	thumbnail?: string;
	isExternal: boolean;
	author?: string; // 著者名
}

export enum BlogPlatform {
	QIITA = "Qiita",
	ZENN = "Zenn",
	NOTE = "note",
	MEDIUM = "Medium",
	PERSONAL = "Personal Blog",
	HATENA = "はてなブログ",
}

export interface BlogFilter {
	platform?: BlogPlatform;
	tags?: string[];
	searchQuery?: string;
}

export interface BlogCardProps {
	blog: BlogEntry;
	onClick?: (blog: BlogEntry) => void;
}
