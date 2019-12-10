const 
	NS='ypAjaxJSON', 
	defOpts = {
		url: './'
	}

/**
 * @constructor
 * @param  {Object} opts {url:'./'}
 */
function ypAjaxJSON(opts) {
	/**
	 * [opts description]
	 * @type {Object}
	 *       url: string
	 */
	this.opts = defOpts 

	if(opts) _extend(this.opts, opts)

	this.xhr = new XMLHttpRequest()
	this.busy = 0
	this.queue = []
}

	function _extend(o1, ov) {
		for(var i in ov) {
			o1[i] = ov[i]
		}
	}

	let ypAjaxJSON_proto = ypAjaxJSON.prototype

	// можно просто данные посылать [string]:string, 
	// можно файлы: [string]:{filename:string, blob:blob}
	let fnQuery

	ypAjaxJSON_proto.query /**  Do POST-request with data
	 * @param  {Object} data Object with POST variables in key:value pairs. If value is Object it stringifies
	 * @param  {function(*):(undefined|boolean)} cb
	 * @this {ypAjaxJSON}   
	 * @return {ypAjaxJSON}
	 */
	 = fnQuery = function(data, cb) {
		var ajax = this, opts = ajax.opts, key, rn="\r\n", reqBody,
			bnd, bndMid, bndLast, xo = ajax.xhr, val


		bnd = NS + String(Math.random()).slice(2)
		bndMid='--' + bnd + rn
		bndLast='--' + bnd + "--" + rn
		


		if(ajax.busy) {
			// занято => ставим в очередь выполнения
			ajax.queue.push({data, cb})
		} else {
			// выполняем само задание
			// xo.onreadystatechange = null
			ajax.busy = 1

			reqBody=[rn]
			for(key in data) {
				// сюда можно встроить функции
				val = data[key]
				if('object'==typeof val) val=JSON.stringify(val)
				reqBody.push('Content-Disposition: form-data; name="' + key + '"'+rn+rn + val + rn);
			}
			reqBody = reqBody.join(bndMid) + bndLast;

			xo.open('POST', opts.url, true)
			xo.setRequestHeader('Content-Type', 'multipart/form-data; boundary='+bnd)
			xo.onreadystatechange = function() {
				if(xo.readyState!=4) return
				var out='', obj, ok=0
				try {
					if(xo.status==200) {
						out = xo.responseText; ok=1
					}
				} catch(e) {}
				ajax.busy = 0
				if(cb) {
					if(out.substr(0,1)=='{') {
						out = JSON.parse(out)
					}
					if(ok && cb.call(ajax, out)===false) ajax.cancel()
				}
				setTimeout(function() { // !!! нужно ли?
					sendQueue(ajax)
				}, 0)
				
			}
			xo.send(reqBody)
		}
		return ajax
	}

	function sendQueue(ajax) {
		var qe
		if((qe=ajax.queue).length) {
			fnQuery.call(ajax, qe[0].data, qe[0].cb)
			ajax.queue = qe.splice(1)
		}
	}

	/**
	 * Cancel current request and clears queue
	 * @this {ypAjaxJSON}
	 * @return {ypAjaxJSON}
	 */
	ypAjaxJSON_proto.cancel = function() {
		var ajax=this
		ajax.xhr.abort()
		ajax.queue = []
		ajax.busy = 0
		return ajax
	}

export default ypAjaxJSON

