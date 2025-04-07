import './styles.css'
import React, { useState, useEffect, useRef } from 'react'
import { Rect, Stage, Layer, Line, Circle } from 'react-konva'
import { animated } from '@react-spring/konva'
import useGroupAnimation from './useGroupAnimation'

const STROKE_WIDTH = 20
export const PLAYING_STATUS = {
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED'
}

export default function App() {
  const [playingStatus, setPlayingStatus] = useState(PLAYING_STATUS.STOPPED)
  const [animationId, setAnimationId] = useState('baseline')

  // vị trí của line so với trục xy của canvas
  const [points, setPoints] = useState([50, 50, 200, 200])
  const [rotation, setRotation] = useState(0)
  const [groupMetrics, setGroupMetrics] = useState({})

  // vị trí của line so với trục xy ở trong group chứa nó
  const [adjustedPoints, setAdjustedPoints] = useState([])

  const isDraggingHandlerRef = useRef(false)
  const containerRef = useRef(null)
  const lineRef = useRef(null)

  const calculateGroupMetrics = (points) => {
    let minX = Math.min(points[0], points[2])
    let maxX = Math.max(points[0], points[2])
    let minY = Math.min(points[1], points[3])
    let maxY = Math.max(points[1], points[3])
    // Tính toán rotation dựa trên hai điểm
    const dx = points[2] - points[0]
    const dy = points[3] - points[1]
    const angleRad = Math.atan2(dy, dx)
    const angleDeg = angleRad * (180 / Math.PI)

    return {
      x: minX - STROKE_WIDTH / 2,
      y: minY - STROKE_WIDTH / 2,
      width: maxX - minX + STROKE_WIDTH,
      height: maxY - minY + STROKE_WIDTH,
      rotation: angleDeg
    }
  }

  const updateStatesLine = (points) => {
    const newMetrics = calculateGroupMetrics(points)
    const newAdjustedPoints = points.map((point, index) =>
      index % 2 === 0 ? point - newMetrics.x : point - newMetrics.y
    )
    setPoints(points)
    setGroupMetrics(newMetrics)
    setAdjustedPoints(newAdjustedPoints)
  }

  // const calculateGroupMetrics = (points) => {
  //   const x1 = points[0],
  //     y1 = points[1]
  //   const x2 = points[2],
  //     y2 = points[3]

  //   // Tính độ dài của Line
  //   const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  //   // Trung điểm của Line
  //   const centerX = (x1 + x2) / 2
  //   const centerY = (y1 + y2) / 2

  //   // Tính góc xoay của Line so với trục x ngang
  //   const angleRad = Math.atan2(y2 - y1, x2 - x1)
  //   const angleDeg = angleRad * (180 / Math.PI)

  //   // Tính toán lại tâm của Group dựa trên trung tâm của Line và góc xoay
  //   // Điều này đảm bảo rằng Line luôn nằm giữa chiều cao của Group
  //   return {
  //     x: centerX,
  //     y: centerY,
  //     width: STROKE_WIDTH,
  //     height: lineLength,
  //     rotation: angleDeg
  //   }
  // }

  // const updateStatesLine = (points) => {
  //   const newMetrics = calculateGroupMetrics(points)

  //   // Điều chỉnh tọa độ của các điểm trong Line để chúng nằm đúng vị trí mới của Group đã xoay
  //   // Tọa độ của các điểm được thiết lập sao cho Line nằm giữa Group
  //   const adjustedX1 = -newMetrics.width / 2
  //   const adjustedY1 = -newMetrics.height / 2
  //   const adjustedX2 = newMetrics.width / 2
  //   const adjustedY2 = newMetrics.height / 2
  //   const newAdjustedPoints = [adjustedX1, adjustedY1, adjustedX2, adjustedY2]

  //   setPoints(points)
  //   setGroupMetrics(newMetrics)
  //   setAdjustedPoints(newAdjustedPoints)
  // }

  useEffect(() => {
    updateStatesLine(points)
  }, [])

  const animationRef = {
    x: groupMetrics?.x,
    y: groupMetrics?.y,
    width: groupMetrics?.width,
    height: groupMetrics?.height
  }
  const { animation } = useGroupAnimation(animationRef, animationId, playingStatus, setPlayingStatus)

  const handleDragMoveHandler = (index, e) => {
    e.evt.stopPropagation()
    e.evt.preventDefault()
    isDraggingHandlerRef.current = true
    const newPoints = [...points]
    if (index === 0 || index === 1) {
      // Nếu là điểm đầu tiên của Line
      newPoints[0] = +(e.target.x() + e.target.getParent().x()).toFixed(1)
      newPoints[1] = +(e.target.y() + e.target.getParent().y()).toFixed(1)
    } else {
      // Nếu là điểm cuối cùng của Line
      newPoints[2] = +(e.target.x() + e.target.getParent().x()).toFixed(1)
      newPoints[3] = +(e.target.y() + e.target.getParent().y()).toFixed(1)
    }
    updateStatesLine(newPoints)
  }

  const handleDragStartLine = (e) => {
    e.evt.stopPropagation()
    if (isDraggingHandlerRef.current) return
  }

  const handleDragMoveLine = (e) => {
    e.evt.stopPropagation()
    if (isDraggingHandlerRef.current) return
    const node = lineRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    // Get the delta in position
    const dx = +(node.x() * scaleX).toFixed(1)
    const dy = +(node.y() * scaleY).toFixed(1)
    // Update the line's points based on the delta
    const newPoints = points.map((point, idx) => {
      if (idx % 2 === 0) {
        return +(point + dx).toFixed(1)
      } else {
        return +(point + dy).toFixed(1)
      }
    })
    // Reset the position after movement to keep the line's control within the group
    node.position({ x: 0, y: 0 })
    updateStatesLine(newPoints)
  }

  const handleDragEndLine = (e) => {
    e.evt.stopPropagation()
    if (isDraggingHandlerRef.current) return
  }

  const handlePlayAnimation = () => {
    if (playingStatus === PLAYING_STATUS.PLAYING) {
      setPlayingStatus(PLAYING_STATUS.PAUSED)
    } else {
      console.log('go here')
      setPlayingStatus(PLAYING_STATUS.PLAYING)
    }
  }
  // console.log(metrics);

  return (
    <>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={handlePlayAnimation}>Play</button>
        <select name='animation-id' value={animationId} onChange={(e) => setAnimationId(e.target.value)}>
          <option value='none'>None</option>
          <option value='fade'>Fade</option>
          <option value='wipe'>Wipe</option>
          <option value='baseline'>Baseline</option>
          <option value='rise'>Rise</option>
          <option value='pan'>Pan</option>
          <option value='pop'>Pop</option>
          <option value='neon'>Neon</option>
        </select>
        <p>Rotation: {groupMetrics?.rotation}</p>
      </div>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 20
        }}
      >
        <Stage width={500} height={500}>
          <Layer>
            <Rect width={500} height={500} fill='#efefef' />
            <animated.Group
              ref={containerRef}
              x={groupMetrics.x}
              y={groupMetrics.y}
              width={groupMetrics.width}
              height={groupMetrics.height}
              // rotation={groupMetrics.rotation}
              {...(animation.animating && { ...animation.props })}
              {...((animation.preparing || animation.finished) && { opacity: 0 })}
            >
              <Rect
                strokeWidth={1}
                rotation={rotation}
                stroke='lightblue'
                width={groupMetrics?.width}
                height={groupMetrics?.height}
              />
              <Line
                draggable
                ref={lineRef}
                stroke='black'
                lineCap='round'
                lineJoin='round'
                points={adjustedPoints}
                strokeWidth={STROKE_WIDTH}
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
      </div>
    </>
  )
}
