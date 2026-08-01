import {
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ORB_SIZE = 80;

const SPARKLES = [
	{ id: 0, angle: 0,   radius: 58, size: 5, duration: 3.2, color: "#c084fc" },
	{ id: 1, angle: 60,  radius: 52, size: 3, duration: 4.1, color: "#60a5fa" },
	{ id: 2, angle: 120, radius: 62, size: 4, duration: 3.7, color: "#34d399" },
	{ id: 3, angle: 180, radius: 50, size: 3, duration: 4.5, color: "#f472b6" },
	{ id: 4, angle: 240, radius: 60, size: 5, duration: 3.0, color: "#fbbf24" },
	{ id: 5, angle: 300, radius: 54, size: 3, duration: 4.8, color: "#818cf8" },
];

export default function MagicOrb() {
	const location = useLocation();
	const [pos, setPos] = useState({
		left: window.innerWidth - 160,
		top: window.innerHeight - 160,
	});
	const posRef = useRef(pos);
	const dragging = useRef(false);
	const [isDragging, setIsDragging] = useState(false);

	// マウス反応 3D チルト
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const rotateX = useSpring(useTransform(mouseY, [-300, 300], [18, -18]), {
		stiffness: 80,
		damping: 18,
	});
	const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-18, 18]), {
		stiffness: 80,
		damping: 18,
	});

	useEffect(() => {
		posRef.current = pos;
	}, [pos]);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (dragging.current) {
				setPos({ left: e.clientX - ORB_SIZE / 2, top: e.clientY - ORB_SIZE / 2 });
			} else {
				const cx = posRef.current.left + ORB_SIZE / 2;
				const cy = posRef.current.top + ORB_SIZE / 2;
				mouseX.set(e.clientX - cx);
				mouseY.set(e.clientY - cy);
			}
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
	}, [mouseX, mouseY]);

	return (
		<motion.div
			key={location.pathname}
			initial={{ opacity: 0, scale: 0, rotate: -180 }}
			animate={{ opacity: 1, scale: 1, rotate: 0 }}
			transition={{ duration: 0.7, type: "spring", stiffness: 180, damping: 16 }}
			style={{
				position: "fixed",
				left: pos.left,
				top: pos.top,
				width: ORB_SIZE,
				height: ORB_SIZE,
				zIndex: 10,
				cursor: isDragging ? "grabbing" : "grab",
				perspective: 500,
				userSelect: "none",
			}}
			onMouseDown={() => {
				dragging.current = true;
				setIsDragging(true);
				document.body.style.userSelect = "none";
			}}
		>
			{/* 3D チルトコンテナ */}
			<motion.div
				style={{
					width: "100%",
					height: "100%",
					rotateX,
					rotateY,
					transformStyle: "preserve-3d",
					position: "relative",
				}}
			>
				{/* 外側グロー（脈動） */}
				<motion.div
					animate={{
						scale: [1, 1.35, 1],
						opacity: [0.25, 0.5, 0.25],
					}}
					transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
					style={{
						position: "absolute",
						inset: -22,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(139,92,246,0.55) 0%, transparent 70%)",
						pointerEvents: "none",
					}}
				/>

				{/* 外側オービットリング（正回転） */}
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
					style={{
						position: "absolute",
						inset: -18,
						borderRadius: "50%",
						border: "1.5px solid rgba(196,132,252,0.45)",
						boxShadow: "0 0 6px rgba(196,132,252,0.2)",
					}}
				>
					{/* リング上の光点 */}
					<div
						style={{
							position: "absolute",
							top: -4,
							left: "50%",
							marginLeft: -4,
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: "#c084fc",
							boxShadow: "0 0 10px #c084fc, 0 0 20px #c084fc",
						}}
					/>
				</motion.div>

				{/* 内側オービットリング（逆回転、破線） */}
				<motion.div
					animate={{ rotate: -360 }}
					transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
					style={{
						position: "absolute",
						inset: -6,
						borderRadius: "50%",
						border: "1px dashed rgba(96,165,250,0.5)",
					}}
				>
					<div
						style={{
							position: "absolute",
							top: -3,
							left: "50%",
							marginLeft: -3,
							width: 6,
							height: 6,
							borderRadius: "50%",
							background: "#60a5fa",
							boxShadow: "0 0 8px #60a5fa, 0 0 14px #60a5fa",
						}}
					/>
				</motion.div>

				{/* メイン宝珠 */}
				<motion.div
					animate={{
						boxShadow: [
							"0 0 18px rgba(139,92,246,0.7), 0 0 36px rgba(139,92,246,0.35), inset 0 0 16px rgba(255,255,255,0.08)",
							"0 0 28px rgba(139,92,246,0.9), 0 0 56px rgba(139,92,246,0.5), inset 0 0 22px rgba(255,255,255,0.14)",
							"0 0 18px rgba(139,92,246,0.7), 0 0 36px rgba(139,92,246,0.35), inset 0 0 16px rgba(255,255,255,0.08)",
						],
					}}
					transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
					whileHover={{ scale: 1.12 }}
					whileTap={{ scale: 0.88 }}
					style={{
						width: "100%",
						height: "100%",
						borderRadius: "50%",
						background:
							"radial-gradient(circle at 33% 30%, rgba(255,255,255,0.45) 0%, rgba(196,132,252,0.85) 22%, rgba(99,102,241,0.95) 55%, rgba(30,5,80,1) 100%)",
						position: "relative",
						overflow: "hidden",
					}}
				>
					{/* 一次スペキュラーハイライト */}
					<div
						style={{
							position: "absolute",
							top: "10%",
							left: "18%",
							width: "38%",
							height: "26%",
							borderRadius: "50%",
							background:
								"radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.1) 100%)",
							transform: "rotate(-25deg)",
							filter: "blur(1px)",
						}}
					/>
					{/* 二次スペキュラーハイライト */}
					<div
						style={{
							position: "absolute",
							bottom: "16%",
							right: "14%",
							width: "22%",
							height: "14%",
							borderRadius: "50%",
							background:
								"radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 100%)",
							filter: "blur(1px)",
						}}
					/>
					{/* 内部カラーシフト（虹彩効果） */}
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
						style={{
							position: "absolute",
							inset: 0,
							borderRadius: "50%",
							background:
								"conic-gradient(from 0deg, rgba(96,165,250,0.12), rgba(196,132,252,0.12), rgba(244,114,182,0.12), rgba(52,211,153,0.12), rgba(96,165,250,0.12))",
						}}
					/>
				</motion.div>

				{/* フローティングスパークル */}
				{SPARKLES.map((s) => (
					<motion.div
						key={s.id}
						animate={{
							x: [
								Math.cos((s.angle * Math.PI) / 180) * s.radius,
								Math.cos(((s.angle + 180) * Math.PI) / 180) * s.radius,
								Math.cos((s.angle * Math.PI) / 180) * s.radius,
							],
							y: [
								Math.sin((s.angle * Math.PI) / 180) * s.radius,
								Math.sin(((s.angle + 180) * Math.PI) / 180) * s.radius,
								Math.sin((s.angle * Math.PI) / 180) * s.radius,
							],
							opacity: [0.9, 0.3, 0.9],
							scale: [1, 0.4, 1],
						}}
						transition={{
							repeat: Infinity,
							duration: s.duration,
							ease: "easeInOut",
							delay: s.id * 0.25,
						}}
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							width: s.size,
							height: s.size,
							marginLeft: -s.size / 2,
							marginTop: -s.size / 2,
							borderRadius: "50%",
							background: s.color,
							boxShadow: `0 0 ${s.size * 2}px ${s.color}, 0 0 ${s.size * 4}px ${s.color}`,
							pointerEvents: "none",
						}}
					/>
				))}
			</motion.div>
		</motion.div>
	);
}
