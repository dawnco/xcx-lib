/**
 * @author      Joyber /Q:33221019
 * @date        2017/11/14
 */

const config = require('../etc/config');

const header = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Auth-Client': 'xcx',
};


const get = function (url, data) {
    url = config.api_prefix + url;
    data = data || {};

    let _header = Object.assign({}, header);
    let sess_token = wx.getStorageSync('sess_token');
    if (sess_token) {
        _header['auth-token'] = sess_token;
    }

    var promise = new Promise(function (resolve, reject) {
        wx.request({
            url     : url,
            data    : data,
            header  : _header,
            method  : 'GET',
            dataType: 'json',
            success : function (res) {
                if (config.debug) console.log({url: url, data: data, response: res});

                if (res.data.status == 'success') {
                    resolve(res.data.data);
                } else {
                    reject(res.data && res.data.message || '返回数据错误');
                }
            },
            fail    : function (err) {
                reject('系统错误：' + err.errMsg);
            }
        });
    });
    return promise;
};

const post = function (url, data) {
    url = config.api_prefix + url;
    data = data || {};

    let _header = Object.assign({}, header);
    let sess_token = wx.getStorageSync('sess_token');
    if (sess_token) {
        _header['auth-token'] = sess_token;
    }

    var promise = new Promise(function (resolve, reject) {
        wx.request({
            url     : url,
            data    : data,
            header  : _header,
            method  : 'POST',
            dataType: 'json',
            success : function (res) {
                if (config.debug) console.log({url: url, data: data, response: res});

                if (res.data.status == 'success') {
                    resolve(res.data.data);
                } else {
                    reject(res.data && res.data.message || '返回数据错误');
                }
            },
            fail    : function (err) {
                reject('系统错误：' + err.errMsg);
            }
        });
    });
    return promise;
};

/**
 * 检查用户登录态
 */
const checkAuth = function () {
    var promise = new Promise(function (resolve, reject) {

        var login = function () {
            wx.login({
                success: function (res) {
                    if (res.code) {
                        post('auth', {code: res.code})
                            .then(function (data) {
                                if (data && data.token) {
                                    wx.setStorageSync('sess_token', data.token);
                                    resolve(data.token);
                                    return;
                                }
                                resolve(wx.getStorageSync('sess_token'));
                            }, function (msg) {
                                console.log(msg);
                                reject('get token error');
                            });
                    } else {
                        reject('get auth code none');
                    }
                },
                fail   : function (msg) {
                    console.log(msg);
                    reject('get auth code none fail');
                }
            });
        };

        login();
        // wx.checkSession({
        //     success: function () {
        //         //session 未过期，并且在本生命周期一直有效
        //         var sess_token = wx.getStorageSync('sess_token');
        //         if (sess_token) {
        //             resolve(sess_token);
        //             return;
        //         } else {
        //             login();
        //         }
        //     },
        //     fail   : function () {
        //         //登录态过期
        //         login() //重新登录
        //     }
        // });
    });
    return promise;

};


Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => {
            throw reason
        })
    );
};

module.exports = {
    get      : get,
    post     : post,
    checkAuth: checkAuth,
};