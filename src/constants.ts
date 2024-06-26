export const PLAYER_BLACK = 'black';
export const PLAYER_WHITE = 'white';
export const ADMIN = 'admin';
export const PAGE_LOBBY = 'Lobby';
export const PAGE_WAITING = 'Waiting';
export const PAGE_GAME = 'Game';
export const RTC_PEER_CONFIG = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{
			username: 'openrelayproject',
			credential: 'openrelayproject',
			urls: ['turn:openrelay.metered.ca:80'],
		},
	],
};
