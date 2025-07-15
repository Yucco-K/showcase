export interface Product {
	id: string;
	name: string;
	description: string;
	longDescription: string;
	price: number;
	originalPrice?: number; // セール価格用
	category: ProductCategory;
	imageUrl: string;
	screenshots: string[];
	features: string[];
	requirements: string[];
	version: string;
	lastUpdated: string;
	rating: number;
	reviewCount: number;
	likes?: number;
	tags: string[];
	isPopular?: boolean;
	isFeatured?: boolean;
}

export enum ProductCategory {
	PRODUCTIVITY = "productivity",
	DESIGN = "design",
	DEVELOPMENT = "development",
	BUSINESS = "business",
	ENTERTAINMENT = "entertainment",
	EDUCATION = "education",
	HEALTH = "health",
}

export interface ProductFilter {
	category?: ProductCategory;
	minPrice?: number;
	maxPrice?: number;
	searchQuery?: string;
	sortBy?: "name" | "price" | "rating" | "popular";
	sortOrder?: "asc" | "desc";
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface ProductPurchase {
	productId: string;
	userId?: string;
	purchaseDate: string;
	price: number;
	paymentId: string;
}
