import "./styles.css";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Rect, Stage, Layer, Line, Circle } from "react-konva";
import { animated } from "@react-spring/konva";
import useGroupAnimation from "./useGroupAnimation";

const strokeWidth = 20;

export default function App() {
  const [playingAnimation ,setPlayingAnimation] = useState(false);
  const [animationId, setAnimationId] = useState("none");

  // vị trí của line so với trục xy của canvas
  const [points, setPoints] = useState([0, 0, 50, 50]);
  const [rotation, setRotation] = useState(0);
  const [groupMetrics, setGroupMetrics] = useState({});

  // vị trí của line so với trục xy ở trong group chứa nó
  const [adjustedPoints, setAdjustedPoints] = useState([]);

  const isDraggingHandlerRef = useRef(false);
  const containerRef = useRef(null);
  const lineRef = useRef(null);

  const calculateGroupMetrics = (points) => {
    let minX = Math.min(points[0], points[2]);
    let maxX = Math.max(points[0], points[2]);
    let minY = Math.min(points[1], points[3]);
    let maxY = Math.max(points[1], points[3]);
    // Tính toán rotation dựa trên hai điểm
    const dx = points[2] - points[0];
    const dy = points[3] - points[1];
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    return {
      x: minX - strokeWidth / 2,
      y: minY - strokeWidth / 2,
      width: maxX - minX + strokeWidth,
      height: maxY - minY + strokeWidth,
      rotation: angleDeg,
    };
  };

  useEffect(() => {
    updateStatesLine(points);
  }, []);

  const animationRef = {
    x: groupMetrics?.x,
    y: groupMetrics?.y,
    width: groupMetrics?.width,
    height: groupMetrics?.height,
  }
  const { animation } = useGroupAnimation(animationRef, animationId, playingAnimation, setPlayingAnimation);

  const handleDragMoveHandler = (index, e) => {
    e.evt.stopPropagation();
    e.evt.preventDefault();
    isDraggingHandlerRef.current = true;
    console.log("Call handleDragMoveHandler");
    const newPoints = [...points];
    if (index === 0 || index === 1) {
      // Nếu là điểm đầu tiên của Line
      newPoints[0] = +(e.target.x() + e.target.getParent().x()).toFixed(1);
      newPoints[1] = +(e.target.y() + e.target.getParent().y()).toFixed(1);
    } else {
      // Nếu là điểm cuối cùng của Line
      newPoints[2] = +(e.target.x() + e.target.getParent().x()).toFixed(1);
      newPoints[3] = +(e.target.y() + e.target.getParent().y()).toFixed(1);
    }
    updateStatesLine(newPoints);
  };

  const handleDragStartLine = (e) => {
    e.evt.stopPropagation();
    if (isDraggingHandlerRef.current) return;
  }

  const handleDragMoveLine = (e) => {
    e.evt.stopPropagation();
    if (isDraggingHandlerRef.current) return;
    const node = lineRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    // Get the delta in position
    const dx = +(node.x() * scaleX).toFixed(1);
    const dy = +(node.y() * scaleY).toFixed(1);
    // Update the line's points based on the delta
    const newPoints = points.map((point, idx) => {
      if (idx % 2 === 0) {
        return +(point + dx).toFixed(1);
      } else {
        return +(point + dy).toFixed(1);
      }
    });
    console.log("newPoints",newPoints);
    // Reset the position after movement to keep the line's control within the group
    node.position({ x: 0, y: 0 });
    updateStatesLine(newPoints);
  };

  const handleDragEndLine = (e) => {
    e.evt.stopPropagation();
    if (isDraggingHandlerRef.current) return;
  };

  const updateStatesLine = (points) => {
    const newMetrics = calculateGroupMetrics(points);
    const newAdjustedPoints = points.map((point, index) =>
      index % 2 === 0 ? point - newMetrics.x : point - newMetrics.y
    );
    setPoints(points);
    setGroupMetrics(newMetrics);
    setAdjustedPoints(newAdjustedPoints);
  }

  const handlePlayAnimation = () => {
    setPlayingAnimation(true);
  };
  // console.log(metrics);
  console.log(adjustedPoints);

  return (
    <>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={handlePlayAnimation}>Play</button>
        <select
          name="animation-id"
          value={animationId}
          onChange={(e) => setAnimationId(e.target.value)}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="wipe">Wipe</option>
          <option value="baseline">Baseline</option>
          <option value="rise">Rise</option>
          <option value="pan">Pan</option>
          <option value="pop">Pop</option>
          <option value="neon">Neon</option>
        </select>
        <p>Rotation: {groupMetrics?.rotation}</p>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 20,
        }}
      >
        <Stage width={500} height={500}>
          <Layer>
            <Rect width={500} height={500} fill="#efefef" />
            <animated.Group
              ref={containerRef}
              x={groupMetrics.x}
              y={groupMetrics.y}
              width={groupMetrics.width}
              height={groupMetrics.height}            
              {...(animation.animating && { ...animation.props})}
              {...((animation.preparing || animation.finished) && { opacity: 0 })}
              // rotation={groupMetrics.rotation}
            >
              <Rect
                strokeWidth={1}
                stroke="lightblue"
                width={groupMetrics?.width}
                height={groupMetrics?.height}
              />
              <Line
                draggable
                ref={lineRef}
                stroke="black"
                lineCap="round"
                lineJoin="round"
                points={adjustedPoints}
                strokeWidth={strokeWidth}
                onDragStart={handleDragStartLine}
                onDragMove={handleDragMoveLine}
                onDragEnd={handleDragEndLine}
                rotation={0}
              />
              {adjustedPoints.map((point, i) =>
                i % 2 === 0 ? (
                  <Circle
                    draggable
                    key={i}
                    x={adjustedPoints[i]}
                    y={adjustedPoints[i + 1]}
                    radius={6}
                    fill={i === 0 ? "red" : "green"}
                    onDragStart={() => (isDraggingHandlerRef.current = true)}
                    onDragMove={(e) => handleDragMoveHandler(i, e)}
                    onDragEnd={() => (isDraggingHandlerRef.current = false)}
                  />
                ) : null
              )}
            </animated.Group>
          </Layer>
        </Stage>
      </div>
    </>
  );
}
