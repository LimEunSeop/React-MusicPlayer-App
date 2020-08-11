import React, { createContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Toast 컴포넌트
import Toast from 'components/Toast/Toast';

// Toast 컴포넌트 스타일 모듈
import {
  zone,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
} from 'components/Toast/Toast.module.scss';

/* -------------------------------------------------------------------------- */

/**
 * Toast 컨텍스트 생성
 * @instance
 */
const ToastContext = createContext();

/* -------------------------------------------------------------------------- */

/**
 * Toast 위치 설정 유티릴티 함수
 */
function getPositionClassName(position) {
  switch (position.toLowerCase()) {
    default:
    case 'topright':
      return topRight;
    case 'topleft':
      return topLeft;
    case 'bottomleft':
      return bottomLeft;
    case 'bottomright':
      return bottomRight;
  }
}

/* -------------------------------------------------------------------------- */

/**
 * Toast 컨텍스트 프로바이더 컴포넌트
 * 모듈 밖에서 접근 가능
 * @function
 */
export const ToastContextProvider = ({ options, children }) => {
  // 전달 속성 병합(mixins)
  const { position, autoHide, autoHideTime } = Object.assign(
    {},
    ToastContext.defaultProps.options,
    options
  );

  /* -------------------------------------------------------------------------- */
  // 상태
  const [ toastList, setToastList ] = useState([]);

  /* -------------------------------------------------------------------------- */
  // 사이드 이펙트
  useEffect(
    () => {
      let timeoutId = null;

      // 자동 재생이 설정된 경우
      if (autoHide && toastList.length > 0) {
        window.setTimeout(() => {
          setToastList((toastList) => toastList.slice(1));
        }, autoHideTime + 300);
      }

      return () => {
        // 컴포넌트가 언마운트 되기 전에 설정된 타임아웃 ID를 통해 클린업
        window.clearTimeout(timeoutId);
      };
    },
    [ toastList, autoHide, autoHideTime ]
  );

  // 공급 할 (공개) 메서드
  const addToast = useCallback((toast) => {
    setToastList((toastList) => [ ...toastList, toast ]);
  }, []);

  // 렌더링
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {createPortal(
        // 가상 DOM 노드
        <div className={`${zone} ${getPositionClassName(position)}`}>
          {toastList.map((toast, i) => (
            <Toast
              key={`toast-${i}`}
              html={toast.html}
              autoHide={toast.autoHide || autoHide}
              autoHideTime={toast.autoHideTime || autoHideTime}
            />
          ))}
        </div>,
        // 실제 DOM 노드
        document.getElementById('toastZone')
      )}
    </ToastContext.Provider>
  );
};

// 전달 속성 기본 값
ToastContext.defaultProps = {
  options: {
    autoHide: true,
    autoHideTime: 3000,
    position: 'topRight',
  },
};

/* -------------------------------------------------------------------------- */

// 컨텍스트 기본 내보내기
export default ToastContext;
