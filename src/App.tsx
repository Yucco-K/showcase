import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { useBgColor } from "./hooks/useBgColor";
import NavBar from "./components/ui/NavBar";
import Top from "./pages/Top";
import Internship from "./pages/Internship";
import Portfolio from "./pages/Portfolio";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import BlogList from "./pages/BlogList";
import BlogAdmin from "./pages/BlogAdmin";
import ProductAdmin from "./pages/ProductAdmin";
import { ContactAdmin } from "./pages/ContactAdmin";
import ContactDetail from "./pages/ContactDetail";
import { ContactForm } from "./components/contact/ContactForm";
import { MyPage } from "./pages/MyPage";
import ResetPassword from "./pages/ResetPassword";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'system-ui', 'Avenir', 'Helvetica', 'Arial', sans-serif;
    background: ${({ bg }: { bg: string }) => bg};
    color: #fff;
    min-height: 100vh;
    transition: background 0.6s;
  }
`;

function AppRoutes() {
	const bg = useBgColor();

	return (
		<>
			<GlobalStyle bg={bg} />
			<NavBar />
			<Routes>
				<Route path="/" element={<Top />} />
				<Route path="/internship" element={<Internship />} />
				<Route path="/portfolio" element={<Portfolio />} />
				<Route path="/products" element={<ProductList />} />
				<Route path="/products/:id" element={<ProductDetail />} />
				<Route path="/blog" element={<BlogList />} />
				<Route
					path="/blog-admin"
					element={
						<AdminProtectedRoute>
							<BlogAdmin />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path="/product-admin"
					element={
						<AdminProtectedRoute>
							<ProductAdmin />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path="/contact-admin"
					element={
						<AdminProtectedRoute>
							<ContactAdmin />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path="/contact-detail/:id"
					element={
						<AdminProtectedRoute>
							<ContactDetail />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path="/contact"
					element={
						<ProtectedRoute>
							<ContactForm />
						</ProtectedRoute>
					}
				/>
				<Route path="/mypage" element={<MyPage />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	);
}

function App() {
	return (
		<Router>
			<AppRoutes />
		</Router>
	);
}

export default App;
