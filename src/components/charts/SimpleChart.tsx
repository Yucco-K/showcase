import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	type Scale,
	type CoreScaleOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Chart.jsコンポーネントを登録
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface SimpleChartProps {
	labels: string[];
	values: number[];
	title: string;
	color?: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
	labels,
	values,
	title,
	color = "#3ea8ff",
}) => {
	// Chart.jsのデータフォーマットに変換
	const data = {
		labels,
		datasets: [
			{
				label: title,
				data: values,
				borderColor: color,
				backgroundColor: `${color}33`, // 色に透明度20%を追加
				tension: 0.3,
				fill: true,
			},
		],
	};

	// グラフのオプション
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					color: "rgba(255, 255, 255, 0.8)",
				},
			},
			tooltip: {
				mode: "index" as const,
				intersect: false,
			},
		},
		scales: {
			x: {
				grid: {
					color: "rgba(255, 255, 255, 0.1)",
				},
				ticks: {
					color: "rgba(255, 255, 255, 0.7)",
				},
			},
			y: {
				grid: {
					color: "rgba(255, 255, 255, 0.1)",
				},
				ticks: {
					color: "rgba(255, 255, 255, 0.7)",
					callback: function (
						this: Scale<CoreScaleOptions>,
						tickValue: number | string
					) {
						// numberの場合のみ処理
						if (typeof tickValue === "number") {
							return `¥${tickValue.toLocaleString()}`;
						}
						return tickValue;
					},
				},
			},
		},
	};

	return <Line data={data} options={options} />;
};

export default SimpleChart;
