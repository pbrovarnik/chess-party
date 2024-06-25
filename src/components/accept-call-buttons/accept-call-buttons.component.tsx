import { Button, Space, Tooltip } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

type Props = {
	isCallingUser: boolean;
	isCallAccepted: boolean;
	onAcceptCall: () => void;
	onCancelCall: () => void;
};

const AcceptCallButtons = ({ isCallingUser, isCallAccepted, onAcceptCall, onCancelCall }: Props) => {
	return (
		<>
			{isCallingUser && !isCallAccepted && (
				<Space>
					<Tooltip title="Accept call">
						<Button className="accept-btn video-call-btn" shape="circle" onClick={onAcceptCall} icon={<PhoneOutlined rotate={90} style={{ fontSize: '20px' }} />} type="primary" />
					</Tooltip>
					<Tooltip title="Cancel call">
						<Button className="video-call-btn" shape="circle" onClick={onCancelCall} icon={<PhoneOutlined rotate={225} style={{ fontSize: '20px' }} />} type="primary" danger />
					</Tooltip>
				</Space>
			)}
		</>
	);
};

export default AcceptCallButtons;
