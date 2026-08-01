import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import yuccoCat from "../assets/yucco-cat.png";

export default function YuccoCat() {
	const location = useLocation();
	const [pos, setPos] = useState({
		left: window.innerWidth - 152,
		top: window.innerHeight - 152,
	});
	const dragging = useRef(false);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!dragging.current) return;
			setPos({ left: e.clientX, top: e.clientY });
		};
		const handleMouseUp = () => {
			dragging.current = false;
			setIsDragging(false);
			document.body.style.userSelect = "";
		};
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, []);

	return (
		<motion.img
			key={location.pathname}
			src={yuccoCat}
			alt="Yucco Cat"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={
				isDragging
					? { opacity: 1, scale: 1.05, y: 0, x: 0 }
					: {
							opacity: 1,
							scale: 1,
							y: [0, -18, -22, -18, 0],
							x: [0, 7, 0, -7, 0],
					  }
			}
			transition={
				isDragging
					? { duration: 0.1 }
					: {
							opacity: { duration: 0.6 },
							scale: { duration: 0.6 },
							y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
							x: { repeat: Infinity, duration: 6, ease: "easeInOut" },
					  }
			}
			style={{
				position: "fixed",
				left: pos.left,
				top: pos.top,
				width: 120,
				height: 120,
				zIndex: 10,
				borderRadius: "50%",
				boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
				background: "rgba(255,255,255,0.05)",
				cursor: isDragging ? "grabbing" : "grab",
				userSelect: "none",
			}}
			whileHover={
				isDragging
					? {}
					: { scale: 1.12, transition: { type: "spring", stiffness: 300 } }
			}
			whileTap={!isDragging ? { scale: 0.85, y: -50 } : {}}
			onMouseDown={() => {
				dragging.current = true;
				setIsDragging(true);
				document.body.style.userSelect = "none";
			}}
		/>
	);
}
