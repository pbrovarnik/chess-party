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
					<Button
						onClick={handleCallOpponent}
						disabled={isCallButtonCalling}
						type='primary'
					>
						{!isCallButtonCalling ? 'Call opponent' : 'Calling...'}
					</Button>
					{isCallButtonCalling && (
						<Button onClick={handleCancelCall} danger>
							Cancel call
						</Button>
					)}
				</Space>
			)}
		</>
	);
};

export default MakeCallButtons;
