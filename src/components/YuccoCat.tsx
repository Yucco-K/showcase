import {
	animate,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ORB_SIZE = 80;
const FRICTION = 0.99;
const RESTITUTION = 0.8;
const MIN_SPEED = 0.1;
const COMBO_RESET_MS = 1500;

const SPARKLES = [
	{ id: 0, angle: 0,   radius: 58, size: 5, duration: 3.2, color: "#c084fc" },
	{ id: 1, angle: 60,  radius: 52, size: 3, duration: 4.1, color: "#60a5fa" },
	{ id: 2, angle: 120, radius: 62, size: 4, duration: 3.7, color: "#34d399" },
	{ id: 3, angle: 180, radius: 50, size: 3, duration: 4.5, color: "#f472b6" },
	{ id: 4, angle: 240, radius: 60, size: 5, duration: 3.0, color: "#fbbf24" },
	{ id: 5, angle: 300, radius: 54, size: 3, duration: 4.8, color: "#818cf8" },
];

const BURST_COLORS = [
	"#c084fc",
	"#60a5fa",
	"#34d399",
	"#f472b6",
	"#fbbf24",
	"#818cf8",
];

type Burst = { id: number; x: number; y: number; big: boolean };
type Popup = { id: number; combo: number };

// 衝突・クリック時のパーティクル爆発
function ParticleBurst({ x, y, big }: { x: number; y: number; big: boolean }) {
	const particles = useMemo(() => {
		const count = big ? 16 : 9;
		return Array.from({ length: count }, (_, i) => {
			const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
			const dist = (big ? 85 : 46) + Math.random() * 30;
			return {
				id: i,
				dx: Math.cos(angle) * dist,
				dy: Math.sin(angle) * dist,
				size: 4 + Math.random() * (big ? 6 : 4),
				color: BURST_COLORS[i % BURST_COLORS.length],
			};
		});
	}, [big]);

	return (
		<div
			style={{
				position: "fixed",
				left: x,
				top: y,
				zIndex: 9,
				pointerEvents: "none",
			}}
		>
			{particles.map((p) => (
				<motion.div
					key={p.id}
					initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
					animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.2 }}
					transition={{ duration: big ? 0.8 : 0.55, ease: "easeOut" }}
					style={{
						position: "absolute",
						width: p.size,
						height: p.size,
						marginLeft: -p.size / 2,
						marginTop: -p.size / 2,
						borderRadius: "50%",
						background: p.color,
						boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
					}}
				/>
			))}
		</div>
	);
}

