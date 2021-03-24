import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

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
					{!isCallButtonCalling ? (
						<Tooltip title='Call'>
							<Button
								className='video-call-btn'
								shape='circle'
								onClick={handleCallOpponent}
								icon={<PhoneOutlined rotate={90} style={{ fontSize: '20px' }} />}
								disabled={isCallButtonCalling}
								type='primary'
							/>
						</Tooltip>
					) : (
						<Tooltip title='Cancel call'>
							<Button
								shape='circle'
								onClick={handleCancelCall}
								icon={<PhoneOutlined rotate={225} style={{ fontSize: '20px' }} />}
								type='primary'
								danger
							/>
						</Tooltip>
					)}
				</Space>
			)}
		</>
	);
};

export default MakeCallButtons;
