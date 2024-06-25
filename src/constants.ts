export const PLAYER_BLACK = 'black';
export const PLAYER_WHITE = 'white';
export const ADMIN = 'admin';
export const PAGE_LOBBY = 'Lobby';
export const PAGE_WAITING = 'Waiting';
export const PAGE_GAME = 'Game';
export const RTC_PEER_CONFIG = {
	iceServers: [
		{
			urls: ['stun:ws-turn3.xirsys.com'],
		},
		{
			username: import.meta.env.APP_XIRSYS_USERNAME,
			credential: import.meta.env.APP_XIRSYS_CREDENTIAL,
			urls: [
				'turn:ws-turn3.xirsys.com:80?transport=udp',
				'turn:ws-turn3.xirsys.com:3478?transport=udp',
				// 'turn:ws-turn3.xirsys.com:80?transport=tcp',
				// 'turn:ws-turn3.xirsys.com:3478?transport=tcp',
				// 'turns:ws-turn3.xirsys.com:443?transport=tcp',
				// 'turns:ws-turn3.xirsys.com:5349?transport=tcp',
			],
		},
	],
};
