import { useContext, useEffect, useRef, useState } from 'react';
import Peer, { SignalData } from 'simple-peer';
import { Button, Space, Tooltip } from 'antd';
import { ArrowUpOutlined, AudioOutlined, AudioMutedOutlined, PhoneOutlined } from '@ant-design/icons';

import MakeCallButtons from '@components/make-call-buttons/make-call-buttons.component';
import AcceptCallButtons from '@components/accept-call-buttons/accept-call-buttons.component';

import { emitMakeCall, emitCallUser, emitAcceptCall, emitCancelCall, emitEndCall } from '@socket-connections/connections';
import SocketContext from '@root/src/contexts/socket/socket';

import './style.css';

const VideoChat = () => {
	const [isCallingUser, setCallingUser] = useState(false);
	const [isCallButtonCalling, setCallButtonCalling] = useState(false);
	const [callerSignal, setCallerSignal] = useState<SignalData>();
	const [isCallAccepted, setCallAccepted] = useState(false);
	const [isMuted, setMute] = useState(false);

	const opponentVideo = useRef<HTMLVideoElement>(null);
	const myPeer = useRef<Peer.Instance>();
	const myStream = useRef<MediaStream>();

	const { socket } = useContext(SocketContext).socketState;

	useEffect(() => {
		return () => {
			cleanUpStream();
			cleanUpPeer();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		function makingCall() {
			setCallingUser(true);
		}
		if (socket) socket.on('making-call', makingCall);

		function userCalled(signalData: SignalData) {
			setCallerSignal(signalData);
		}
		if (socket) socket.on('user-called', userCalled);

		function calledAccepted(signal: SignalData) {
			setCallAccepted(true);
			myPeer.current?.signal(signal);
		}
		if (socket) socket.on('call-accepted', calledAccepted);

		function callCancelled() {
			setCallingUser(false);
			setCallButtonCalling(false);
			cleanUpStream();
		}
		if (socket) socket.on('call-cancelled', callCancelled);

		function callEnded() {
			setCallAccepted(false);
			setCallingUser(false);
			setCallButtonCalling(false);
			setMute(false);
			cleanUpPeer();
			cleanUpStream();
		}
		if (socket) socket.on('call-ended', callEnded);

		return () => {
			if (socket) {
				socket.off('making-call', makingCall);
				socket.off('user-called', userCalled);
				socket.off('call-accepted', calledAccepted);
				socket.off('call-cancelled', callCancelled);
				socket.off('call-ended', callEnded);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	const startVideo = (): Promise<MediaStream> | undefined => {
		if (myStream.current) return;
		return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	};

	const handleRemoteCall = () => {
		setCallButtonCalling(true);
		if (socket) emitMakeCall(socket, {});

		startVideo()?.then((stream) => {
			myStream.current = stream;

			const peer = new Peer({
				initiator: true,
				trickle: false,
				stream,
			});

			myPeer.current = peer;

			peer.on('signal', (signalData) => {
				if (signalData) return;
				if (socket) emitCallUser(socket, signalData);
			});

			peer.on('stream', (peerStream) => {
				if (opponentVideo.current) {
					opponentVideo.current.srcObject = peerStream;
				}
			});
		});
	};

	const handleAcceptCall = () => {
		setCallAccepted(true);

		startVideo()?.then((stream) => {
			myStream.current = stream;

			const peer = new Peer({
				initiator: false,
				trickle: false,
				stream,
			});

			myPeer.current = peer;

			peer.on('signal', (signalData) => {
				if (signalData) return;
				if (socket) emitAcceptCall(socket, signalData);
			});

			peer.on('stream', (peerStream) => {
				if (opponentVideo.current) opponentVideo.current.srcObject = peerStream;
			});

			if (callerSignal) peer.signal(callerSignal);
		});
	};

	const cleanUpStream = () => {
		if (myStream.current) {
			myStream.current.getTracks().forEach((track) => track.stop());
			myStream.current = undefined;
		}
	};

	const cleanUpPeer = () => {
		if (myPeer.current) {
			myPeer.current.removeAllListeners('close');
			myPeer.current.destroy();
			myPeer.current = undefined;
		}
	};

	const handleCancelCall = () => {
		if (socket) emitCancelCall(socket);
		cleanUpStream();
		setCallingUser(false);
		setCallButtonCalling(false);
	};

	const handleEndCall = () => {
		if (socket) emitEndCall(socket);
		setCallAccepted(false);
		setCallingUser(false);
		setCallButtonCalling(false);
		setMute(false);
		cleanUpPeer();
		cleanUpStream();
	};

	const handleMute = () => {
		if (myStream.current) myStream.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));

		setMute(!isMuted);
	};

	const buttonContainerStyle = () => {
		if (!isCallButtonCalling && isCallingUser && !isCallAccepted) return 'recieving-call-background';
		if (isCallButtonCalling && !isCallingUser && !isCallAccepted) return 'calling-background';
		if (isCallAccepted) return 'calling-background';
		if (!isCallButtonCalling && !isCallAccepted) return 'default-background';
	};

	return (
		<div className="video-chat-container">
			<div className={`video-btns-container ${buttonContainerStyle()}`}>
				<div className="video-btns">
					<MakeCallButtons isCallingUser={isCallingUser} isCallAccepted={isCallAccepted} isCallButtonCalling={isCallButtonCalling} onRemoteCall={handleRemoteCall} onCancelCall={handleCancelCall} />

					<AcceptCallButtons isCallingUser={isCallingUser} isCallAccepted={isCallAccepted} onAcceptCall={handleAcceptCall} onCancelCall={handleCancelCall} />
					{isCallAccepted && (
						<Space>
							<Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
								<Button shape="circle" className="video-call-btn" onClick={handleMute} icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />} />
							</Tooltip>
							<Tooltip title="End call">
								<Button shape="circle" className="video-call-btn" onClick={handleEndCall} icon={<PhoneOutlined rotate={225} style={{ fontSize: '20px' }} />} type="primary" danger />
							</Tooltip>
						</Space>
					)}
				</div>
			</div>
			<div className="video-container">
				{isCallAccepted ? (
					<video className="video-chat" ref={opponentVideo} playsInline autoPlay />
				) : (
					<div className="video-overlay">
						<ArrowUpOutlined className="video-overlay-up-arrow" style={{ opacity: isCallButtonCalling ? 0 : isCallingUser ? 0 : 1 }} />
						<h2>{isCallButtonCalling ? 'Calling opponent!' : isCallingUser ? 'Opponent is calling!' : 'Call opponent?'}</h2>
					</div>
				)}
			</div>
		</div>
	);
};
export default VideoChat;
