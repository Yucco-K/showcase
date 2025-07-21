import { StrictMode } from "react";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthProvider";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<MantineProvider defaultColorScheme="auto">
			<AuthProvider>
				<App />
			</AuthProvider>
		</MantineProvider>
	</StrictMode>
);
