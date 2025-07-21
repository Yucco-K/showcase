export interface Review {
	id: string;
	product_id: string;
	user_id: string;
	rating: number | null; // 1-5 (返信の場合はnull)
	comment: string | null;
	parent_id?: string | null; // 返信の場合の親レビューID
	reply_level?: number; // 返信の階層レベル
	created_at: string;
	updated_at: string;
	replies?: Review[]; // 返信の配列
	profiles?: {
		full_name: string | null;
		avatar_url: string | null;
		role?: string | null;
	} | null;
}
