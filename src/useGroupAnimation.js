import { useCallback, useEffect, useState, useRef } from "react";
import { useSpring, useSpringRef } from "@react-spring/konva";
import { ANIMATION_ID, getDefaultProps, getConfigGroupInRaw } from "./animations";

const useGroupAnimation = (elementRef, animationId, playing, setPlaying) => {
  const [animating, setAnimating] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [finished, setFinished] = useState(false);

  const defaultProps = getDefaultProps(elementRef)

  const playingRef = useRef(false);
  const springRef = useSpringRef(null);

  const [animationProps, api] = useSpring(() => ({
    ref: springRef,
    from: defaultProps,
    to: defaultProps,
    reset: true,
  }));

  useEffect(() => {
    if (playing && animationId !== "none") {
      playAnimationIn(animationId);
    }
  }, [playing]);

  const playAnimationIn = (animationId) => {
    playingRef.current = true;
    setPreparing(true);
    return new Promise(resolve => {
      api.start({
        ...getConfigGroupInRaw(animationId, defaultProps),
        delay: 0,
        reset: true,
        onStart: () => {
          if (playingRef.current) {
            setPreparing(false);
            setAnimating(true);
          }
        },
        onRest: () => {
          if (playingRef.current) {
            setPreparing(false);
            setAnimating(false);
            setPlaying(false);
          }
          resolve();
        },
      });
    });
  };

  const pauseAnimation = () => {
    setIsPaused(true);
    api.pause();
  };

  const resumeAnimation = () => {
    setIsPaused(false);
    api.resume();
  };

  const resetAnimation = (props) => {
    setAnimating(false);
    setPreparing(false);
    setFinished(false);
    playingRef.current = false;
    api.stop();
    api.start({
      ...defaultProps,
      ...props,
      offsetX: 0,
      offsetY: 0,
      immediate: true,
    });
  };

  return {
    animation: {
      props: animationProps,
      animating: animating,
      preparing: preparing && !animating,
      finished: finished && !animating,
    },
    animationFunc: {
      pause: pauseAnimation,
      resume: resumeAnimation,
      reset: resetAnimation,
    },
  };
};

export default useGroupAnimation;
