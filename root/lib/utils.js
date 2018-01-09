const config = require('../etc/config');
import Queue from './Queue';

const timer = {};

const shareApp = function (page) {
    if (page.shareInfo) {
        return page.shareInfo;
    }
    return {
        title: config.share.title,
        path : page.route
    }
};

//按宽度计算高度
const heightCalc = function (height_rate) {
    let clientWidth = wx.getSystemInfoSync().windowWidth;
    height_rate = height_rate || 1;
    return clientWidth * height_rate;
};

//按高度计算宽度
const widthCalc = function (width_rate) {
    let windowHeight = wx.getSystemInfoSync().windowHeight;
    width_rate = width_rate || 1;
    return windowHeight * width_rate;
};

const calcPx = function (rpx) {
    let clientWidth = wx.getSystemInfoSync().windowWidth;
    let r = clientWidth / 750;
    return rpx * r;
};

const data2query = function (data) {
    var d = [];
    for (var i in data) {
        d.push(i + "=" + encodeURIComponent(data[i]));
    }
    return d.join('&');
};

const back = function (e) {
    var data = e.dataset || e.currentTarget.dataset, delta = data.delta || 1;
    console.log(delta)
    wx.navigateBack(delta);
};

const navigateTo = function (e) {
    var data = e.dataset || e.currentTarget.dataset, url = data.url, kill = data.kill;
    delete data.url;
    delete data.kill;
    if (!url) return;
    var parame = data2query(data), parameurl = parame ? url + (url.indexOf('?') > -1 ? '&' + parame : '?' + parame) : url;
    if (kill) {
        //关闭当前页跳转
        wx.redirectTo({
            url : parameurl,
            fail: function () {
                wx.switchTab({
                    url : url,
                    fail: function (err) {
                        console.log(err);
                    }
                });
            }
        });
        return;
    }

    wx.navigateTo({
        url : parameurl,
        fail: function () {
            wx.redirectTo({
                url : parameurl,
                fail: function () {
                    wx.switchTab({
                        url : url,
                        fail: function (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
    });

};

const loadingCalc = function (total, callback) {
    this.count = 0;
    this.total = total;
    this.reset = function (total) {
        this.count = 0;
        if (total) {
            this.total = total;
        }
    };
    this.incr = function () {
        this.count++;
        if (this.count >= this.total) {
            if (typeof callback == 'function') {
                callback();
            }
        }
    }
};

const showPageLoading = function (msg) {
    if (msg && wx.showLoading) {
        wx.showLoading({title: msg, mask: true});
    } else {
        wx.showNavigationBarLoading();
    }
};

const hidePageLoading = function () {
    if (wx.hideLoading) {
        wx.hideLoading();
    }
    wx.hideNavigationBarLoading();
};

const pageLoading = function () {
    this.updateBuffer = null;
    this.load_count = 0;
    this.load_end = 0;
    this.page = null;
    this.callback = null;

    this.init = function (pageObj, count, initData, callback) {
        this.page = pageObj;
        this.load_count = count;
        if (typeof callback == 'function') {
            this.callback = callback;
        }
        if (typeof initData == 'object' && initData !== null) {
            this.updateBuffer = initData;
            this.page.setData(this.updateBuffer);
            this.updateBuffer = null;
        }

        if (this.load_count > 0) {
            showPageLoading();
        } else {
            this.loadEnd();
        }
    };

    this.setData = function (data) {
        if (this.updateBuffer === null) this.updateBuffer = {};
        for (var i in data) {
            this.updateBuffer[i] = data[i];
        }
    };

    this.loadEnd = function () {

        let end = () => {
            hidePageLoading();
            if (this.updateBuffer) {
                this.page.setData(this.updateBuffer);
                this.updateBuffer = null;
            }
            if (this.callback) {
                this.callback();
                this.callback = null;
            }
        };

        if (this.load_count < 1) {
            end();
            return;
        }
        this.load_end++;
        if (this.load_end >= this.load_count) {
            this.load_count = 0;
            this.load_end = 0;
            end();
        }
    }

};

const viewPhoto = function (imags, index) {
    index = index || 0;
    wx.previewImage({
        urls   : imags,
        current: imags[index]
    });
};

const showTip = function (page, msg) {
    clearTimeout(timer['tip']);
    page.setData({
        tips: {
            show: true,
            msg : msg
        }
    });
    timer['tip'] = setTimeout(function () {
        page.setData({
            'tips.show': false
        });
    }, 3000);
};

const arrayColumn = function (arrs, name) {
    var res = [];
    for (let i in arrs) {
        res.push(arrs[i][name]);
    }
    return res;
};

const arrayFilter = function (arrs) {
    var res = [];
    for (let i in arrs) {
        if (typeof arrs[i] != 'undefined' && arrs[i] !== null) res.push(arrs[i]);
    }
    return res;
};

const showToast = function (msg) {
    wx.showToast({title: msg});
};

const getUserInfo = function (withCredentials) {
    withCredentials = withCredentials || false;


    var promise = new Promise(function (resolve, reject) {

        var startGetUserInfo = function () {
            wx.getUserInfo({
                withCredentials: withCredentials,
                success        : function (res) {
                    resolve(res);
                },
                fail           : function (error) {
                    _confirm();
                }
            });
        };

        var _confirm = function () {
            wx.showModal({
                title      : "温馨提示",
                content    : "将授权获取你的用户昵称和头像",
                confirmText: "去授权",
                success    : function (res) {
                    if (res.confirm) {
                        if (wx.openSetting) {
                            wx.openSetting({
                                success: function (res) {
                                    if (res.authSetting['scope.userInfo']) {
                                        //已授权
                                        startGetUserInfo();
                                    } else {
                                        reject('取消授权');
                                    }

                                }
                            });
                        } else {
                            startGetUserInfo();
                        }
                    } else {
                        reject('取消授权');
                    }
                },
                fail       : function (error) {
                    reject(error);
                }

            });
        };

        startGetUserInfo();

    });
    return promise;

};

const chooseAddress = function () {

    var promise = new Promise(function (resolve, reject) {

        var startChooseAddress = function () {
            wx.chooseAddress({
                success: function (res) {
                    resolve(res);
                },
                fail   : function (error) {
                    console.log(error);
                    if (error.errMsg == 'chooseAddress:cancel') {
                        reject(error.errMsg);
                    }else{
                        _confirm();
                    }
                }
            });
        };

        var _confirm = function () {
            wx.showModal({
                title      : "温馨提示",
                content    : "将授权获取你的通讯地址",
                confirmText: "去授权",
                success    : function (res) {
                    if (res.confirm) {
                        if (wx.openSetting) {
                            wx.openSetting({
                                success: function (res) {
                                    if (res.authSetting['scope.address']) {
                                        //已授权
                                        startChooseAddress();
                                    } else {
                                        reject('取消授权');
                                    }

                                }
                            });
                        } else {
                            startChooseAddress();
                        }
                    } else {
                        reject('取消授权');
                    }
                },
                fail       : function (error) {
                    reject(error);
                }

            });
        };

        startChooseAddress();

    });
    return promise;

};

const requestPayment = function (data, callback) {
    //调起微信支付
    wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        complete: function (errMsg) {
            console.log(errMsg);

            if (typeof callback == 'function') {
                callback(errMsg);
                return;
            }

            //bug: 6.5.2 及之前版本中，用户取消支付不会触发 fail 回调，只会触发 complete 回调，回调 errMsg 为 'requestPayment:cancel'
            switch (errMsg) {
                case 'requestPayment:ok':
                    navigateTo({
                        dataset: {
                            url: config.pay_success_url,
                            kill: 1
                        }
                    });
                    return;
                default:
                    navigateTo({
                        dataset: {
                            url: config.pay_fail_url,
                            kill: 1
                        }
                    });
            }
        }
    });
};

const inputBind = function (page, data_name, e) {
    var up={}, v = e.detail.value;
    up[data_name] = v;
    if (e.type == 'blur' && e.type == 'confirm') {
        page.setData(up);
        return;
    }
    clearTimeout(timer['change.'+data_name]);
    timer['change.'+data_name] = setTimeout(function () {
        console.log(page, up)
        page.setData(up);
    }, 500);
};

const range = function (min, max, step=1) {
    let res = [];
    for(let i=min; i<=max; i+=step){
        res.push(i);
    }
    return res;
};


const searchInit = function (page, defkey, searchTap, placeholder) {
    var self = this;
    self.defkey = defkey || "";
    self.page = page;
    self.page.keyword = defkey || "";

    if (typeof searchTap == 'function') {
        self.page.searchTap = searchTap;
    }else{
        self.page.searchTap = function (e) {
            var event = {
                dataset:{
                    url: config.search_path,
                    defkey: encodeURIComponent(self.page.keyword)
                }
            };
            navigateTo(event);
        };
    }

    self.page.searchClean = function (e) {
        self.page.keyword = "";
        self.page.setData({"search.keyword":""});
    };

    self.page.searchInput = function (e) {
        var value = e.detail.value;
        switch (e.type) {
            case 'focus':
                if (value!="" && value == self.defkey) {
                    self.page.keyword = "";
                    self.page.setData({"search.keyword":""});
                }
                break;
            case 'input':
                self.page.keyword = value;
                clearTimeout(timer['search']);
                timer['search'] = setTimeout(function () {
                    self.page.setData({"search.keyword":value});
                }, 500);
                break;
            case 'blur':
                self.page.keyword = value;
                self.page.setData({"search.keyword":value});
                break;
            case 'confirm':
                self.page.keyword = value;
                if (value!="" && value == self.defkey) {
                    self.page.setData({"search.keyword":self.defkey});
                    return;
                }
                self.page.setData({"search.keyword":value});

                self.page.searchTap();
                break;
        }
    };

    setTimeout(function () {
        //异步渲染，提高性能
        self.page.setData({
            search: {
                keyword    : self.defkey,
                placeholder: placeholder || "关键词",
            }
        });
    }, 100);
};

module.exports = {
    config         : config,
    arrayFilter    : arrayFilter,
    arrayColumn    : arrayColumn,
    searchInit     : searchInit,
    getUserInfo    : getUserInfo,
    chooseAddress  : chooseAddress,
    shareApp       : shareApp,
    widthCalc      : widthCalc,
    heightCalc     : heightCalc,
    calcPx         : calcPx,
    back           : back,
    navigateTo     : navigateTo,
    loadingCalc    : loadingCalc,
    pageLoading    : pageLoading,
    showPageLoading: showPageLoading,
    hidePageLoading: hidePageLoading,
    showToast      : showToast,
    requestPayment : requestPayment,
    viewPhoto      : viewPhoto,
    showTip        : showTip,
    inputBind      : inputBind,
    range          : range,
    queue          : new Queue(),
    timer          : timer
};
