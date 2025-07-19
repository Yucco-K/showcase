# Portfolio Showcase - API Specification

## Version 2.0

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Base URL:** `https://your-domain.vercel.app`  
**API Version:** v1

---

## Overview

This document provides comprehensive API specifications for the Portfolio Showcase Version 2.0 platform. The API is built on Supabase and provides RESTful endpoints for all platform functionality.

### Authentication

All API requests require authentication using JWT tokens obtained through Supabase Auth.

```http
Authorization: Bearer <jwt_token>
```

### Base Headers

```http
Content-Type: application/json
Accept: application/json
```

---

## Authentication Endpoints

### User Registration

**POST** `/auth/v1/signup`

Register a new user account.

#### Request Body

```json
{
	"email": "user@example.com",
	"password": "your_password_here"
}
```

#### Response

```json
{
	"user": {
		"id": "uuid",
		"email": "user@example.com",
		"created_at": "2025-01-15T10:30:00Z"
	},
	"session": {
		"access_token": "your_jwt_token_here",
		"refresh_token": "your_refresh_token_here",
		"expires_at": 1642234567
	}
}
```

### User Login

**POST** `/auth/v1/token?grant_type=password`

Authenticate user and obtain access token.

#### Request Body

```json
{
	"email": "user@example.com",
	"password": "your_password_here"
}
```

#### Response

```json
{
	"access_token": "your_jwt_token_here",
	"refresh_token": "your_refresh_token_here",
	"expires_at": 1642234567,
	"user": {
		"id": "uuid",
		"email": "user@example.com"
	}
}
```

### User Logout

**POST** `/auth/v1/logout`

Invalidate current session.

#### Request Headers

```http
Authorization: Bearer <your_jwt_token_here>
```

#### Response

```json
{
	"message": "Logged out successfully"
}
```

---

## User Management

### Get Current User

**GET** `/rest/v1/profiles?select=*&id=eq.{user_id}`

Retrieve current user profile information.

#### Response

```json
[
	{
		"id": "uuid",
		"email": "user@example.com",
		"full_name": "John Doe",
		"avatar_url": "https://example.com/avatar.jpg",
		"biography": "Software developer with 5 years experience",
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z"
	}
]
```

### Update User Profile

**PATCH** `/rest/v1/profiles?id=eq.{user_id}`

Update user profile information.

#### Request Body

```json
{
	"full_name": "John Doe",
	"biography": "Updated biography"
}
```

#### Response

```json
{
	"id": "uuid",
	"full_name": "John Doe",
	"biography": "Updated biography",
	"updated_at": "2025-01-15T11:00:00Z"
}
```

---

## Product Management

### Get All Products

**GET** `/rest/v1/products?select=*&is_active=eq.true&order=created_at.desc`

Retrieve all active products.

#### Response

```json
[
	{
		"id": "uuid",
		"name": "Premium Template",
		"description": "Professional website template",
		"price": 29.99,
		"image_url": "https://example.com/template.jpg",
		"category": "templates",
		"is_active": true,
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z"
	}
]
```

### Get Product by ID

**GET** `/rest/v1/products?select=*&id=eq.{product_id}`

Retrieve specific product details.

#### Response

```json
[
	{
		"id": "uuid",
		"name": "Premium Template",
		"description": "Professional website template with advanced features",
		"price": 29.99,
		"image_url": "https://example.com/template.jpg",
		"category": "templates",
		"is_active": true,
		"extra_info": {
			"features": ["Responsive Design", "SEO Optimized"],
			"download_url": "https://example.com/download"
		},
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z"
	}
]
```

### Create Product (Admin Only)

**POST** `/rest/v1/products`

Create a new product.

#### Request Body

```json
{
	"name": "New Product",
	"description": "Product description",
	"price": 19.99,
	"category": "software",
	"is_active": true
}
```

#### Response

```json
{
	"id": "uuid",
	"name": "New Product",
	"description": "Product description",
	"price": 19.99,
	"category": "software",
	"is_active": true,
	"created_at": "2025-01-15T10:30:00Z"
}
```

### Update Product (Admin Only)

**PATCH** `/rest/v1/products?id=eq.{product_id}`

Update product information.

#### Request Body

```json
{
	"name": "Updated Product Name",
	"price": 24.99
}
```

### Delete Product (Admin Only)

**DELETE** `/rest/v1/products?id=eq.{product_id}`

Delete a product.

---

## Purchase Management

### Create Purchase

**POST** `/rest/v1/product_purchases`

Create a new purchase record.

#### Request Body

```json
{
	"user_id": "uuid",
	"product_id": "uuid",
	"stripe_payment_intent_id": "pi_1234567890",
	"amount": 29.99,
	"status": "completed"
}
```

#### Response

```json
{
	"id": "uuid",
	"user_id": "uuid",
	"product_id": "uuid",
	"stripe_payment_intent_id": "pi_1234567890",
	"amount": 29.99,
	"status": "completed",
	"created_at": "2025-01-15T10:30:00Z"
}
```

### Get User Purchases

**GET** `/rest/v1/product_purchases?select=*,products(*)&user_id=eq.{user_id}&order=created_at.desc`

Retrieve user's purchase history.

#### Response

```json
[
	{
		"id": "uuid",
		"user_id": "uuid",
		"product_id": "uuid",
		"amount": 29.99,
		"status": "completed",
		"created_at": "2025-01-15T10:30:00Z",
		"products": {
			"id": "uuid",
			"name": "Premium Template",
			"description": "Professional website template"
		}
	}
]
```

---

## Blog Management

### Get All Published Blogs

