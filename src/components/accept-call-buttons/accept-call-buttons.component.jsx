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
							className='accept-btn'
							size='large'
							shape='circle'
							onClick={handleAcceptCall}
							icon={<PhoneOutlined rotate={90} />}
							type='primary'
						/>
					</Tooltip>
					<Tooltip title='Cancel call'>
						<Button
							size='large'
							shape='circle'
							onClick={handleCancelCall}
							icon={<PhoneOutlined rotate={225} />}
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
