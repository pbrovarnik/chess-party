import { Spin } from 'antd';

import './style.css';

type Props = {
	gameName: string;
};

const WaitingPage = ({ gameName }: Props) => (
	<div className="waiting-container">
		<h1 className="waiting-header">{gameName}</h1>
		<p className="waiting-text">Waiting for an opponent....</p>
		<Spin size="large" />
	</div>
);

export default WaitingPage;