**GET** `/rest/v1/blogs?select=*,profiles(full_name)&is_published=eq.true&order=created_at.desc`

Retrieve all published blog posts.

#### Response

```json
[
	{
		"id": "uuid",
		"title": "Getting Started with React",
		"content": "React is a powerful JavaScript library...",
		"author_id": "uuid",
		"is_published": true,
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:30:00Z",
		"profiles": {
			"full_name": "John Doe"
		}
	}
]
```

### Get Blog by ID

**GET** `/rest/v1/blogs?select=*,profiles(full_name)&id=eq.{blog_id}`

Retrieve specific blog post.

### Create Blog (Admin Only)

**POST** `/rest/v1/blogs`

Create a new blog post.

#### Request Body

```json
{
	"title": "New Blog Post",
	"content": "Blog content in markdown format",
	"author_id": "uuid",
	"is_published": true
}
```

---

## Contact Management

### Submit Contact Form

**POST** `/rest/v1/contacts`

Submit a new contact inquiry.

#### Request Body

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"message": "I have a question about your products"
}
```

#### Response

```json
{
	"id": "uuid",
	"name": "John Doe",
	"email": "john@example.com",
	"message": "I have a question about your products",
	"status": "new",
	"is_replied": false,
	"created_at": "2025-01-15T10:30:00Z"
}
```

### Get All Contacts (Admin Only)

**GET** `/rest/v1/contacts?select=*&order=created_at.desc`

Retrieve all contact inquiries.

### Update Contact Status (Admin Only)

**PATCH** `/rest/v1/contacts?id=eq.{contact_id}`

Update contact inquiry status.

#### Request Body

```json
{
	"status": "in_progress",
	"is_replied": true
}
```

---

## Payment Integration

### Create Payment Intent

**POST** `/api/create-payment-intent`

Create a Stripe payment intent for product purchase.

#### Request Body

```json
{
	"productId": "uuid",
	"amount": 2999
}
```

#### Response

```json
{
	"clientSecret": "pi_your_payment_intent_secret_here",
	"paymentIntentId": "pi_your_payment_intent_id_here"
}
```

### Stripe Webhook

**POST** `/api/webhooks/stripe`

Handle Stripe webhook events.

#### Request Headers

```http
Stripe-Signature: t=1234567890,v1=abc123...
```

#### Request Body

```json
{
	"type": "payment_intent.succeeded",
	"data": {
		"object": {
			"id": "pi_your_payment_intent_id_here",
			"amount": 2999,
			"status": "succeeded"
		}
	}
}
```

---

## Notion Integration

### Get Notion Pages

**GET** `/api/notion/pages`

Retrieve pages from Notion database.

#### Query Parameters

- `databaseId` (optional): Specific database ID

#### Response

```json
[
	{
		"id": "page_id",
		"title": "Page Title",
		"url": "https://notion.so/page",
		"properties": {},
		"last_edited_time": "2025-01-15T10:30:00Z"
	}
]
```

### Get Notion Page

**GET** `/api/notion/pages/{pageId}`

Retrieve specific Notion page.

### Get Notion Page Blocks

**GET** `/api/notion/blocks/{pageId}`

Retrieve blocks from specific Notion page.

---

## Real-time Subscriptions

### Product Updates

Subscribe to real-time product updates.

```javascript
const subscription = supabase
	.channel("products")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "products" },
		(payload) => {
			console.log("Product updated:", payload);
		}
	)
	.subscribe();
```

### Purchase Updates

Subscribe to real-time purchase updates.

```javascript
const subscription = supabase
	.channel("purchases")
	.on(
		"postgres_changes",
		{ event: "*", schema: "public", table: "product_purchases" },
		(payload) => {
			console.log("Purchase updated:", payload);
		}
	)
	.subscribe();
```

---

## Error Handling

### Standard Error Response

```json
{
	"error": {
		"code": "ERROR_CODE",
		"message": "Human readable error message",
		"details": "Additional error details"
	}
}
```

### Common Error Codes

| Code                       | Description                     |
| -------------------------- | ------------------------------- |
| `AUTH_REQUIRED`            | Authentication required         |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR`         | Request validation failed       |
| `NOT_FOUND`                | Resource not found              |
| `INTERNAL_ERROR`           | Internal server error           |

### Rate Limiting

- **Rate Limit:** 100 requests per minute per user
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Response Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	"https://your-project.supabase.co",
	"your-anon-key"
);

// Get products
const { data: products, error } = await supabase
	.from("products")
	.select("*")
	.eq("is_active", true);

// Create purchase
const { data: purchase, error } = await supabase
	.from("product_purchases")
	.insert({
		user_id: user.id,
		product_id: productId,
		amount: 29.99,
		status: "completed",
	});
```

### cURL Examples

```bash
# Get products
curl -X GET "https://your-project.supabase.co/rest/v1/products?select=*&is_active=eq.true" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your_jwt_token_here"

# Create product (admin only)
curl -X POST "https://your-project.supabase.co/rest/v1/products" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 19.99,
    "category": "software"
  }'
```

---

## Versioning

API versioning is handled through URL paths. Current version is v1.

- **Current Version:** v1
- **Deprecation Policy:** 6 months notice for breaking changes
- **Backward Compatibility:** Maintained for 12 months

---

## Support

For API support and questions:

- **Documentation:** [API Documentation](https://your-domain.com/docs/api)
- **Support Email:** api-support@your-domain.com
- **Status Page:** [API Status](https://status.your-domain.com)
- **Rate Limits:** [Rate Limit Guide](https://your-domain.com/docs/rate-limits)
