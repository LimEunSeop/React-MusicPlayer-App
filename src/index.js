import 'react-app-polyfill/ie11';
import 'styles/index.scss';
import React from 'react';
import ReactDOM from 'react-dom';

// Toast 컨텍스트 프로바이더
import { ToastContextProvider } from 'contexts/ToastContext';

// App 컴포넌트
import App from 'components/App/App';

// DOM 랜더링
ReactDOM.render(
  // Toast 컨텍스트 프로바이더로 App 래핑
  // 하위의 모든 컴포넌트는 컨텍스트 value를 가져다 사용 가능
  <ToastContextProvider
    // 옵션 설정
    options={{
      // autoHide: false,
      autoHideTime: 4000,
      position: 'bottomRight',
    }}
  >
    <App />
  </ToastContextProvider>,
  document.getElementById('reactApp')
);

// 빌드 시, PWA 설정
if (process.env.NODE_ENV === 'production') {
  // 다이내믹 임포트
  import('config/serviceWorker')
    .then((serviceWorker) => serviceWorker.register())
    .catch((error) => console.error(error.message));
}
