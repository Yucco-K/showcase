import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { useBgColor } from "./hooks/useBgColor";
import NavBar from "./components/ui/NavBar";
import Top from "./pages/Top";
import Internship from "./pages/Internship";
import Portfolio from "./pages/Portfolio";
import Payment from "./pages/Payment";

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
				<Route path="/payment" element={<Payment />} />
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
