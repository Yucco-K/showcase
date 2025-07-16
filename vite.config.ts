import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	base: "/",
	plugins: [react()],
	server: {
		hmr: {
			// 大規模な更新を防ぐ
			protocol: "ws",
			timeout: 5000,
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
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom", "react-router-dom"],
					three: ["three", "@react-three/fiber", "@react-three/drei"],
				},
			},
		},
	},
});
