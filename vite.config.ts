import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [react()],
	server: {
		port: 5173,
		host: true,
		hmr: {
			// 大規模な更新を防ぐ
			protocol: "ws",
			timeout: 5000,
		},
		proxy: {
			"/api": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
			},
		},
	},
	optimizeDeps: {
		// 頻繁に使用されるパッケージを事前にバンドル
		include: [
			"react",
			"react-dom",
			"react-router-dom",
			"@supabase/supabase-js",
			"@stripe/stripe-js",
		],
	},
	build: {
		// チャンクサイズの最適化
		chunkSizeWarningLimit: 1000, // 1MBに調整
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
					three: ["three", "@react-three/fiber", "@react-three/drei"],
					supabase: ["@supabase/supabase-js"],
					stripe: ["@stripe/stripe-js"],
				},
			},
		},
	},
});
