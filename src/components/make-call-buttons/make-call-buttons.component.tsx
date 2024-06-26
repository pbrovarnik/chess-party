import { Button, Space, Tooltip } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

type Props = {
	isIncomingCall: boolean;
	isCallAccepted: boolean;
	isCallStarted: boolean;
	onStartCall: () => void;
	onCancelCall: () => void;
};

const MakeCallButtons = ({ isIncomingCall, isCallAccepted, isCallStarted, onStartCall, onCancelCall }: Props) => {
	return (
		<>
			{!isIncomingCall && !isCallAccepted && (
				<Space>
					{!isCallStarted ? (
						<Tooltip title="Call">
							<Button className="video-call-btn" shape="circle" onClick={onStartCall} icon={<PhoneOutlined rotate={90} style={{ fontSize: '20px' }} />} disabled={isCallStarted} type="primary" />
						</Tooltip>
					) : (
						<Tooltip title="Cancel call">
							<Button shape="circle" onClick={onCancelCall} icon={<PhoneOutlined rotate={225} style={{ fontSize: '20px' }} />} type="primary" danger />
						</Tooltip>
					)}
				</Space>
			)}
		</>
	);
};

export default MakeCallButtons;
