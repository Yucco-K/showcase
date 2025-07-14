import styled from "styled-components";

const SuccessContainer = styled.div`
	color: #155724;
	padding: 1rem;
	background: #d4edda;
	border: 1px solid #c3e6cb;
	border-radius: 4px;
	margin: 1rem 0;
	font-size: 0.9rem;
`;

interface SuccessMessageProps {
	message: string;
	className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
	message,
	className,
}) => {
	return <SuccessContainer className={className}>{message}</SuccessContainer>;
};

export default SuccessMessage;
