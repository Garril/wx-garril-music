// value 是 被参照字符串，如果keyword的头部出现了value一样的部分
// 那么keyword分成两节点，而且对应的部分设置颜色样式
export default function stringToNodes(keyword, value) {
  const nodes = []
  if(keyword.toUpperCase().startsWith(keyword.toUpperCase())) { // es6 是否以keyword开头
    // 不区分大小写，就全转为大写然后对应
    const key1 = keyword.slice(0,value.length)
    const node1 = {
      name: "span",
      attrs: { style: "color: #26ce8a; font-size: 13px" },
      children: [{ type: "text", text: key1 }]
    }
    nodes.push(node1)
    const key2 = keyword.slice(value.length)
    const node2 = {
      name: "span",
      attrs: { style: "color: #000000; font-size: 13px" },
      children: [{ type: "text", text: key2 }]
    }
    nodes.push(node2)
  } else { // 没匹配上
    const node = {
      name: "span",
      attrs: { style: "color: #000000; font-size: 13px" },
      children: [{ type: "text", text: keyword }]
    }
    nodes.push(node)
  }
  return nodes
}