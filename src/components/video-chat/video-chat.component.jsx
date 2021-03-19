import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Button, Space } from 'antd';

import {
	emitMakeCall,
	emitCallUser,
	emitAcceptCall,
} from '../../socket-connections/sockets';

import './style.css';

const VideoChat = ({ socket }) => {
	const [stream, setStream] = useState();
	const [callingUser, setCallingUser] = useState(false);
	const [isCallButtonCalling, setCallButtonCalling] = useState(false);
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);

	const opponentVideo = useRef();

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setStream(stream);
			});

		socket.on('making-call', () => {
			setCallingUser(true);
		});

		socket.on('user-called', (signalData) => {
			setCallerSignal(signalData);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleCallOpponent() {
		setCallButtonCalling(true);
		emitMakeCall();
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
		});

		peer.on('signal', (signalData) => {
			emitCallUser(signalData);
		});

		peer.on('stream', (stream) => {
			if (opponentVideo.current) {
				opponentVideo.current.srcObject = stream;
			}
		});

		socket.on('call-accepted', (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});
	}

	function handleAcceptCall() {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (signalData) => {
			emitAcceptCall(signalData);
		});

		peer.on('stream', (stream) => {
			opponentVideo.current.srcObject = stream;
		});

		peer.signal(callerSignal);
	}

	return (
		<div className='video-chat-container'>
			{!callingUser && !callAccepted && (
				<Space>
					<Button onClick={handleCallOpponent} disabled={isCallButtonCalling}>
						{!isCallButtonCalling ? 'Call opponent' : 'Calling...'}
					</Button>
					{isCallButtonCalling && <Button>Cancel call</Button>}
				</Space>
			)}
			{callingUser && !callAccepted && (
				<Space>
					<Button onClick={handleAcceptCall}>Accept call</Button>
					<Button>Cancel call</Button>
				</Space>
			)}
			{callAccepted && (
				<video className='video-chat' ref={opponentVideo} playsInline autoPlay />
			)}
		</div>
	);
};
export default VideoChat;
