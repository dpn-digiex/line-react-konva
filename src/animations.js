import { config, easings } from "@react-spring/konva";
import BezierEasing from "bezier-easing";

const DEFAULT_DURATION_SPEED = 2000;
const COVERD_DURATION_TIMEOUT = 200;

export const ANIMATION_ID = {
  NONE: "none",
  FADE: "fade",
  WIPE: "wipe",
  BASELINE: "baseline",
  RISE: "rise",
  POP: "pop",
  ZOOM: "zoom",
  DISCO: "disco",
  NEON: "neon",
  PAN: "pan",
};

export const DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

export const INTERPOLATION_SET = {
  [ANIMATION_ID.DISCO]: {
    range: [0, 0.12, 0.22, 0.44, 0.56, 0.78, 0.88, 1],
    value: [0, 0.6, 0.2, 1, 0, 0.1, 0.3, 1],
  },
  [ANIMATION_ID.NEON]: {
    range: [0, 0.19, 0.2, 0.3, 0.5, 0.6, 0.7, 1],
    value: [0, 1, 0, 1, 0, 1, 0, 1],
  },
  RAW: {
    [ANIMATION_ID.NEON]: {
      LOOP: 8,
      VALUE: [
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 },
        { opacity: 1 },
      ],
    },
  },
};

export const getDefaultProps = ref => {
  return {
    x: ref?.x,
    y: ref?.y,
    width: ref?.width,
    height: ref?.height,
    opacity: ref?.opacity || 1,
    scaleX: ref?.scaleX || 1,
    scaleY: ref?.scaleY || 1,
    clipWidth: ref?.clipWidth * ref?.width || ref?.width || 0,
    clipHeight: ref?.clipHeight * ref?.height || ref?.height || 0,
    clipX: ref?.clipX * ref?.width || 0,
    clipY: ref?.clipY * ref?.height || 0,
    fontSize: ref?.fontSize || 0,
    text: ref?.text || "",
  };
};

export const getConfigGroupInRaw = (animationId, defaultProps, properties) => {
  switch (animationId) {
    case ANIMATION_ID.FADE:
      return {
        from: { ...defaultProps, opacity: 0 },
        to: defaultProps,
        config: {
          ...config.slow,
          precision: 0.016,
          easing: easings.linear,
          duration: properties?.speed || DEFAULT_DURATION_SPEED,
        },
        delay: properties?.delay || 0,
      };

    case ANIMATION_ID.RISE:
      const dRise = 200;
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: { y: defaultProps.y + dRise },
            [DIRECTION.DOWN]: { y: defaultProps.y - dRise },
            [DIRECTION.LEFT]: { x: defaultProps.x + dRise },
            [DIRECTION.RIGHT]: { x: defaultProps.x - dRise },
          }[properties?.direction || DIRECTION.UP],
        },
        to: defaultProps,
        config: {
          easing: BezierEasing(0, 0.78, 0.38, 0.95),
          duration: properties?.speed || DEFAULT_DURATION_SPEED,
        },
        delay: properties?.delay || 0,
      };

    case ANIMATION_ID.PAN:
      const dPan = 200;
      return {
        from: {
          ...defaultProps,
          x: defaultProps.x - dPan,
        },
        to: defaultProps,
        config: {
          easing: BezierEasing(0, 0.78, 0.38, 0.95),
          duration: properties?.speed || DEFAULT_DURATION_SPEED,
        },
        delay: properties?.delay || 0,
      };

    case ANIMATION_ID.POP:
      return {
        from: {
          ...defaultProps,
          width: 0,
          height: 0,
          scaleX: defaultProps.scaleX * 0.5,
          scaleY: defaultProps.scaleY * 0.5,
          offsetX: -defaultProps.width * 0.25,
          offsetY: -defaultProps.height * 0.25,
        },
        to: {
          ...defaultProps,
          width: defaultProps.width,
          height: defaultProps.height,
          scaleX: defaultProps.scaleX,
          scaleY: defaultProps.scaleY,
          offsetX: 0,
          offsetY: 0,
        },
        config: {
          mass: 0.8,
          tension: 180,
          friction: 10,
          precision: 0.001,
        },
        delay: properties?.delay || 0,
      };

    case ANIMATION_ID.BASELINE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipHeight: 0,
              height: 0,
              offsetY: -defaultProps.height,
            },
            [DIRECTION.DOWN]: {
              clipHeight: 0,
              height: 0,
              clipY: defaultProps.clipHeight + defaultProps.clipY,
              y: defaultProps.y,
              offsetY: defaultProps.height,
            },
            [DIRECTION.LEFT]: {
              clipWidth: 0,
              width: 0,
              offsetX: -defaultProps.width,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: 0,
              width: 0,
              clipX: defaultProps.clipWidth + defaultProps.clipX,
              x: defaultProps.x,
              offsetX: defaultProps.width,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
              offsetY: 0,
            },
            [DIRECTION.DOWN]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
              clipY: defaultProps.clipY,
              y: defaultProps.y,
              offsetY: 0,
            },
            [DIRECTION.LEFT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              offsetX: 0,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              clipX: defaultProps.clipX,
              x: defaultProps.x,
              offsetX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        config: {
          easing: easings.easeOutCirc,
          duration: properties?.speed || DEFAULT_DURATION_SPEED,
        },
        delay: properties?.delay || 0,
      };

    case ANIMATION_ID.ZOOM:
      return {
        from: {
          ...defaultProps,
          // scaleX: 2,
          // scaleY: 2,
          // offsetX: defaultProps.width * 0.25,
          // offsetY: defaultProps.height * 0.25,
          clipWidth: defaultProps.width * 0.5,
          clipHeight: defaultProps.height * 0.5,
          clipX: defaultProps.width * 0.25,
          clipY: defaultProps.height * 0.25,
        },
        to: {
          ...defaultProps,
          // scaleX: 1,
          // scaleY: 1,
          // offsetX: 0,
          // offsetY: 0,
          clipWidth: defaultProps.width,
          clipHeight: defaultProps.height,
          clipX: 0,
          clipY: 0,
        },
        config: {
          easing: easings.linear,
          duration: 3000,
        },
        delay: properties?.delay || 0,
      };

    case ANIMATION_ID.WIPE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipHeight: 0,
              height: 0,
              clipY: defaultProps.clipHeight + defaultProps.clipY,
            },
            [DIRECTION.DOWN]: { clipHeight: 0, height: 0 },
            [DIRECTION.LEFT]: {
              clipWidth: 0,
              width: 0,
              clipX: defaultProps.clipWidth + defaultProps.clipX,
            },
            [DIRECTION.RIGHT]: { clipWidth: 0, width: 0 },
          }[properties?.direction || DIRECTION.RIGHT],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
            },
            [DIRECTION.DOWN]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
            },
            [DIRECTION.LEFT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
            },
          }[properties?.direction || DIRECTION.RIGHT],
        },
        config: {
          easing: easings.easeOutCubic,
          duration: properties?.speed || DEFAULT_DURATION_SPEED,
        },
      };

    case ANIMATION_ID.NEON:
      const NEON = INTERPOLATION_SET.RAW[ANIMATION_ID.NEON];
      return {
        from: defaultProps,
        to: NEON.VALUE.map(value => ({
          ...defaultProps,
          ...{ opacity: value.opacity * (defaultProps?.opacity || 1) },
        })),
        config: {
          duration: (properties?.speed || DEFAULT_DURATION_SPEED) / NEON.LOOP,
        },
        delay: properties?.delay || 0,
      };

    default:
      return {
        from: defaultProps,
        to: defaultProps,
      };
  }
};