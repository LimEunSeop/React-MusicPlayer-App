import { useContext } from 'react';
import ToastContext from '../contexts/ToastContext';

/**
 * Toast 컨텍스트 커스텀 훅
 * @function
 */
export default function useToastContext() {
  return useContext(ToastContext);
}
