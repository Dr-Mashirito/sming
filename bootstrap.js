
// 스밍봇 api 부트스트랩 스크립트
// 최초작성: 2018-10-03 by 닥터마시리트
class SmingApi {

	constructor() {
		if (SmingApi._instance) return SmingApi._instance;

		this.ver = '1.0';
		this._invokeQueue = [];
		SmingApi._instance = this;
	}

	// script에서 호출
	async _beginInvoke (methodName, methodParams) {
		return new Promise((resolve, reject) => {
			const invoke = {
				'invokeId': '_' + Math.random().toString(36).substr(2, 9),
				'methodName': methodName,
				'methodParams': methodParams,
				'resolve': resolve,
				'reject': reject
			};

			this._invokeQueue.push(invoke);
		});
	}

	// selenium에서 호출
	_endInvoke (jsonResult) {
		const invokeResult = JSON.parse(jsonResult);

		// 지난 호출에 대해 resolve
		try {
			const i = this._invokeQueue.findIndex(x => x.invokeId === invokeResult.invokeId);

			if (i > -1) {
				const invoke = this._invokeQueue[i];
				this._invokeQueue.splice(i, 1);

				if (invokeResult && invokeResult.success) {
					invoke.resolve(invokeResult.data);
				} else {
					invoke.reject(invokeResult && invokeResult.data);
				}
			}
		} catch (e) { }
	}

	// selenium에서 호출
	async _executeMain (arg) {
		try {
			if (typeof arg === 'string')
				try {
					arg = JSON.parse(arg);
				} catch (e) { }

			const res = await main(arg);
			this._beginInvoke('finish', { success: true, data: res });
		} catch (err) {
			this._beginInvoke('finish', { success: false, data: err.toString() });
		}
	}

	// [사용자용] js파일 로드
	// 예) await sming.loadScript('https://code.jquery.com/jquery-latest.min.js');
	async loadScript (url) {
		return new Promise(function (resolve, reject) {
			const scripts = document.head.getElementsByTagName('script');
			for (let i = 0; i < scripts.length; i++)
				if (scripts.item(i).src === url) {
					resolve();
					return;
				}

			const _s = document.createElement('script');
			_s.type = 'text/javascript';
			_s.async = true;
			_s.onerror = reject;
			_s.onload = resolve;
			_s.src = url;
			document.head.appendChild(_s);
		});
	};

	// [사용자용] 해당 객체의 특정 이벤트를 기다림. jquery의 one함수와 유사
	// 예) await sming.waitEvent(myPopupWin, 'load');
	async waitEvent (element, eventName) {
		return new Promise((resolve) => {
			const listener = (evt) => {
				element.removeEventListener(eventName, listener);
				resolve(evt);
			};
			element.addEventListener(eventName, listener);
		});
	};

	// [사용자용] 밀리세컨동안 대기
	// 예) await sming.wait(1000);	// 1초 대기
	async wait (ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	};
};

SmingApi._instance = null;	// static

window.sming = new SmingApi();