export default function MagicOrb() {
	const location = useLocation();

	// 位置は MotionValue で管理（物理演算中も React 再レンダリングなし）
	const x = useMotionValue(window.innerWidth - 160);
	const y = useMotionValue(window.innerHeight - 160);
	const scaleX = useMotionValue(1);
	const scaleY = useMotionValue(1);

	const dragging = useRef(false);
	const dragMoved = useRef(0);
	const samples = useRef<{ x: number; y: number; t: number }[]>([]);
	const vel = useRef({ x: 0, y: 0 });
	const rafRef = useRef(0);
	const idCounter = useRef(0);
	const comboTimer = useRef<number | undefined>(undefined);

	const [isDragging, setIsDragging] = useState(false);
	const [bursts, setBursts] = useState<Burst[]>([]);
	const [popups, setPopups] = useState<Popup[]>([]);
	const [combo, setCombo] = useState(0);

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

	const spawnBurst = (bx: number, by: number, big: boolean) => {
		const id = ++idCounter.current;
		setBursts((prev) => [...prev, { id, x: bx, y: by, big }]);
		window.setTimeout(() => {
			setBursts((prev) => prev.filter((b) => b.id !== id));
		}, 900);
	};

	// 壁衝突時のスカッシュ＆ストレッチ
	const squash = (axis: "x" | "y") => {
		const main = axis === "x" ? scaleX : scaleY;
		const cross = axis === "x" ? scaleY : scaleX;
		main.set(0.65);
		cross.set(1.28);
		animate(main, 1, { type: "spring", stiffness: 320, damping: 12 });
		animate(cross, 1, { type: "spring", stiffness: 320, damping: 12 });
	};

	// 投げた後の慣性 + 壁バウンド物理ループ
	const startPhysics = () => {
		cancelAnimationFrame(rafRef.current);
		const step = () => {
			vel.current.x *= FRICTION;
			vel.current.y *= FRICTION;
			let nx = x.get() + vel.current.x;
			let ny = y.get() + vel.current.y;
			const maxX = window.innerWidth - ORB_SIZE;
			const maxY = window.innerHeight - ORB_SIZE;
			const speed = Math.hypot(vel.current.x, vel.current.y);
			let bounced = false;

			if (nx < 0) {
				nx = 0;
				vel.current.x = -vel.current.x * RESTITUTION;
				bounced = true;
				squash("x");
			} else if (nx > maxX) {
				nx = maxX;
				vel.current.x = -vel.current.x * RESTITUTION;
				bounced = true;
				squash("x");
			}
			if (ny < 0) {
				ny = 0;
				vel.current.y = -vel.current.y * RESTITUTION;
				bounced = true;
				squash("y");
			} else if (ny > maxY) {
				ny = maxY;
				vel.current.y = -vel.current.y * RESTITUTION;
				bounced = true;
				squash("y");
			}

			if (bounced && speed > 5) {
				spawnBurst(nx + ORB_SIZE / 2, ny + ORB_SIZE / 2, false);
			}

			x.set(nx);
			y.set(ny);

			if (Math.hypot(vel.current.x, vel.current.y) > MIN_SPEED) {
				rafRef.current = requestAnimationFrame(step);
			}
		};
		rafRef.current = requestAnimationFrame(step);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: MotionValue と ref は安定参照。リスナーはマウント時に一度だけ登録する
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (dragging.current) {
				const prev = samples.current[samples.current.length - 1];
				if (prev) {
					dragMoved.current += Math.hypot(
						e.clientX - ORB_SIZE / 2 - prev.x,
						e.clientY - ORB_SIZE / 2 - prev.y
					);
				}
				x.set(e.clientX - ORB_SIZE / 2);
				y.set(e.clientY - ORB_SIZE / 2);
				samples.current.push({
					x: e.clientX - ORB_SIZE / 2,
					y: e.clientY - ORB_SIZE / 2,
					t: performance.now(),
				});
				if (samples.current.length > 5) samples.current.shift();
			} else {
				const cx = x.get() + ORB_SIZE / 2;
				const cy = y.get() + ORB_SIZE / 2;
				mouseX.set(e.clientX - cx);
				mouseY.set(e.clientY - cy);
			}
		};

		const handleMouseUp = () => {
			if (!dragging.current) return;
			dragging.current = false;
			setIsDragging(false);
			document.body.style.userSelect = "";

			if (dragMoved.current < 5) {
				// クリック（ほぼ動いていない）→ コンボ加算
				setCombo((prev) => {
					const next = prev + 1;
					const id = ++idCounter.current;
					setPopups((p) => [...p, { id, combo: next }]);
					window.setTimeout(() => {
						setPopups((p) => p.filter((pop) => pop.id !== id));
					}, 900);
					spawnBurst(
						x.get() + ORB_SIZE / 2,
						y.get() + ORB_SIZE / 2,
						next % 5 === 0
					);
					return next;
				});
				// クリックの弾み
				scaleX.set(0.8);
				scaleY.set(0.8);
				animate(scaleX, 1, { type: "spring", stiffness: 400, damping: 10 });
				animate(scaleY, 1, { type: "spring", stiffness: 400, damping: 10 });

				window.clearTimeout(comboTimer.current);
				comboTimer.current = window.setTimeout(
					() => setCombo(0),
					COMBO_RESET_MS
				);
			} else {
				// スワイプ速度から初速を計算して投げる
				const pts = samples.current;
				if (pts.length >= 2) {
					const last = pts[pts.length - 1];
					const first = pts[0];
					const dt = Math.max(last.t - first.t, 1);
					// px/ms → px/frame(16.7ms) に換算
					vel.current.x = ((last.x - first.x) / dt) * 16.7;
					vel.current.y = ((last.y - first.y) / dt) * 16.7;
					startPhysics();
				}
			}
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			cancelAnimationFrame(rafRef.current);
			window.clearTimeout(comboTimer.current);
		};
	}, []);

	return (
		<>
			<motion.div
				key={location.pathname}
				initial={{ opacity: 0, scale: 0, rotate: -180 }}
				animate={{ opacity: 1, scale: 1, rotate: 0 }}
				transition={{
					duration: 0.7,
					type: "spring",
					stiffness: 180,
					damping: 16,
				}}
				style={{
					position: "fixed",
					left: 0,
					top: 0,
					x,
					y,
					width: ORB_SIZE,
					height: ORB_SIZE,
					zIndex: 10,
					cursor: isDragging ? "grabbing" : "grab",
					perspective: 500,
					userSelect: "none",
				}}
				onMouseDown={(e) => {
					e.preventDefault();
					cancelAnimationFrame(rafRef.current);
					vel.current = { x: 0, y: 0 };
					dragging.current = true;
					dragMoved.current = 0;
					samples.current = [
						{
							x: x.get(),
							y: y.get(),
							t: performance.now(),
						},
					];
					setIsDragging(true);
					document.body.style.userSelect = "none";
				}}
			>
				{/* コンボ表示ポップアップ */}
				{popups.map((p) => (
					<motion.div
						key={p.id}
						initial={{ opacity: 0, y: 0, scale: 0.6 }}
						animate={{ opacity: [0, 1, 1, 0], y: -64, scale: 1.1 }}
						transition={{ duration: 0.85, ease: "easeOut" }}
						style={{
							position: "absolute",
							top: -14,
							left: "50%",
							transform: "translateX(-50%)",
							fontWeight: 800,
							fontSize: p.combo % 5 === 0 ? 26 : 19,
							color: p.combo % 5 === 0 ? "#fbbf24" : "#fff",
							textShadow:
								"0 0 8px rgba(139,92,246,0.9), 0 0 16px rgba(139,92,246,0.6)",
							whiteSpace: "nowrap",
							pointerEvents: "none",
						}}
					>
						×{p.combo}
					</motion.div>
				))}

				{/* スカッシュ＆ストレッチ層 */}
				<motion.div
					style={{
						width: "100%",
						height: "100%",
						scaleX,
						scaleY,
					}}
				>
					{/* アイドル時のふわふわ */}
					<motion.div
						animate={{ y: [0, -7, 0] }}
						transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
						style={{ width: "100%", height: "100%" }}
					>
						{/* 3D チルト + コンボ色進化 */}
						<motion.div
							style={{
								width: "100%",
								height: "100%",
								rotateX,
								rotateY,
								transformStyle: "preserve-3d",
								position: "relative",
								filter: `hue-rotate(${combo * 24}deg)`,
								transition: "filter 0.5s ease",
							}}
						>
							{/* 外側グロー（脈動） */}
							<motion.div
								animate={{
									scale: [1, 1.35, 1],
									opacity: [0.25, 0.5, 0.25],
								}}
								transition={{
									repeat: Infinity,
									duration: 2.8,
									ease: "easeInOut",
								}}
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
								transition={{
									repeat: Infinity,
									duration: 4.5,
									ease: "linear",
								}}
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
								transition={{
									repeat: Infinity,
									duration: 2.8,
									ease: "easeInOut",
								}}
								whileHover={{ scale: 1.12 }}
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
									transition={{
										repeat: Infinity,
										duration: 8,
										ease: "linear",
									}}
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
										boxShadow: `0 0 ${s.size * 2}px ${s.color}, 0 0 ${
											s.size * 4
										}px ${s.color}`,
										pointerEvents: "none",
									}}
								/>
							))}
						</motion.div>
					</motion.div>
				</motion.div>
			</motion.div>

			{/* パーティクル爆発（画面座標に描画） */}
			{bursts.map((b) => (
				<ParticleBurst key={b.id} x={b.x} y={b.y} big={b.big} />
			))}
		</>
	);
}
