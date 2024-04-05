import "./styles.css";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Rect, Group, Stage, Layer, Line, Circle } from "react-konva";

const strokeWidth = 20;

export default function App() {
  const [points, setPoints] = useState([100, 100, 100, 300]);
  const [animationId, setAnimationId] = useState("none");
  const [rotation, setRotation] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [adjustedPoints, setAdjustedPoints] = useState([]);
  // const [isDraggingHandler, setIsDraggingHandler] = useState(false);
  const isDraggingHandlerRef = useRef(false);

  const calculateGroupMetrics = (points) => {
    let minX = Math.min(points[0], points[2]);
    let maxX = Math.max(points[0], points[2]);
    let minY = Math.min(points[1], points[3]);
    let maxY = Math.max(points[1], points[3]);
    // Tính toán rotation dựa trên hai điểm
    // const dx = points[2] - points[0];
    // const dy = points[3] - points[1];
    // const angleRad = Math.atan2(dy, dx);
    // const angleDeg = angleRad * (180 / Math.PI);

    return {
      x: minX - strokeWidth / 2,
      y: minY - strokeWidth / 2,
      width: maxX - minX + strokeWidth,
      height: maxY - minY + strokeWidth,
      // rotation: angleDeg,
    };
  };

  // const metrics = calculateGroupMetrics(points);
  // const adjustedPoints = points.map((point, index) =>
  //   index % 2 === 0 ? point - metrics.x : point - metrics.y
  // );

  useEffect(() => {
    const newMetrics = calculateGroupMetrics(points);
    const newAdjustedPoints = points.map((point, index) =>
      index % 2 === 0 ? point - newMetrics.x : point - newMetrics.y
    );
    setMetrics(newMetrics);
    setAdjustedPoints(newAdjustedPoints);
  }, [points, metrics]);

  const handleDragMoveHandler = (index, e) => {
    e.evt.stopPropagation();
    e.evt.preventDefault();
    isDraggingHandlerRef.current = true;
    console.log("Call handleDragMoveHandler");
    const newPoints = [...points];
    if (index === 0 || index === 1) {
      // Nếu là điểm đầu tiên của Line
      newPoints[0] = e.target.x() + e.target.getParent().x();
      newPoints[1] = e.target.y() + e.target.getParent().y();
    } else {
      // Nếu là điểm cuối cùng của Line
      newPoints[2] = e.target.x() + e.target.getParent().x();
      newPoints[3] = e.target.y() + e.target.getParent().y();
    }
    setPoints(newPoints);
  };

  const handleDragMoveGroup = (e) => {
    e.evt.stopPropagation();
    if (isDraggingHandlerRef.current) return;
    console.log("Call handleDragMoveGroup");
  };

  const handleDragEndGroup = (e) => {
    if (isDraggingHandlerRef.current) return;
    // Khi việc kéo Group kết thúc, tính toán và cập nhật trạng thái
    const { x, y } = e.target.position();
    // Tính toán chênh lệch dựa trên vị trí mới so với metrics hiện tại
    const dx = x - metrics.x;
    const dy = y - metrics.y;
    // Áp dụng sự chênh lệch này cho mỗi điểm trong points để cập nhật vị trí
    const newPoints = points.map((point, index) =>
      index % 2 === 0 ? point + dx : point + dy
    );
    setPoints(newPoints);
    // Sau khi cập nhật points, cập nhật metrics một cách hiệu quả
    setMetrics(calculateGroupMetrics(newPoints));
    console.log("Call handleDragEndGroup");
  };

  const handlePlayAnimation = () => {};
  console.log(metrics);
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
        <p>Rotation: {rotation}</p>
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
            <Group
              draggable
              x={metrics.x}
              y={metrics.y}
              onDragMove={handleDragMoveGroup}
              onDragEnd={handleDragEndGroup}
              // rotation={metrics.rotation}
            >
              <Rect
                width={metrics?.width}
                height={metrics?.height}
                stroke="lightblue"
                strokeWidth={1}
              />
              <Line
                points={adjustedPoints}
                stroke="black"
                strokeWidth={strokeWidth}
                lineCap="round"
                lineJoin="round"
              />
              {adjustedPoints.map((point, i) =>
                i % 2 === 0 ? (
                  <Circle
                    draggable
                    key={i}
                    x={adjustedPoints[i]}
                    y={adjustedPoints[i + 1]}
                    radius={6}
                    fill="red"
                    onDragStart={() => (isDraggingHandlerRef.current = true)}
                    onDragMove={(e) => handleDragMoveHandler(i, e)}
                    onDragEnd={() => (isDraggingHandlerRef.current = false)}
                  />
                ) : null
              )}
            </Group>
          </Layer>
        </Stage>
      </div>
    </>
  );
}
