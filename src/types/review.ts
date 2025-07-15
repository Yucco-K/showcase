export interface Review {
	id: string;
	product_id: string;
	user_id: string;
	rating: number; // 1-5
	comment: string | null;
	created_at: string;
	updated_at: string;
}
