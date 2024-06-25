import { Button, Space, Tooltip } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

type Props = {
	isCallingUser: boolean;
	isCallAccepted: boolean;
	isCallButtonCalling: boolean;
	onRemoteCall: () => void;
	onCancelCall: () => void;
};

const MakeCallButtons = ({ isCallingUser, isCallAccepted, isCallButtonCalling, onRemoteCall, onCancelCall }: Props) => {
	return (
		<>
			{!isCallingUser && !isCallAccepted && (
				<Space>
					{!isCallButtonCalling ? (
						<Tooltip title="Call">
							<Button
								className="video-call-btn"
								shape="circle"
								onClick={onRemoteCall}
								icon={<PhoneOutlined rotate={90} style={{ fontSize: '20px' }} />}
								disabled={isCallButtonCalling}
								type="primary"
							/>
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
