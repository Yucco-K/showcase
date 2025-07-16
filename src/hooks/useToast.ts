import { useState, useCallback } from "react";

interface ToastState {
	message: string;
	type: "success" | "error" | "info" | "warning";
	isVisible: boolean;
}

export const useToast = () => {
	const [toast, setToast] = useState<ToastState>({
		message: "",
		type: "info",
		isVisible: false,
	});

	const showToast = useCallback(
		(
			message: string,
			type: "success" | "error" | "info" | "warning" = "info"
		) => {
			console.log("showToast called:", { message, type });
			setToast({
				message,
				type,
				isVisible: true,
			});
			console.log("Toast state set to visible");
		},
		[]
	);

	const hideToast = useCallback(() => {
		setToast((prev) => ({
			...prev,
			isVisible: false,
		}));
	}, []);

	const showSuccess = useCallback(
		(message: string) => {
			showToast(message, "success");
		},
		[showToast]
	);

	const showError = useCallback(
		(message: string) => {
			showToast(message, "error");
		},
		[showToast]
	);

	const showWarning = useCallback(
		(message: string) => {
			showToast(message, "warning");
		},
		[showToast]
	);

	const showInfo = useCallback(
		(message: string) => {
			showToast(message, "info");
		},
		[showToast]
	);

	return {
		toast,
		showToast,
		hideToast,
		showSuccess,
		showError,
		showWarning,
		showInfo,
	};
};
