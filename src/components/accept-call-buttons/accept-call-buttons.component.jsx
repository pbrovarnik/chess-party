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
					<Button className='accept-btn' onClick={handleAcceptCall} type='primary'>
						Accept call
					</Button>
					<Button onClick={handleCancelCall} type='primary' danger>
						Cancel call
					</Button>
				</Space>
			)}
		</>
	);
};

export default AcceptCallButtons;
