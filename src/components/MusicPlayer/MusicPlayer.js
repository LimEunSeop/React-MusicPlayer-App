import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import ReactHowler from 'react-howler'
import raf from 'raf'

// 로딩 SVG
import { ReactComponent as Loading } from 'assets/Loading.svg'

// 스타일 모듈(CSS, SASS) 활용
import styles from './MusicPlayer.module.scss'
import classNames from 'classnames/bind'

// 스타일 클래스 모듈 이름 바인딩 -> 함수
const cn = classNames.bind(styles)

/**
 * 뮤직 플레이어 컴포넌트
 * @class
 */
class MusicPlayer extends Component {
  /* -------------------------------------------------------------------------- */
  // @public
  /* -------------------------------------------------------------------------- */

  // 플레이어 참조
  player = null
  // progressPercent 사이드이펙트 처리하기 위한 변수
  progressPercent = 0
  // progressBar Ref 참조
  progressBarRef = createRef(null)

  // 상태
  state = {
    // 로딩
    loading: false,
    // 오류
    error: null,
    // 플레이리스트
    playlist: [],
    // 인덱스
    index: 0,
    // 재생
    isPlaying: false,
    // 진행율
    progressPercent: 0,
  }

  /* -------------------------------------------------------------------------- */
  // @private
  /* -------------------------------------------------------------------------- */

  // raf 참조 (requestAnimationFrame 해제를 위해 필요)
  _raf = null

  /* -------------------------------------------------------------------------- */
  // @static
  /* -------------------------------------------------------------------------- */

  // 전달 속성 검사
  static propTypes = {
    api: PropTypes.string.isRequired,
  }

  // 기본 전달 속성
  static defaultProps = {
    // 모드
    loop: false,
    mute: false,
    volume: 1,
    html5: true,
    // 커스텀 이벤트
    onPlay: null,
    onPause: null,
    onVolume: null,
    onStop: null,
    onLoad: null,
    onLoadError: null,
    onEnd: null,
  }

  /* -------------------------------------------------------------------------- */
  // 라이프 사이클 훅
  /* -------------------------------------------------------------------------- */
  // 마운트 이후 1회 실행
  componentDidMount() {
    // 플레이리스트 데이터 패치 요청(비동기) 메서드 실행
    this.fetchPlaylist(this.props.api)
  }

  // 언마운드 이전 1회 실행
  componentWillUnmount() {
    // raf 설정 해제 메서드 실행
    this._cancelRAF()
  }

  /* -------------------------------------------------------------------------- */
  // 메서드
  /* -------------------------------------------------------------------------- */
  // 플레이리스트 데이터 패치 요청(비동기) 메서드
  fetchPlaylist = () => {
    const { api } = this.props

    // '로딩 중'으로 변경
    this.setState({ loading: true })

    // 플레이리스트 데이터 요청
    fetch(api)
      // 응답(성공)
      .then((response) => response.json())
      .then(({ playlist }) => {
        // '로딩 완료'로 변경
        // playlist(배열) 업데이트
        // this.setState({ loading: false, playlist });

        // 시간 지연 시뮬레이션
        window.setTimeout(
          () => this.setState({ loading: false, playlist }),
          800
        )
      })
      // 응답(실패)
      .catch((error) => this.setState({ error }))
  }

  // 현재 재생 곡 정보 반환 메서드
  getSongInfo = () => {
    const dummySongInfo = {
      title: '',
      singer: '',
      src: '',
      cover: '',
    }

    return this.state.playlist[this.state.index] || dummySongInfo
  }

  // 재생 곡의 진행율(%) 값을 구하는 메서드
  getProgressPercent = () => {
    const { player } = this
    // 진행율(%) = 오디오 현재재생시간(currentTime, seek) ÷ 오디오 지속시간(duration) × 100
    return Math.floor((player.seek() / player.duration()) * 100)
  }

  // 재생 중 탐색 위치 업데이트 메서드
  updateSeek = () => {
    // 상태 추출
    const { isPlaying } = this.state

    // 사이드이펙트 적용
    this.progressPercent = this.getProgressPercent()
    this.progressBarRef.current.style.width = this.progressPercent + '%'

    // 재생 중인 상태: 재귀 호출 (raf 활용)
    // 일시정지 상태: 호출 종료
    if (isPlaying) {
      // requestAnimationFrame()을 사용해
      // updateSeek 재귀 호출
      // _raf에 참조
      this._raf = raf(this.updateSeek)
    } else {
      this._cancelRAF()
    }
  }

  // raf 설정 해제 메서드
  _cancelRAF = () => {
    // raf 설정 해제: 대기중인 애니메이션 프레임 콜백을 제거
    // (취소하지 않으면 대기중인 다른 콜백이 계속 호출 됨)
    // 참고: https://www.npmjs.com/package/raf#rafcancelhandle
    raf.cancel(this._raf)
  }

  /* -------------------------------------------------------------------------- */
  // 이벤트 핸들러 메서드
  /* -------------------------------------------------------------------------- */
  // 곡 재생, 일시정지 토글 이벤트 핸들러 메서드
  handlePlayPauseToggle = () => {
    // 상태 업데이트
    this.setState(
      ({ isPlaying }) => ({
        isPlaying: !isPlaying,
      }),
      // 상태 업데이트 후, 콜백 함수 실행
      () => {
        this._raf = raf(this.updateSeek)
      }
    )
  }

