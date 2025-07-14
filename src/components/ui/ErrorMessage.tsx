import styled from "styled-components";

const ErrorContainer = styled.div`
	color: #dc3545;
	padding: 1rem;
	background: #f8d7da;
	border: 1px solid #f5c6cb;
	border-radius: 4px;
	margin: 1rem 0;
	font-size: 0.9rem;
`;

interface ErrorMessageProps {
	message: string;
	className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
	return <ErrorContainer className={className}>{message}</ErrorContainer>;
};

export default ErrorMessage;
