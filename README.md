# react-rr

### 一个可以拖拽和缩放并且显示对齐辅助线的React组件

## 安装

`$ npm install --save react-rr`

## 使用

[![demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/angry-lehmann-hj7ib?fontsize=14&hidenavigation=1&theme=dark)

```javascript
import rr from 'react-rr'

const Chessboard = rr.Chessboard
const Chessman = rr.Chessman

class APP extends React.Component {
  state = {
    test: [
      { id: 'a', width: 50, height: 50, x: 0, y: 0 },
      { id: 'b', width: 100, height: 100, x: 100, y: 100 },
      { id: 'c', width: 150, height: 150, x: 200, y: 200 }
    ]
  }
  onChange = (target, data) => {
    // console.log('updata position/size!', target, data)
  }
  onChangeStop = (target, data) => {
    // console.log('stop!', target, data)
    this.setState({ test: data })
  }
  render() {
    return (
      <Chessboard
        onChange={this.onChange}
        onChangeStop={this.onChangeStop}
        limit={5}
        className='custom-chessboard'
        lineStyle={{ color: '#000', density: 10 }}
      >
        {this.state.test.map(item =>
          (<Chessman
            id={item.id}
            key={item.id}
            draggabelProps={{}}
            resizableProps={{}}
            defaultPosition={{ x: item.x, y: item.y }}
            defaultSize={{ width: item.width, height: item.height }}>
            <div className='custom-chessman'>{item.id}</div>
          </Chessman>)
        )}
      </Chessboard>
    )
  }
}
```

```css
.custom-chessboard {
  width : 1200px;
  height: 800px;
  margin: 0 auto;
  border: 1px solid #aaa;
}
.custom-chessman {
  width           : 100%;
  height          : 100%;
  background-color: pink;
  border          : 1px solid #ccc;
  border-radius   : 2px;
}
```

## ChessboardProps

#### `onChange: `
#### `onChangeStop:` 
#### `className:` 
#### `limit:` 拖拽吸附效果临界值
#### `lineStyle: { color, density}` 对齐辅助线颜色与密度

## ChessmanProps

#### `disabled` 布尔值，是否可拖拽与缩放
#### `draggabelProps` - [react-draggable](https://github.com/STRML/react-draggable)
#### `resizableProps` - [re-resizable](https://github.com/bokuweb/re-resizable)
