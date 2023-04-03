// ==UserScript==
// @name         Ajax请求拦截修改
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Ajax请求拦截修改
// @author       Austin Cheung
// @match        *://*/*
// @grant        none
// ==/UserScript==


(function () {
    var url = '';

    var ruleList = [
        {
            matchStr: 'url匹配字符串',
            matchMode: '匹配模式，contains 包含字符串',
            openMethod: function (xhr, options) {
                // options包含method、url、async，可修改
            },
            sendMethod: function (xhr, options) {
                // options包含body，可修改
                // xhr.setRequestHeader('请求头key', '请求头value');
            }
        }
    ]

    /**
     * 匹配url
     *
     * @param {string} str 匹配字符串
     * @param {string} mode 匹配模式 contains: 包含
     */
    function matchUrl(str, mode) {
        if (mode === 'contains') {
            return url.indexOf(str) !== -1;
        }
        return false;
    }

    /**
     * 拦截并修改ajax请求open
     */
    window.beforeXMLHttpRequestOpen = function (xhr, options) {
        url = options.url;
        for (var i = 0; i < ruleList.length; i++) {
            var rule = ruleList[i];
            if (matchUrl(rule.matchStr, rule.matchMode)) {
                if (rule.openMethod instanceof Function) {
                    rule.openMethod(xhr, options);
                    return;
                }
            }
        }
    };

    /**
     * 拦截并修改ajax请求send
     */
    window.beforeXMLHttpRequestSend = function (xhr, options) {
        for (var i = 0; i < ruleList.length; i++) {
            var rule = ruleList[i]
            if (matchUrl(rule.matchStr, rule.matchMode)) {
                if (rule.sendMethod instanceof Function) {
                    return rule.sendMethod(xhr, options);
                }
            }
        }
        return true;
    };

    /**
     * 重写open方法
     * https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/open
     */
    XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        // 用对象便于修改参数
        var options = {
            method: method,
            url: url,
            async: async,
            user: user,
            password: password
        };
        if ('function' === typeof window.beforeXMLHttpRequestOpen) {
            window.beforeXMLHttpRequestOpen(this, options);
        }
        this._open(options.method, options.url, options.async);
    };

    /**
     * 重写send方法
     * https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/send
     */
    XMLHttpRequest.prototype._send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
        var options = {
            body: body
        };
        if ('function' === typeof window.beforeXMLHttpRequestSend) {
            if (!window.beforeXMLHttpRequestSend(this, options)) {
                return;
            }
        }
        this._send(options.body);
    };

})();
