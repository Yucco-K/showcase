import type { Product, ProductFilter } from "../types/product";
import type { BlogEntry, BlogFilter } from "../types/blog";

export function filterProducts(
	products: Product[],
	filter: ProductFilter
): Product[] {
	let result = products;
	if (filter.category) {
		result = result.filter((product) => product.category === filter.category);
	}
	if (filter.minPrice !== undefined) {
		result = result.filter((product) => product.price >= filter.minPrice!);
	}
	if (filter.maxPrice !== undefined) {
		result = result.filter((product) => product.price <= filter.maxPrice!);
	}
	if (filter.minRating !== undefined) {
		result = result.filter(
			(product) => (product.rating ?? 0) >= filter.minRating!
		);
	}
	if (filter.searchQuery) {
		const searchTerm = filter.searchQuery.toLowerCase();
		result = result.filter(
			(product) =>
				product.name.toLowerCase().includes(searchTerm) ||
				product.description.toLowerCase().includes(searchTerm) ||
				product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
		);
	}
	return result;
}

export function filterBlogs(
	blogs: BlogEntry[],
	filter: BlogFilter
): BlogEntry[] {
	let filtered = [...blogs];
	if (filter.platform) {
		filtered = filtered.filter((blog) => blog.platform === filter.platform);
	}
	if (filter.tags && filter.tags.length > 0) {
		filtered = filtered.filter((blog) =>
			filter.tags!.some((tag) => blog.tags.includes(tag))
		);
	}
	if (filter.searchQuery && filter.searchQuery.trim()) {
		const query = filter.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(blog) =>
				blog.title.toLowerCase().includes(query) ||
				blog.description.toLowerCase().includes(query) ||
				blog.tags.some((tag) => tag.toLowerCase().includes(query))
		);
	}
	return filtered;
}
