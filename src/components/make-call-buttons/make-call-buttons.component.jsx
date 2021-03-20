import React from 'react';
import { Button, Space } from 'antd';

const MakeCallButtons = ({
	callingUser,
	callAccepted,
	isCallButtonCalling,
	handleCallOpponent,
	handleCancelCall,
}) => {
	return (
		<>
			{!callingUser && !callAccepted && (
				<Space>
					<Button onClick={handleCallOpponent} disabled={isCallButtonCalling}>
						{!isCallButtonCalling ? 'Call opponent' : 'Calling...'}
					</Button>
					{isCallButtonCalling && (
						<Button onClick={handleCancelCall}>Cancel call</Button>
					)}
				</Space>
			)}
		</>
	);
};

export default MakeCallButtons;
