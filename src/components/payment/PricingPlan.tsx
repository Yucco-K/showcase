import styled from "styled-components";
import type { PricingPlanData } from "../../types/payment";

const PlanCard = styled.div<{ $selected: boolean }>`
	padding: 1.5rem;
	border: 2px solid ${({ $selected }) => ($selected ? "#007bff" : "#e0e0e0")};
	border-radius: 8px;
	margin-bottom: 1rem;
	cursor: pointer;
	transition: all 0.3s ease;
	background: ${({ $selected }) => ($selected ? "#f0f8ff" : "#fff")};

	&:hover {
		border-color: #007bff;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
	}
`;

const PlanTitle = styled.h3`
	margin: 0 0 0.5rem 0;
	color: #333;
	font-size: 1.2rem;
`;

const PlanPrice = styled.div`
	font-size: 1.8rem;
	font-weight: bold;
	color: #007bff;
	margin-bottom: 1rem;
`;

const FeatureList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
`;

const FeatureItem = styled.li`
	padding: 0.25rem 0;
	color: #666;

	&:before {
		content: "✓";
		color: #28a745;
		font-weight: bold;
		margin-right: 0.5rem;
	}
`;

interface PricingPlanProps {
	planKey: string;
	plan: PricingPlanData;
	selected: boolean;
	onSelect: (planKey: string) => void;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
	planKey,
	plan,
	selected,
	onSelect,
}) => {
	return (
		<PlanCard $selected={selected} onClick={() => onSelect(planKey)}>
			<PlanTitle>{plan.name}</PlanTitle>
			<PlanPrice>¥{plan.price.toLocaleString()}/月</PlanPrice>
			<FeatureList>
				{plan.features.map((feature) => (
					<FeatureItem key={feature}>{feature}</FeatureItem>
				))}
			</FeatureList>
		</PlanCard>
	);
};

export default PricingPlan;
