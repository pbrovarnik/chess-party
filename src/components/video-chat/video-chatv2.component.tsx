import { useContext, useEffect, useRef, useState } from 'react';
// import Peer, { SignalData } from 'simple-peer';
import { Button, Space, Tooltip } from 'antd';
import { ArrowUpOutlined, AudioOutlined, AudioMutedOutlined, PhoneOutlined } from '@ant-design/icons';

import MakeCallButtons from '@components/make-call-buttons/make-call-buttons.component';
import AcceptCallButtons from '@components/accept-call-buttons/accept-call-buttons.component';

import { emitCancelCall, emitEndCall } from '@socket-connections/connections';
import SocketContext from '@root/src/contexts/socket/socket';

import './style.css';

const VideoChat = () => {
	const [isCallingUser, setCallingUser] = useState(false);
	const [isCallButtonCalling, setCallButtonCalling] = useState(false);
	// const [callerSignal, setCallerSignal] = useState<SignalData>();
	const [isCallAccepted, setCallAccepted] = useState(false);
	const [isMuted, setMute] = useState(false);

	// const [stream, setStream] = useState<MediaStream>();
	// const [me, setMe] = useState('');
	// const [isRecievingCall, setReceivingCall] = useState(false);
	// const [caller, setCaller] = useState('');
	// const [name, setName] = useState('');

	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const localVideoRef = useRef<HTMLVideoElement>(null);

	const localStream = useRef<MediaStream>();
	// const remoteStream = useRef<MediaStream>();
	const peerConnection = useRef<RTCPeerConnection>();

	const { socket } = useContext(SocketContext).socketState;

	// useEffect(() => {
	// 	navigator.mediaDevices
	// 		.getUserMedia({ video: true, audio: true })
	// 		.then((localStream) => {
	// 			remoteStream.current = new MediaStream()

	// 			localStream.getTracks().forEach((track) => {

	// 			})
	// 			// setStream(stream);

	// 			// if (localVideoRef.current) localVideoRef.current.srcObject = stream;
	// 		})
	// 		.catch((error) => {
	// 			console.error('Error accessing media devices.', error);
	// 		});

	// 	if (socket) {
	// 		// 	socket.on('me', (id) => {
	// 		// 		setMe(id);
	// 		// 	});
	// 		// 	socket.on('call_user', (data) => {
	// 		// 		setReceivingCall(true);
	// 		// 		setCaller(data.from);
	// 		// 		setName(data.name);
	// 		// 		setCallerSignal(data.signal);
	// 		// 	});
	// 	}
	// }, []);

	// useEffect(() => {
	// 	navigator.mediaDevices
	// 		.getUserMedia({ video: true, audio: true })
	// 		.then((localStream) => {
	// 			if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
	// 		})
	// 		.catch((error) => {
	// 			console.error('Error accessing media devices.', error);
	// 		});
	// }, []);

	const createPeerConnection = () => {
		const config = {
			iceServers: [
				{
					urls: 'stun:stun.l.google.com:19302', // Google's public STUN server
				},
			],
		};

		peerConnection.current = new RTCPeerConnection(config);

		// Handle ICE candidates
		peerConnection.current.onicecandidate = (event) => {
			if (event.candidate) {
				// socket.emit('ice candidate', event.candidate, roomId);
			}
		};

		// Handle remote video stream
		peerConnection.current.ontrack = (event) => {
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = event.streams[0];
			}
		};

		// Add local stream to peer connection
		const localStream = localVideoRef.current?.srcObject as MediaStream;
		if (!localStream) return;
		for (const track of localStream.getTracks()) {
			peerConnection.current.addTrack(track, localStream);
		}
	};

	useEffect(() => {
		if (!socket) return;

		// Video connections
		socket.on('offer', async (offer) => {
			console.log('offer', offer);
			if (!peerConnection) {
				createPeerConnection();
			}

			await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));
			const answer = await peerConnection.current?.createAnswer();
			await peerConnection.current?.setLocalDescription(answer);

			socket.emit('answer', answer);
		});

		socket.on('answer', async (answer) => {
			await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
		});

		socket.on('ice candidate', async (candidate) => {
			try {
				await peerConnection.current?.addIceCandidate(candidate);
			} catch (error) {
				console.error('Error adding received ice candidate', error);
			}
		});
	}, [socket]);

	const startVideo = (): Promise<MediaStream> | undefined => {
		if (localStream.current) return;
		return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	};

	const handleMakeCall = () => {
		setCallButtonCalling(true);
		// if (socket) emitMakeCall(socket);

		// 		.then((localStream) => {
		// 			if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
		// 		})
		// 		.catch((error) => {
		// 			console.error('Error accessing media devices.', error);
		// 		});

		startVideo()?.then((stream) => {
			localStream.current = stream;

			// const peer = new Peer({
			// 	initiator: true,
			// 	trickle: false,
			// 	stream,
			// });

			// myPeer.current = peer;

			// peer.on('signal', (signalData) => {
			// 	if (signalData) return;
			// 	if (socket) emitCallUser(socket, signalData);
			// });

			// peer.on('stream', (peerStream) => {
			// 	if (opponentVideo.current) {
			// 		opponentVideo.current.srcObject = peerStream;
			// 	}
			// });
		});
	};

	const handleAcceptCall = () => {};

	const cleanUpStream = () => {};

	const cleanUpPeer = () => {};

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
		if (localStream.current) localStream.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));

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
					<MakeCallButtons isCallingUser={isCallingUser} isCallAccepted={isCallAccepted} isCallButtonCalling={isCallButtonCalling} onRemoteCall={handleMakeCall} onCancelCall={handleCancelCall} />

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
					<div id="video-container">
						<video id="local-video" ref={localVideoRef} autoPlay playsInline />
						<video id="remote-video" ref={remoteVideoRef} autoPlay playsInline />
					</div>
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
