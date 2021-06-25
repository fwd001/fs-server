const Axios = require('axios')
// 服务端地址
const service = Axios.create({
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8' // json数据格式传输
    }
})

// 请求拦截器
service.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data
        return res

    },
    error => Promise.reject(error)
)

module.exports = service