import { useState, useCallback } from "react";

export const usePreventDoubleClick = (delay: number = 1000) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const preventDoubleClick = useCallback(
		async (callback: () => void | Promise<void>) => {
			if (isSubmitting) return;

			setIsSubmitting(true);

			try {
				await callback();
			} finally {
				setTimeout(() => {
					setIsSubmitting(false);
				}, delay);
			}
		},
		[isSubmitting, delay]
	);

	return { isSubmitting, preventDoubleClick };
};
