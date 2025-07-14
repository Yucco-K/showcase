import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import yuccoCat from "../assets/yucco-cat.png";

export default function YuccoCat() {
	const controls = useAnimation();
	const [float, setFloat] = useState({ y: 0, x: 0 });
	const [pos, setPos] = useState({
		left: window.innerWidth - 152,
		top: window.innerHeight - 152,
	});
	const dragging = useRef(false);
	const [jumpPower, setJumpPower] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	// ふわふわアニメーション
	useEffect(() => {
		let frame = 0;
		let raf: number;
		const animate = () => {
			frame += 1;
			setFloat({
				y: Math.sin(frame / 60) * 20,
				x: Math.sin(frame / 90) * 10,
			});
			raf = requestAnimationFrame(animate);
		};
		animate();
		return () => cancelAnimationFrame(raf);
	}, []);

	// たまに回転（ランダム）
	useEffect(() => {
		const interval = setInterval(() => {
			if (Math.random() > 0.7) {
				controls.start({
					rotate: [0, 20, -20, 0],
					transition: { duration: 0.8 },
				});
			}
		}, 4000);
		return () => clearInterval(interval);
	}, [controls]);

	// ドラッグイベント
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!dragging.current) return;
			// ドラッグ中はマウス座標にピタッと一致
			setPos({
				left: e.clientX,
				top: e.clientY,
			});
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

	const handleMouseDown = () => {
		dragging.current = true;
		setIsDragging(true);
		document.body.style.userSelect = "none";
	};

	const handleJump = () => {
		setJumpPower((prev) => prev + 60); // クリックごとにどんどん上昇
	};

	return (
		<>
			<motion.img
				src={yuccoCat}
				alt="Yucco Cat"
				style={{
					position: "fixed",
					right: undefined,
					bottom: undefined,
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
				animate={isDragging ? { y: 0 } : { ...float, y: float.y - jumpPower }}
				transition={{ type: "spring", stiffness: 40, damping: 10 }}
				whileHover={
					isDragging
						? {}
						: {
								y: -40 - jumpPower,
								scale: 1.12,
								rotate: 0,
								transition: { type: "spring", stiffness: 300 },
						  }
				}
				onMouseDown={handleMouseDown}
				onClick={handleJump}
			/>
		</>
	);
}
