export default class Cookie {
	values() {
		let temp
		let cookies = {}
		let cookie_split = document.cookie.split('; ')
		for (var i = 0; i < cookie_split.length; i++) {
			temp = cookie_split[i].split('=')
			cookies[temp[0]] = decodeURIComponent(temp[1])
		}
		return cookies
	}
	set(name, value, expirationHours = 1) {
		var d = new Date()
		d.setTime(d.getTime() + expirationHours * 60 * 60 * 1000)
		var expires = ';expires=' + d.toUTCString()
		document.cookie = name + '=' + value + expires + ';path=/'
	}

	clear(name) {
		if (this.values()[name] !== '' && this.values()[name] !== null) {
			document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
		}
	}

	keys = {
		LML_TOKEN: 'LMLToken',
		OPC_DOMAIN: 'OPCDomain',
		UID: 'uid',
		UN: 'un',
		LML_TOKEN_TIMESTAMP: 'LMLTokenTimestamp',
		ONV_PINNING: 'onv_pinning'
	}
}

const OnviaCookies = {
	values: () => {
		let temp
		let cookies = {}
		let cookie_split = document.cookie.split('; ')
		for (var i = 0; i < cookie_split.length; i++) {
			temp = cookie_split[i].split('=')
			cookies[temp[0]] = decodeURIComponent(temp[1])
		}
		return cookies
	},
	set: function(name, value, expireHours = 1){
		var d = new Date()
		d.setTime(d.getTime() + expireHours * 60 * 60 * 1000)
		var expires = ';expires=' + d.toUTCString()
		document.cookie = name + '=' + value + expires + ';path=/'
	},
	clear: function(name){
		if (this.values()[name] != '' && this.values()[name] != null) {
			document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
		}
	},
	getUserId: function(){
		return this.values()[this.keys.UID]
	},
	getUsername: function(){
		return this.values()[this.keys.UN]
	}
}
