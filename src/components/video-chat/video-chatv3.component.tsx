import { useContext, useEffect, useRef, useState } from 'react';
import { ArrowUpOutlined, AudioOutlined, AudioMutedOutlined, PhoneOutlined } from '@ant-design/icons';
import { Space, Tooltip, Button } from 'antd';

import { emitAnswer, emitCancelCall, emitCandidate, emitEndCall, emitMakeCall } from '@src/socket-connections/connections';
import SocketContext from '@src/contexts/socket/socket';
import MakeCallButtons from '../make-call-buttons/make-call-buttons.component';
import AcceptCallButtons from '../accept-call-buttons/accept-call-buttons.component';
import { RTC_PEER_CONFIG } from '@src/constants';

import './style.css';

const VideoChat = () => {
	const [isCallingUser, setCallingUser] = useState(false);
	const [isCallButtonCalling, setCallButtonCalling] = useState(false);
	const [isCallAccepted, setCallAccepted] = useState(false);
	const [isMuted, setMute] = useState(false);

	const localVideoRef = useRef<HTMLVideoElement>(null);
	// const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const pc = useRef<RTCPeerConnection | null>(null);
	const localStream = useRef<MediaStream | null>(null);

	const { socket } = useContext(SocketContext).socketState;

	useEffect(() => {
		return () => {
			cleanUpStream();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!socket) return;

		pc.current = new RTCPeerConnection(RTC_PEER_CONFIG);

		pc.current.onicecandidate = (event) => {
			if (event.candidate) emitCandidate(socket, event.candidate);
		};

		// pc.current.ontrack = (event) => {
		// 	if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
		// };

		const onOffer = async (offer: RTCSessionDescriptionInit) => {
			if (pc.current) {
				await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
				const answer = await pc.current.createAnswer();
				await pc.current.setLocalDescription(answer);
				emitAnswer(socket, answer);

				setCallingUser(true);
			}
		};
		socket.on('offer', onOffer);

		const onAnswer = async (answer: RTCSessionDescriptionInit) => {
			if (pc.current) {
				await pc.current.setRemoteDescription(new RTCSessionDescription(answer));

				setCallAccepted(true);
			}
		};
		socket.on('answer', onAnswer);

		const onCandidate = async (candidate: RTCIceCandidateInit | undefined) => {
			if (pc.current) {
				await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
			}
		};
		socket.on('candidate', onCandidate);

		const callCancelled = () => {
			setCallingUser(false);
			setCallButtonCalling(false);
			cleanUpStream();
		};
		socket.on('call-cancelled', callCancelled);

		const callEnded = () => {
			setCallAccepted(false);
			setCallingUser(false);
			setCallButtonCalling(false);
			setMute(false);
			cleanUpStream();
		};
		socket.on('call-ended', callEnded);

		return () => {
			pc.current?.close();
			socket.off('offer', onOffer);
			socket.off('answer', onAnswer);
			socket.off('candidate', onCandidate);
			socket.off('call-cancelled', callCancelled);
			socket.off('call-ended', callEnded);
		};
	}, [socket]);

	const startVideo = (): Promise<MediaStream> => {
		return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	};

	const createOffer = async () => {
		const stream = await startVideo();

		localStream.current = stream;
		if (localVideoRef.current) localVideoRef.current.srcObject = stream;

		stream.getTracks().forEach((track) => {
			if (pc.current) pc.current.addTrack(track, stream);
		});
	};

	const handleRemoteCall = async () => {
		setCallButtonCalling(true);
		if (socket && pc.current) {
			const offer = await pc.current.createOffer();
			await pc.current.setLocalDescription(offer);
			emitMakeCall(socket, offer);
		}

		await createOffer();
	};

	const handleAcceptCall = async () => {
		setCallAccepted(true);

		await createOffer();
	};

	const cleanUpStream = () => {
		if (localStream.current) localStream.current.getTracks().forEach((track) => track.stop());
		if (localVideoRef.current) localVideoRef.current.srcObject = null;
		// if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
	};

	const handleMute = () => {
		if (localStream.current) localStream.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));

		setMute((prev) => !prev);
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
		cleanUpStream();
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
					<>
						<video ref={localVideoRef} className="video-chat" playsInline autoPlay></video>
						{/* <video ref={remoteVideoRef} className="video-chat" playsInline autoPlay></video> */}
					</>
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
