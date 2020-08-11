import './App.scss';
import React, { Fragment } from 'react';
import MusicPlayer from '../MusicPlayer/MusicPlayer';

// 커스텀 훅: useToastContext()
import useToastContext from 'hooks/useToastContext';

/**
 * App 컴포넌트
 * @function
 */
const App = (props) => {
  // 커스텀 훅: useToastContext()에서 value 값을 가져 옴
  const addToast = useToastContext();

  return (
    <Fragment>
      <MusicPlayer
        api="/db/playlist.json"
        onLoad={() => console.log('로드 됨')}
        onEnd={({ title, singer }) => {
          // 노래가 종료되면 새로운 Toast를 추가하여 UI에 표시
          addToast({ html: `재생 곡은 <b>${title} - ${singer}</b>입니다.` });
        }}
      />
    </Fragment>
  );
};

export default App;
