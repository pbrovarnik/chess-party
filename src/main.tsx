import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import SocketContextComponent from './contexts/socket/component.tsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<SocketContextComponent>
		<App />
	</SocketContextComponent>
);
