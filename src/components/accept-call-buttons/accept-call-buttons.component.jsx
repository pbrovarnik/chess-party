import React from 'react';
import { Button, Space } from 'antd';

const AcceptCallButtons = ({
	callingUser,
	callAccepted,
	handleAcceptCall,
	handleCancelCall,
}) => {
	return (
		<>
			{callingUser && !callAccepted && (
				<Space>
					<Button onClick={handleAcceptCall}>Accept call</Button>
					<Button onClick={handleCancelCall}>Cancel call</Button>
				</Space>
			)}
		</>
	);
};

export default AcceptCallButtons;