  // 이전 곡 탐색 이벤트 핸들러 메서드
  handlePrev = () => {
    this.setState(({ index, playlist }) => ({
      index: --index < 0 ? playlist.length - 1 : index,
    }))
  }

  // 다음 곡 탐색 이벤트 핸들러 메서드
  handleNext = () => {
    this.setState(({ index, playlist }) => ({
      index: ++index > playlist.length - 1 ? 0 : index,
    }))
  }

  // 탐색 위치 업데이트 메서드
  handleChangeSeekPosition = (e) => {
    // <이벤트 풀링>
    // 참고: https://ko.reactjs.org/docs/events.html#event-pooling
    //
    // React 앱에서 e.clientX 값에 접근하고자 할 경우 설정
    e.persist()

    // player 추출
    const { player } = this

    // 이벤트 대상 객체의 디멘션 정보 값
    const targetRect = e.target.getBoundingClientRect()
    // 클릭한 지점 X 위치 = 마우스 클릭 X 위치 값 - progress DOM 요소의 viewport 왼쪽으로부터 X 위치 값
    const clickX = e.clientX - targetRect.x
    // 진행율 = 클릭한 지점 X 위치 ÷ progres DOM 요소의 너비(width)
    const progressValue = clickX / targetRect.width
    // seek 값 = 오디오 지속시간(duration) * 진행율
    const changeSeekValue = player.duration() * progressValue

    // player 탐색 위치 업데이트
    player.seek(changeSeekValue)
  }

  // 재생 종료 후 다음 곡 재생 메서드
  handleEnded = () => {
    const { playlist } = this.state
    const { onEnd } = this.props

    this.setState(
      ({ index }) => ({
        index: ++index > playlist.length - 1 ? 0 : index,
      }),
      () => onEnd && onEnd(this.getSongInfo())
    )
  }

  /* -------------------------------------------------------------------------- */
  // 렌더 메서드
  /* -------------------------------------------------------------------------- */
  render() {
    // 상태 추출
    const { loading, error, isPlaying } = this.state

    // 전달 속성 추출
    const {
      loop,
      mute,
      volume,
      html5,
      onPlay,
      onPause,
      onVolume,
      onStop,
      onLoad,
      onLoadError,
    } = this.props

    // 로딩 중...
    if (loading) {
      return <Loading title="앱을 로딩 하고 있습니다." />
    }

    // 오류 처리
    if (error) {
      console.error(error.message)
      return <div className="error">오류 알림 View 제공 필요</div>
    }

    // 현재 재생 곡 정보 추출
    const { title, singer, src, cover } = this.getSongInfo()

    // 렌더링 (로딩 완료, 오류가 발생하지 않은 경우)
    return (
      <div
        // .container.playing 상태가 되면 → 상태 진행 바가 UI에 표시
        className={cn({ container: true, playing: isPlaying })}
        role="application"
      >
        {/* 정보 */}
        <div className={cn('info')} role="group">
          <h2 className={cn('title')}>{`${title} - ${singer}`}</h2>
          {/* 진행 표시 줄 */}
          <div
            className={cn('progressBar')}
            onClick={this.handleChangeSeekPosition}
          >
            <div
              className={cn('progress')}
              style={{ width: '0%' }}
              ref={this.progressBarRef}
            />
          </div>
        </div>

        {/* 오디오 → howler.js로 대체 */}
        {/* <audio src="오디오.mp3" preload="auto" /> */}
        {src && (
          <ReactHowler
            src={src}
            playing={isPlaying}
            // 참조
            ref={(ref) => (this.player = ref)}
            // 모드
            loop={loop}
            mute={mute}
            volume={volume}
            html5={html5}
            // 커스텀 이벤트
            onPlay={onPlay}
            onPause={onPause}
            onVolume={onVolume}
            onStop={onStop}
            onLoad={onLoad}
            onLoadError={onLoadError}
            // 컴포넌트 이벤트 헨들러 메서드를 연결한 경우
            onEnd={this.handleEnded}
          />
        )}

        {/* 커버 */}
        <figure className={cn('coverWrapper')}>
          <img src={cover} alt="" className={cn('cover')} />
        </figure>

        {/* 컨트롤러 */}
        <div className={cn('controller')}>
          <button
            className={cn('button')}
            aria-label="이전 곡 재생"
            title="이전 곡 재생"
            onClick={this.handlePrev}
          >
            <i aria-hidden="false" className="fas fa-backward" />
          </button>

          {/* 재생 상태 변경: 곡 재생 ←→ 곡 정지 */}
          <button
            className={cn(['button', 'bigSize'])}
            aria-label={isPlaying ? '곡 일시정지' : '곡 재생'}
            title={isPlaying ? '곡 일시정지' : '곡 재생'}
            onClick={this.handlePlayPauseToggle}
          >
            {/* 재생 상태 변경: fa-play ←→ fa-pause */}
            <i
              aria-hidden="false"
              className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}
            />
          </button>

          <button
            className={cn('button')}
            aria-label="다음 곡 재생"
            title="다음 곡 재생"
            onClick={this.handleNext}
          >
            <i aria-hidden="false" className="fas fa-forward" />
          </button>
        </div>
      </div>
    )
  }
}

export default MusicPlayer
