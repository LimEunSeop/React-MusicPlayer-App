import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';
import { group, open, message, button } from './Toast.module.scss';

/**
 * Toast 컴포너트
 * @function
 */
const Toast = ({ html, autoHide, autoHideTime }) => {
  // 상태
  const [ visible, setVisible ] = useState(true);

  // 사이드 이펙트
  useEffect(
    () => {
      let timeoutId = null;

      if (autoHide) {
        timeoutId = window.setTimeout(() => {
          setVisible(false);
        }, autoHideTime);
      }

      return () => {
        window.clearTimeout(timeoutId);
      };
    },
    [ autoHide, autoHideTime ]
  );

  // 메서드
  // const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  // 렌더링
  return (
    <div className={`${group} ${visible ? open : ''}`.trim()} role="group">
      <div className={message}>{parser(html)}</div>
      <button type="button" className={button} aria-label="닫기" onClick={hide}>
        ╳
      </button>
    </div>
  );
};

// 전달 속성 검사
Toast.propTypes = {
  html: PropTypes.string.isRequired,
};

// Toast 컴포넌트 기본 내보내기
export default Toast;
