import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Rect, Stage, Layer, Line, Circle } from 'react-konva'

import { animated } from '@react-spring/konva'

const strokeWidth = 20

export default function App() {
  // vị trí của line so với trục xy của canvas
  const [points, setPoints] = useState([0, 0, 100, 100])
  const [groupProps, setGroupProps] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 })

  // vị trí của line so với trục xy ở trong group chứa nó
  const [adjustedPoints, setAdjustedPoints] = useState([])

  const containerRef = useRef(null)
  const lineRef = useRef(null)
  const isDraggingHandlerRef = useRef(false)

  useEffect(() => {
    updateStatesLine(points)
  }, [])

  const handleDragMoveHandler = (index, e) => {
    e.evt.stopPropagation()
    e.evt.preventDefault()
    isDraggingHandlerRef.current = true
  }

  const handleDragStartLine = (e) => {
    e.evt.stopPropagation()
    if (isDraggingHandlerRef.current) return
  }

  const handleDragMoveLine = (e) => {
    e.evt.stopPropagation()
    if (isDraggingHandlerRef.current) return
  }

  const handleDragEndLine = (e) => {
    e.evt.stopPropagation()
    if (isDraggingHandlerRef.current) return
  }

  const updateStatesLine = (points) => {
    // Điểm đầu và điểm cuối của Line
    const x1 = points[0],
      y1 = points[1]
    const x2 = points[2],
      y2 = points[3]

    // Tính toán trung tâm của Line
    const centerX = (x1 + x2) / 2
    const centerY = (y1 + y2) / 2

    // Chiều dài của Line
    const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

    // Tính toán góc xoay để đường Line nằm ngang
    const angleRad = Math.atan2(y2 - y1, x2 - x1)
    const angleDeg = (angleRad * 180) / Math.PI

    // Độ dài thực tế của Group phải tính cả khoảng cách cho handlers
    const totalGroupWidth = lineLength + strokeWidth

    // Cập nhật trạng thái của Group
    setGroupProps({
      x: centerX,
      y: centerY,
      width: totalGroupWidth,
      height: strokeWidth, // Chiều cao phụ thuộc vào strokeWidth
      rotation: angleDeg
    })

    // Điều chỉnh lại các điểm để chúng nằm trong Group đã xoay
    const adjustedX1 = -lineLength / 2
    const adjustedY1 = -strokeWidth / 2
    const adjustedX2 = lineLength / 2
    const adjustedY2 = strokeWidth / 2
    setAdjustedPoints([adjustedX1, adjustedY1, adjustedX2, adjustedY2])
  }

  return (
    <Stage width={500} height={500}>
      <Layer>
        <Rect width={500} height={500} fill='#efefef' />
        <animated.Group
          ref={containerRef}
          x={groupProps.x}
          y={groupProps.y}
          width={groupProps.width}
          height={groupProps.height}
          rotation={groupProps.rotation}
        >
          <Rect strokeWidth={1} stroke='lightblue' width={groupProps.width} height={groupProps.height} />
          <Line
            draggable
            ref={lineRef}
            stroke='black'
            lineCap='round'
            lineJoin='round'
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
                fill={i === 0 ? 'red' : 'green'}
                onDragStart={() => (isDraggingHandlerRef.current = true)}
                onDragMove={(e) => handleDragMoveHandler(i, e)}
                onDragEnd={() => (isDraggingHandlerRef.current = false)}
              />
            ) : null
          )}
        </animated.Group>
      </Layer>
    </Stage>
  )
}
