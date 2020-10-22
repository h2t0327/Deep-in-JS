class Koa {
	constructor() {
		this.middlewares = []
	}
	use(middleware) {
		this.middlewares.push(middleware)
	}
	start({ req }) {
		const composed = composeMiddlewares(this.middlewares)
		const ctx = { req, res: undefined }
		return composed(ctx)
	}
}

function composeMiddlewares(middlewares) {
	return function wrapMiddlewares(ctx) {
		// 记录当前运行的middleware的下标
		let index = -1
		function dispatch(i) {
			// index向后移动
			index = i

			// 找出数组中存放的相应的中间件
			const fn = middlewares[i]

			// 最后一个中间件调用next 也不会报错
			if (!fn) {
				return Promise.resolve()
			}

			return Promise.resolve(
				fn(
					// 继续传递ctx
					ctx,
					// next方法，允许进入下一个中间件。
					() => dispatch(i + 1)
				)
			)
		}
		// 开始运行第一个中间件
		return dispatch(0)
	}
}


const app = new Koa()

app.use(async(ctx,next) => {
    try {
        await next()
    } catch (error) {
        console.log('[koa error]: ${error.message}')
    }
})