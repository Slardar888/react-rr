import React from 'react'
import _ from 'lodash'

class Chessboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      chessboardWidth: 0,
      chessboardHeight: 0,
      activeKeys: [],
      currentState: [],
      target: null,
      compare: [],
      hLines: [],
      vLines: [],
    }
    this.refs = React.createRef()
    this.nodes = []
  }

  static defaultProps = {
    limit: 5,
    lineStyle: {}
  }
  static getDerivedStateFromProps(props, state) {
    if (props && props.children) {
      const { children } = props
      // 所有节点
      const nodes = children.map(item => {
        const { props: { id, defaultPosition, defaultSize } } = item

        const node = { id }
        if (defaultPosition) {
          node.x = defaultPosition.x
          node.y = defaultPosition.y
        }
        if (defaultSize) {
          node.width = defaultSize.width
          node.height = defaultSize.height
        }
        return node
      })
      return {
        ...state,
        nodes
      }
    }
    return null
  }
  /** 初始化数据，获取当前拖拽目标和对照组
  * @param {string} id 拖拽目标key
  */
  init = (id) => {
    const { nodes } = this.state
    // 初始化画布
    this.resizeContainer()
    // 拖拽目标原始值
    const target = nodes.filter(item => item.id == id)[0]
    // 对照组
    const compare = nodes.filter(item => item.id != id)
    this.setState({
      target,
      compare
    })
  }
  // 重置
  reset = (id) => {
    const { onChangeStop } = this.props
    const { currentState } = this.state
    if (onChangeStop && _.isFunction(onChangeStop) && !_.isEmpty(currentState)) {
      onChangeStop(id, currentState)
    }
    this.setState({
      activeKeys: [],
      currentState: [],
      vLines: [],
      hLines: [],
    })
  }
  /** 画线&高亮
  * @param {object} currentTarget 拖拽目标实时对象
  */
  onDrawLine = (currentTarget) => {
    const { target, compare } = this.state
    const mergerTarget = {
      ...target,
      ...currentTarget
    }
    // 目标计算节点
    const computeTarget = this.getComputePoints(mergerTarget)
    // 对照计算节点
    const computeCompare = this.getComputePoints(compare)
    // 高亮key
    const activeKeys = []
    // 垂直方向辅助线
    const xlines = computeCompare.map(item => {
      const xline = _.intersectionBy(item.xPoints, computeTarget.xPoints, Math.floor)
      if (!_.isEmpty(xline)) {
        activeKeys.push(item.id)
      }
      return xline
    })
    // 水平方向辅助线
    const ylines = computeCompare.map(item => {
      const yline = _.intersectionBy(item.yPoints, computeTarget.yPoints, Math.floor)
      if (!_.isEmpty(yline)) {
        activeKeys.push(item.id)
      }
      return yline
    })
    // 内部更新
    const currentState = [...compare, mergerTarget]
    this.setState({
      activeKeys: Array.from(new Set(activeKeys)),
      hLines: Array.from(new Set(_.flatten(xlines))),
      vLines: Array.from(new Set(_.flatten(ylines))),
      currentState
    })
    // 获取实时更新数据
    const { onChange } = this.props
    if (onChange && _.isFunction(onChange)) {
      onChange(mergerTarget, currentState)
    }
  }
  // 添加计算属性
  getComputePoints = (arg) => {
    if (arg && _.isArray(arg)) {
      return arg.map(item => ({
        ...item,
        xPoints: [item.x, item.x + item.width / 2, item.x + item.width],
        yPoints: [item.y, item.y + item.height / 2, item.y + item.height]
      }))
    } else {
      return {
        ...arg,
        xPoints: [arg.x, arg.x + arg.width / 2, arg.x + arg.width],
        yPoints: [arg.y, arg.y + arg.height / 2, arg.y + arg.height]
      }
    }
  }

  /** 判断是否可吸附，返回偏移后坐标
  * @param {array} points 对战组点坐标集合
  * @param {object} target 当前拖拽目标 
  * @param {number} limit 可吸附阈值
  */
  setOffsetPosition = (points, target, limit) => {
    // p: 坐标x/y,  ofs:目标宽/高
    const { p, ofs } = target
    if (points && _.isArray(points) && !_.isEmpty(points)) {
      let rep = p
      points.map(item => {
        if (Math.abs(item - p) <= limit) {
          rep = item
        }
        if (Math.abs(item - (p + ofs / 2)) <= limit) {
          rep = item - ofs / 2
        }
        if (Math.abs(item - (p + ofs)) <= limit) {
          rep = item - ofs
        }
      })
      return rep
    } else {
      return p
    }
  }
  /** 获取偏移后坐标
   * @param {object} target 当前拖拽目标
   */
  getOffsetPosition = (target) => {
    const { x, y, width, height } = target
    const { chessboardWidth, chessboardHeight, compare } = this.state
    const { limit } = this.props
    const computeCompare = this.getComputePoints(compare)
    const xPoints = Array.from(new Set(_.flatten(computeCompare.map(item => item.xPoints))))
    const yPoints = Array.from(new Set(_.flatten(computeCompare.map(item => item.yPoints))))
    const ofsX = this.setOffsetPosition(xPoints, { p: x, ofs: width }, limit)
    const ofsY = this.setOffsetPosition(yPoints, { p: y, ofs: height }, limit)
    return {
      x: this.checkOffsetPosition(ofsX, width, chessboardWidth),
      y: this.checkOffsetPosition(ofsY, height, chessboardHeight)
    }
  }
  /** 检查是否拖拽出边界
  * @param {number} p 点坐标
  * @param {number} v 当前拖拽目标 宽/高
  * @param {number} max 容器宽/高
  */
  checkOffsetPosition = (p, v, max) => {
    if (p >= 0 && p <= max - v) {
      return p
    } else if (p < 0) {
      return 0
    } else {
      return max - v
    }
  }

  resizeContainer = () => {
    const width = this.refs.clientWidth
    const height = this.refs.clientHeight
    this.setState(state => ({
      chessboardWidth: width,
      chessboardHeight: height
    }))
  }

  componentDidMount() {
    this.resizeContainer()
  }

  renderGuideLine() {
    const { hLines, vLines } = this.state
    const { color, density, ...extra } = this.props.lineStyle
    const style = { position: 'absolute', zIndex: 99, ...extra }
    return (
      <>
        {hLines.map((item, i) => (<div key={i} style={{
          ...style,
          height: '100%',
          transform: 'scaleX(0.5) translateX(-0.25px)',
          background: `linear-gradient(to top, ${color}, ${color} 5px, transparent 5px, transparent)`,
          backgroundSize: `100% ${density}px`,
          left: item,
          width: 1,
        }}></div>))}
        {vLines.map((item, i) => (<div key={i} style={{
          ...style,
          height: 1,
          transform: 'scaleY(0.5) translateY(-0.25px)',
          background: `linear-gradient(to right, ${color}, ${color} 5px, transparent 5px, transparent)`,
          backgroundSize: `${density}px 100%`,
          top: item,
          width: '100%',
        }}></div>))}
      </>
    )
  }

  renderChildrens() {
    const { activeKeys } = this.state
    return (
      <>
        {React.Children.map(this.props.children, (children) => React.cloneElement(
          children,
          {
            key: children.props.id,
            active: activeKeys.includes(children.props.id),
            init: this.init,
            reset: this.reset,
            onDrawLine: this.onDrawLine,
            getOffsetPosition: this.getOffsetPosition
          }
        ))}
      </>
    )
  }

  render() {
    const className = this.props.className ? 'chessboard ' + this.props.className : 'chessboard'
    return (
      <div
        className={className}
        ref={(n) => {
          if (!n) return
          this.refs = n
        }}
        style={{ position: 'relative', ...this.props.style }} >
        <div style={{ width: '100%', height: '100%' }}>
          {this.renderChildrens()}
        </div>
        <div
          style={{ zIndex: 1, width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}
          className="red-line-box">
          {this.renderGuideLine()}
        </div>
      </div>
    )
  }
}

export default Chessboard
