function compose(...funcs) {
	return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

function createStore(reducer, middlewares) {
	let currentState

	function dispatch(action) {
		currentState = reducer(currentState, action)
	}

	function getState() {
		return currentState
	}
	// 初始化一个随意的dispatch，要求外部在type匹配不到的时候返回初始状态
	// 在这个dispatch后 currentState就有值了。
	dispatch({ type: 'INIT' })

	let enhancedDispatch = dispatch
	// 如果第二个参数传入了middlewares
	if (middlewares) {
		// 用compose把middlewares包装成一个函数
		// 让dis
		enhancedDispatch = compose(...middlewares)(dispatch)
	}

	return {
		dispatch: enhancedDispatch,
		getState,
	}
}

// 使用

const otherDummyMiddleware = (dispatch) => {
	// 返回一个新的dispatch
	return (action) => {
		console.log(`type in dummy is ${type}`)
		return dispatch(action)
	}
}

// 这个dispatch其实是otherDummyMiddleware执行后返回otherDummyDispatch
const typeLogMiddleware = (dispatch) => {
	// 返回一个新的dispatch
	return ({ type, ...args }) => {
		console.log(`type is ${type}`)
		return dispatch({ type, ...args })
	}
}

// 中间件从右往左执行。
const counterStore = createStore(counterReducer, [typeLogMiddleware, otherDummyMiddleware])

console.log(counterStore.getState().count)
counterStore.dispatch({ type: 'add', payload: 2 })
console.log(counterStore.getState().count)

// 输出：
// 0
// type is add
// type in dummy is add
// 2
