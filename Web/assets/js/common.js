var OP_CONFIG = {
    staticVersion: '1.0.0',
    rootUrl: '/',
};

require.config({
    baseUrl: './js',
    paths: {
        'jquery': 'jquery-3.1.1.min',
        'hammer': 'hammer.min',
        'wx-sdk': 'http://res.wx.qq.com/open/js/jweixin-1.1.0'
    },
    shim: {

    },
    urlArgs: 'v=' + OP_CONFIG.staticVersion
});