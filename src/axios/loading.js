import { Loading } from 'element-ui'
import assign from 'lodash/assign'
import debounce from 'lodash/debounce'
class GlobalLoading {
    constructor() {
        this.loading = null
        this.requestQuantity = 0
    }
    show(config) {
        if(this.requestQuantity === 0 && !this.loading) {
            this.loading = Loading.service(assign({
                    lock: true,
                    text: '加载中...',
                    target: 'body'
                }, config)
            )
        }
    }
    close() {
        this.requestQuantity--
        this.requestQuantity = Math.max(this.requestQuantity, 0)
        if (this.requestQuantity === 0 && this.loading) {
            const that = this;
            debounce(function() {
                that.loading.close()
                that.loading = null
            }, 300)()
        }
    }
}

export default GlobalLoading