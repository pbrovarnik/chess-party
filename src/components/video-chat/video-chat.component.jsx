import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Button, Space, Tooltip } from 'antd';
import {
	ArrowUpOutlined,
	AudioOutlined,
	AudioMutedOutlined,
	PhoneOutlined,
} from '@ant-design/icons';

import MakeCallButtons from 'components/make-call-buttons/make-call-buttons.component';
import AcceptCallButtons from 'components/accept-call-buttons/accept-call-buttons.component';

import {
	emitMakeCall,
	emitCallUser,
	emitAcceptCall,
	emitCancelCall,
	emitEndCall,
} from 'socket-connections/sockets';

import './style.css';

const VideoChat = ({ socket }) => {
	const [callingUser, setCallingUser] = useState(false);
	const [isCallButtonCalling, setCallButtonCalling] = useState(false);
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);
	const [isMuted, setMute] = useState(false);

	const opponentVideo = useRef();
	const myPeer = useRef();
	const myStream = useRef();

	useEffect(() => {
		return () => {
			cleanUpStream();
			cleanUpPeer();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		socket.on('making-call', () => {
			setCallingUser(true);
		});

		socket.on('user-called', (signalData) => {
			setCallerSignal(signalData);
		});

		socket.on('call-accepted', (signal) => {
			setCallAccepted(true);
			myPeer.current.signal(signal);
		});

		socket.on('call-cancelled', () => {
			setCallingUser(false);
			setCallButtonCalling(false);
			cleanUpStream();
		});

		socket.on('call-ended', () => {
			setCallAccepted(false);
			setCallingUser(false);
			setCallButtonCalling(false);
			setMute(false);
			cleanUpPeer();
			cleanUpStream();
		});

		return () => {
			socket.off('making-call');
			socket.off('user-called');
			socket.off('call-cancelled');
			socket.off('call-accepted');
			socket.off('call-ended');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	const startVideo = () => {
		if (myStream.current) return;
		return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	};

	const handleCallOpponent = () => {
		setCallButtonCalling(true);
		emitMakeCall();

		startVideo().then((stream) => {
			myStream.current = stream;

			const peer = new Peer({
				initiator: true,
				trickle: false,
				stream,
			});

			myPeer.current = peer;

			peer.on('signal', (signalData) => {
				if (signalData.renegotiate || signalData.transceiverRequest) return;
				emitCallUser(signalData);
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

		startVideo().then((stream) => {
			myStream.current = stream;

			const peer = new Peer({
				initiator: false,
				trickle: false,
				stream,
			});

			myPeer.current = peer;

			peer.on('signal', (signalData) => {
				if (signalData.renegotiate || signalData.transceiverRequest) return;
				emitAcceptCall(signalData);
			});

			peer.on('stream', (peerStream) => {
				opponentVideo.current.srcObject = peerStream;
			});

			peer.signal(callerSignal);
		});
	};

	const cleanUpStream = () => {
		if (myStream.current) {
			myStream.current.getTracks().forEach((track) => track.stop());
			myStream.current = null;
		}
	};

	const cleanUpPeer = () => {
		if (myPeer.current) {
			myPeer.current.removeAllListeners('close');
			myPeer.current.destroy();
			myPeer.current = null;
		}
	};

	const handleCancelCall = () => {
		emitCancelCall();
		cleanUpStream();
		setCallingUser(false);
		setCallButtonCalling(false);
	};

	const handleEndCall = () => {
		emitEndCall();
		setCallAccepted(false);
		setCallingUser(false);
		setCallButtonCalling(false);
		setMute(false);
		cleanUpPeer();
		cleanUpStream();
	};

	const handleMute = () => {
		if (myStream.current)
			myStream.current
				.getAudioTracks()
				.forEach((track) => (track.enabled = !track.enabled));

		setMute(!isMuted);
	};

	const buttonContainerStyle = () => {
		if (!isCallButtonCalling && callingUser && !callAccepted)
			return 'recieving-call-background';
		if (isCallButtonCalling && !callingUser && !callAccepted)
			return 'calling-background';
		if (callAccepted) return 'calling-background';
		if (!isCallButtonCalling && !callAccepted) return 'default-background';
	};

	return (
		<div className='video-chat-container'>
			<div className={`video-btns-container ${buttonContainerStyle()}`}>
				<div className='video-btns'>
					<MakeCallButtons
						callingUser={callingUser}
						callAccepted={callAccepted}
						isCallButtonCalling={isCallButtonCalling}
						handleCallOpponent={handleCallOpponent}
						handleCancelCall={handleCancelCall}
					/>

					<AcceptCallButtons
						callingUser={callingUser}
						callAccepted={callAccepted}
						handleAcceptCall={handleAcceptCall}
						handleCancelCall={handleCancelCall}
					/>
					{callAccepted && (
						<Space>
							<Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
								<Button
									size='large'
									shape='circle'
									// className='mute-btn'
									onClick={handleMute}
									icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
								/>
							</Tooltip>
							<Tooltip title='End call'>
								<Button
									size='large'
									shape='circle'
									// className='mute-btn'
									onClick={handleEndCall}
									icon={<PhoneOutlined rotate={225} />}
									type='primary'
									danger
								/>
							</Tooltip>
						</Space>
					)}
				</div>
			</div>
			<div className='video-container'>
				{callAccepted ? (
					<video className='video-chat' ref={opponentVideo} playsInline autoPlay />
				) : (
					<div className='video-overlay'>
						<ArrowUpOutlined
							className='video-overlay-up-arrow'
							style={{ opacity: isCallButtonCalling ? 0 : callingUser ? 0 : 1 }}
						/>
						<h2>
							{isCallButtonCalling
								? 'Calling opponent!'
								: callingUser
								? 'Opponent is calling!'
								: 'Call opponent?'}
						</h2>
					</div>
				)}
			</div>
		</div>
	);
};
export default VideoChat;
