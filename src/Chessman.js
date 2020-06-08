import React from 'react'
import { DraggableCore } from 'react-draggable'
import { Resizable } from 're-resizable'
import _ from 'lodash'

class Chessman extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      originalX: props.defaultPosition.x,
      originalY: props.defaultPosition.y,
      x: props.defaultPosition.x,
      y: props.defaultPosition.y,
      width: props.defaultSize.width,
      height: props.defaultSize.height,
      isDraging: false,
      isResizing: false,
    }
  }
  // 拖拽中非受控
  static getDerivedStateFromProps(props, state) {
    const { isDraging, isResizing } = state
    if (isDraging || isResizing) {
      return null
    }
    return {
      originalX: props.defaultPosition.x,
      originalY: props.defaultPosition.y,
      x: props.defaultPosition.x,
      y: props.defaultPosition.y,
      width: props.defaultSize.width,
      height: props.defaultSize.height
    }
  }
  static defaultProps = {
    defaultPosition: { x: 0, y: 0 },
    defaultSize: { width: 0, height: 0 }
  }
  onDragStart = (e, b) => {
    const { x, y } = this.state
    this.lastX = b.lastX - x
    this.lastY = b.lastY - y
    this.props.init(this.props.id)
    this.setState({ isDraging: true })
  }
  onDrag = (e, b) => {
    const { width, height } = this.state
    const dragX = b.lastX - this.lastX
    const dragY = b.lastY - this.lastY
    const { x, y } = this.props.getOffsetPosition({
      id: this.props.id,
      width,
      height,
      x: dragX,
      y: dragY
    })
    this.setState({ x, y, originalX: x, originalY: y })
    this.props.onDrawLine({
      id: this.props.id,
      x,
      y,
      width,
      height
    })
  }
  onDragStop = (e, b) => {
    const { width, height, x, y } = this.state
    this.props.reset({
      id: this.props.id,
      x, y, height, width
    })
    this.setState({ isDraging: false })
  }
  onResizeStart = (e) => {
    e.stopPropagation()
    this.props.init(this.props.id)
    this.setState({ isResizing: true })
  }
  onResize = (e, direction, ref, d) => {
    const { x, y, originalX, originalY, width, height } = this.state
    let resizeOffsetX = x, resizeOffsetY = y
    switch (direction) {
      case 'top':
        resizeOffsetY = originalY - d.height
        break;
      case 'left':
        resizeOffsetX = originalX - d.width
        break;
      case 'topLeft':
        resizeOffsetX = originalX - d.width
        resizeOffsetY = originalY - d.height
        break;
      case 'topRight':
        resizeOffsetY = originalY - d.height
        break;
      case 'bottomLeft':
        resizeOffsetX = originalX - d.width
        break;
      default:
        break;
    }
    this.setState({
      x: resizeOffsetX,
      y: resizeOffsetY,
    })
    this.props.onDrawLine({
      id: this.props.id,
      x: resizeOffsetX,
      y: resizeOffsetY,
      width: width + d.width,
      height: height + d.height,
    })
  }
  onResizeStop = (e, direction, ref, d) => {
    const { width, height, x, y } = this.state
    this.setState({
      originalX: x,
      originalY: y,
      width: width + d.width,
      height: height + d.height,
      isResizing: false
    })
    this.props.reset({
      id: this.props.id,
      x, y,
      width: width + d.width,
      height: height + d.height
    })
  }

  render() {
    const { x, y, width, height } = this.state
    const { disabled = false, isTop, children, draggabelProps, resizableProps, active } = this.props
    const style = {
      ...children.props.style,
      position: 'absolute',
      zIndex: isTop ? 10 : 9,
      transform: `translate(${x}px,${y}px)`,
      opacity: active ? 0.5 : 1
    }
    const enable = disabled ? {
      top: false, right: false, bottom: false, left: false,
      topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
    } : {
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
      }
    return (
      <DraggableCore
        grid={[1, 1]}
        disabled={disabled}
        allowAnyClick={true}
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        {...draggabelProps}
      >
        <Resizable
          style={style}
          bounds="parent"
          enable={enable}
          size={{ width, height }}
          onResizeStart={this.onResizeStart}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          {...resizableProps}
        >
          {this.props.children}
        </Resizable>
      </DraggableCore>
    )
  }
}

export default Chessman