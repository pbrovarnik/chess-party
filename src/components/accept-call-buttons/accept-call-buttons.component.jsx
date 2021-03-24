import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

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
					<Tooltip title='Accept call'>
						<Button
							className='accept-btn video-call-btn'
							shape='circle'
							onClick={handleAcceptCall}
							icon={<PhoneOutlined rotate={90} style={{ fontSize: '20px' }} />}
							type='primary'
						/>
					</Tooltip>
					<Tooltip title='Cancel call'>
						<Button
							className='video-call-btn'
							shape='circle'
							onClick={handleCancelCall}
							icon={<PhoneOutlined rotate={225} style={{ fontSize: '20px' }} />}
							type='primary'
							danger
						/>
					</Tooltip>
				</Space>
			)}
		</>
	);
};

export default AcceptCallButtons;
