import React from 'react';
import { Spin } from 'antd';

import './style.css';

const WaitingPage = ({ game }) => (
	<div className='waiting-container'>
		<h1 className='waiting-header'>{game?.gameName}</h1>
		<p className='waiting-text'>Waiting for an opponent....</p>
		<Spin size='large' />
	</div>
);

export default WaitingPage;
