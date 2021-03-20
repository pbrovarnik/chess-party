import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Button } from 'antd';

import MakeCallButtons from '../make-call-buttons/make-call-buttons.component';
import AcceptCallButtons from '../accept-call-buttons/accept-call-buttons.component';

import {
	emitMakeCall,
	emitCallUser,
	emitAcceptCall,
	emitCancelCall,
	emitEndCall,
} from '../../socket-connections/sockets';

import './style.css';

const VideoChat = ({ socket }) => {
	const [callingUser, setCallingUser] = useState(false);
	const [isCallButtonCalling, setCallButtonCalling] = useState(false);
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);

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
		cleanUpPeer();
		cleanUpStream();
	};

	return (
		<div className='video-chat-container'>
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
				<>
					<video
						className='video-chat'
						ref={opponentVideo}
						muted
						playsInline
						autoPlay
					/>
					<Button onClick={handleEndCall}>End call</Button>
				</>
			)}
		</div>
	);
};
export default VideoChat;
