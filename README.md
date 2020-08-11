# React MusicPlayer App
React 를 사용해 Toast 접근성을 준수하여 만든 Music Player 입니다.

## 사용 기술
- FrontEnd : React + SASS + Style Module
- Modules : raf(RequestAnimationFrame), react-howler, classnames, html-react-parser, 
- 컴포넌트 형태 : Class, Functional Component With Hooks
- 기타 눈여겨볼만한 것 : createPortal + ContextProvider 를 래핑한 기법을 사용한 Toast 컴포넌트

## 구현 기능
- 재생 & 일시정지 & 다음재생
- 재생이 스스로 끝나면 Toast 띄우기

### 재생 & 일시정지 & 다음재생
https://github.com/LimEunSeop/assets/blob/master/images/react-musicplayer-app/%E1%84%86%E1%85%B2%E1%84%8C%E1%85%B5%E1%86%A8%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8B%E1%85%A5-Play_Pause_Next.gif?raw=true

### 재생이 스스로 끝나면 Toast 띄우기
https://github.com/LimEunSeop/assets/blob/master/images/react-musicplayer-app/%E1%84%86%E1%85%B2%E1%84%8C%E1%85%B5%E1%86%A8%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8B%E1%85%A5-Toast.gif?raw=true

## 어려웠던 점 + 해결방안
React Howler 와 재생 & 일시정지 & 다음곡 재생 컨트롤러를 만들어 연동시키는 것은 커다란 문제가 없었습니다. 그러나, SeekBar 를 만들어 이에대한 인터렉션 구현시 많은 어려움이 있었습니다. 처음엔 곡의 진행률을 상태로 두고 RequestAnimationFrame 을 이용하여 곡 진행률을 업데이트 하여 seekBar의 상태를 재 렌더링 하는 방식을 이용했습니다. 하지만 너무 빨리 렌더링되어서 그런지 Seekbar 클릭 인터렉션 시 충돌이 나서 음악이 겹쳐서 재생되는 문제가 있었습니다. SeekBar 인터렉션 동안만은 RequestAnimationFrame 을 해제하고 Seekbar 상태가 업데이트 완료되면 setTimeot 을 이용하여 다시 RequestAnimationFrame 을 실행하려 했으나, 이는 순간의 해결만 있었을 뿐 SeekBar 연타 시 다시 똑같은 버그가 있었습니다. 결국 Seekbar 업데이트를 Side-Effect 처리하였습니다.

사이드이펙트 처리하는 편이 렌더링 비용을 절감할 수도 있을것 같은데, RequestAnimationFrame 으로 인한 렌더링도 비용손실이 많지 않으면 언젠가 다시 도전하여 상태관리로 SeekBar 업데이트 하는 것을 꼭 완료시켜 보고 싶습니다.

## 공부 Memo

### window.requestAnimationFrame()
보통의 재귀호출은 StackOverFlow 가 일어나나, requestAnimationFrame	같은 경우엔 콜백으로써 재귀호출할 함수를 넘겨주면 Overflow 없이 실행컨텍스트 비운 후 새로운 실행 컨텍스트를 생성합니다. 또한, 브라우저의 애니메이션 프레임에 맞춰 호출되므로 프레임누락이 없어져 애니메이션 최적화가 가능합니다.

### Toast 생성 방식
Music Player 앱 컴포넌트에 addToast() 메서드를 전달하고, 추가된 Toast 리스트를 저장하기 위해 Context Provider와 Toast 배열을 래핑한 ToastContextProvider 클래스 컴포넌트를 만들었습니다. Music Player 에서 addToast() 메서드를 소비하여 곡이 끝나면 Toast 를 추가하도록 하고, ToastContextProvider 는 createPortal() 메서드를 통해 document.body 부분에 Toast 알림을 띄웁니다. 굳이 Portal 을 하는 이유는, 접근성을 위해서 입니다. React 에서 주는 변화는 스크린리더가 감지 못하기 때문에 시각장애인이 Toast 를 인지할 방법이 없습니다. 그래서 실제DOM 에 렌더링 하도록 포탈을 열어준 것입니다.

Toast 가 들어갈 자리는 접근성 준수를 위하여 스크린 리더가 읽을 수 있게끔 WAI-ARIA 에서 정의한 3가지 속성을 사용해야 합니다. role="alert" 했다면 나머지 두 속성을 디폴트이니 적지는 않아도 됩니다. (읽고있던 것 멈추고 Toast 읽어달라는 속)
```html
<div id="toastZone" role="alert" aria-atomic="true" aria-live="assertive"></div>
```