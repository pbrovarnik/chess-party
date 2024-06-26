import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ArrowUpOutlined, AudioOutlined, AudioMutedOutlined, PhoneOutlined } from '@ant-design/icons';
import { Space, Tooltip, Button } from 'antd';

import { emitAcceptCall, emitAnswerOffer, emitCancelCall, emitCandidate, emitEndCall, emitOffer } from '@src/socket-connections/connections';
import SocketContext from '@src/contexts/socket/socket';
import MakeCallButtons from '../make-call-buttons/make-call-buttons.component';
import AcceptCallButtons from '../accept-call-buttons/accept-call-buttons.component';
import { RTC_PEER_CONFIG } from '@src/constants';

import './style.css';

const VideoChat = () => {
	const [isCallAccepted, setCallAccepted] = useState(false);
	const [isCallStarted, setCallStarted] = useState(false);
	const [isIncomingCall, setIsCallIncoming] = useState(false);
	// const [isVideoShown, setShowVideo] = useState(false);
	const [isMuted, setMute] = useState(true);
	const [pc, setPc] = useState<RTCPeerConnection | null>(null);

	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const remoteStream = useRef<MediaStream | null>(null);
	const localStream = useRef<MediaStream | null>(null);

	const { socket } = useContext(SocketContext).socketState;

	const createPeerConnection = useCallback(() => {
		const peerConnection = new RTCPeerConnection(RTC_PEER_CONFIG);
		peerConnection.onicecandidate = (event) => {
			if (socket && event.candidate) {
				emitCandidate(socket, event.candidate);
			}
		};

		peerConnection.ontrack = (event) => {
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = event.streams[0];
			}
		};

		return peerConnection;
	}, [socket]);

	const resetVideoPlayer = useCallback(() => {
		setCallStarted(false);
		setCallAccepted(false);
		setIsCallIncoming(false);
		setMute(false);
		cleanUpStream();
	}, []);

	const createStream = async (peerConnection: RTCPeerConnection): Promise<MediaStream> => {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
		stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

		return stream;
	};

	useEffect(() => {
		if (!socket) return;

		const onOffer = async (offer: RTCSessionDescriptionInit) => {
			setIsCallIncoming(true);
			const peerConnection = createPeerConnection();
			await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

			remoteStream.current = await createStream(peerConnection);

			const answer = await peerConnection.createAnswer();
			await peerConnection.setLocalDescription(answer);
			emitAnswerOffer(socket, answer);

			setPc(peerConnection);
		};
		socket.on('offer', onOffer);

		const onAnswer = async (answer: RTCSessionDescriptionInit) => {
			console.log('Received answer');
			if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
		};
		socket.on('answer', onAnswer);

		const onCandidate = async (candidate: RTCIceCandidateInit | undefined) => {
			console.log('Received candidate');
			if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
		};
		socket.on('candidate', onCandidate);

		const onAcceptCall = () => {
			setCallAccepted(true);
		};
		socket.on('accept-call', onAcceptCall);

		socket.on('call-cancelled', resetVideoPlayer);

		socket.on('call-ended', resetVideoPlayer);

		return () => {
			pc?.close();
			socket.off('offer', onOffer);
			socket.off('answer', onAnswer);
			socket.off('candidate', onCandidate);
			socket.off('accept-call', onAcceptCall);
			socket.off('call-cancelled', resetVideoPlayer);
			socket.off('call-ended', resetVideoPlayer);
		};
	}, [createPeerConnection, pc, resetVideoPlayer, socket]);

	const handleStartCall = async () => {
		const peerConnection = createPeerConnection();
		localStream.current = await createStream(peerConnection);

		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);

		if (socket) emitOffer(socket, offer);

		setPc(peerConnection);
		setCallStarted(true);
	};

	const handleAcceptCall = async () => {
		if (socket) emitAcceptCall(socket);
	};

	const handleMute = () => setMute((prev) => !prev);

	// const handleHideVideo = () => {
	// 	if (remoteStream.current) remoteStream.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
	// 	if (localStream.current) localStream.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));

	// 	setShowVideo((prev) => !prev);
	// };

	const cleanUpStream = () => {
		if (remoteStream.current) remoteStream.current.getTracks().forEach((track) => track.stop());
		if (localStream.current) localStream.current.getTracks().forEach((track) => track.stop());
		if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
	};

	const handleCancelCall = () => {
		if (socket) emitCancelCall(socket);
		resetVideoPlayer();
	};

	const handleEndCall = () => {
		if (socket) emitEndCall(socket);
		resetVideoPlayer();
	};

	const buttonContainerStyle = () => {
		if (!isCallStarted && isIncomingCall && !isCallAccepted) return 'recieving-call-background';
		if (isCallStarted && !isIncomingCall && !isCallAccepted) return 'calling-background';
		if (isCallAccepted) return 'calling-background';
		if (!isCallStarted && !isCallAccepted) return 'default-background';
	};

	return (
		<div className="video-chat-container">
			<div className={`video-btns-container ${buttonContainerStyle()}`}>
				<div className="video-btns">
					<MakeCallButtons isIncomingCall={isIncomingCall} isCallAccepted={isCallAccepted} isCallStarted={isCallStarted} onStartCall={handleStartCall} onCancelCall={handleCancelCall} />

					<AcceptCallButtons isIncomingCall={isIncomingCall} isCallAccepted={isCallAccepted} onAcceptCall={handleAcceptCall} onCancelCall={handleCancelCall} />
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
				<video
					ref={remoteVideoRef}
					style={{
						display: isCallAccepted ? 'block' : 'none',
					}}
					className="video-chat"
					playsInline
					autoPlay
					muted={isMuted}
				/>
				<div
					style={{
						display: isCallAccepted ? 'none' : 'flex',
					}}
					className="video-overlay">
					<ArrowUpOutlined className="video-overlay-up-arrow" style={{ opacity: isCallStarted ? 0 : isIncomingCall ? 0 : 1 }} />
					<h2>{isCallStarted ? 'Calling opponent!' : isIncomingCall ? 'Opponent is calling!' : 'Call opponent?'}</h2>
				</div>
			</div>
		</div>
	);
};

export default VideoChat;
