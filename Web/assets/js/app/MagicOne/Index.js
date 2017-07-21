'use strict';

require(['jquery', 'wx-sdk', 'hammer'], function ($, wx, Hammer) {
    var rootUrl = OP_CONFIG.rootUrl;
    var currentUrl = window.location.origin + window.location.pathname + window.location.search;

    $.get(rootUrl + 'api/wx/getJSSignature', { url: currentUrl })
	.then(function (res) {
	    wx.config({
	        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	        appId: OP_CONFIG.wxAppId, // 必填，公众号的唯一标识
	        timestamp: res.timestamp, // 必填，生成签名的时间戳
	        nonceStr: res.nonceStr,	// 必填，生成签名的随机串
	        signature: res.signature, // 必填，签名，见附录1
	        jsApiList: [ // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
		    	'chooseImage'
	        ]
	    });
	    wx.ready(onWxReady);
	});

    function onWxReady() {
        var wrapper = $('.cropper-wrapper');
        var clipArea = $('.cropper-clip-area');
        var srcImg = $('.cropper-src');
        var clipImg = $('.cropper-clip');
        var totalW = wrapper.width(); // 裁剪器的宽度
        var totalH = wrapper.height(); // 裁剪器高度
        var offsetTop = (totalH - totalW) / 2; // 裁剪区相对最上边的偏移量
        var clipParam = { // 裁剪参数	
            action: '',
            img: null,
            width: 0,
            height: 0,
            left: 0,
            top: 0
        };

        clipArea.css({
            width: totalW,
            height: totalW,
            top: offsetTop
        });

        new Hammer(document.getElementById('container'), { domEvents: true });

        // 选择图片		
        $('#choose-image').on('tap', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) { // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    if (!res.localIds.length) {
                        alert('请选择图片！');
                        return;
                    }
                    setChooseImage(res.localIds[0]);
                }
            });
        });

        // 拖拽、缩放图片
        (function () {
            var oldX, oldY; // 拖拽变量
            var oldParam; // 缩放变量
            var hammer = new Hammer(clipArea[0], { domEvents: true });

            // pinch要手动启用
            hammer.get('pinch').set({ enable: true });

            // 拖拽开始
            clipArea.on('touchstart', function (evt) {
                evt.stopPropagation();
                evt.preventDefault();

                if (evt.targetTouches.length !== 1) {
                    return;
                }

                var touch = evt.targetTouches[0];
                oldX = touch.pageX;
                oldY = touch.pageY;
            })
			// 拖拽移动
			.on('touchmove', function (evt) {
			    evt.stopPropagation();
			    evt.preventDefault();

			    if (oldX === undefined || evt.targetTouches.length !== 1) {
			        return;
			    }

			    var touch = evt.targetTouches[0];
			    var newLeft, newTop;

			    newLeft = clipParam.left + touch.pageX - oldX;
			    newTop = clipParam.top + touch.pageY - oldY;
			    oldX = touch.pageX;
			    oldY = touch.pageY;
			    setImagePos(newLeft, newTop);
			})
			// 拖拽结束
			.on('touchend', function (evt) {
			    evt.stopPropagation();
			    evt.preventDefault();
			    oldX = undefined;
			    oldY = undefined;
			});

            // 图片缩放
            hammer.on('pinchstart', function (evt) {
                oldParam = $.extend(true, {}, clipParam);
            })
			.on('pinch', function (evt) {
			    var scale = evt.scale;

			    var width = oldParam.width * scale;
			    var height = oldParam.height * scale;
			    setImageSize(width, height);

			    var left = oldParam.left - (clipParam.width - oldParam.width) / 2;
			    var top = oldParam.top - (clipParam.height - oldParam.height) / 2;
			    setImagePos(left, top);
			});
        })();

        // 确定
        $('#submit').on('tap', function () {
            alert('submit');
        });

        // 将选择图像的图片放到裁剪器中
        function setChooseImage(src) {
            var img = new Image();

            img.onload = function () {
                var realW = totalW;
                var realH = img.height / img.width * realW;

                clipParam.img = img;
                srcImg.attr({ src: src });
                clipImg.attr({ src: src });
                setImageSize(realW, realH);
                setImagePos(0, 0);
            };
            img.src = src;
        }

        // 设置图片大小
        function setImageSize(width, height) {
            // 宽度不能小于裁剪区宽度
            if (width < totalW) {
                width = totalW;
                height = Math.round(clipParam.img.height / clipParam.img.width * width);
            }
            // 高度不能小于裁剪区高度
            if (height < totalW) {
                height = totalW;
                width = Math.round(clipParam.img.width / clipParam.img.height * height);
            }
            clipParam.width = width;
            clipParam.height = height;
            srcImg.attr({ width: width, height: height });
            clipImg.attr({ width: width, height: height });
        }

        // 设置图片位置
        function setImagePos(left, top) {
            if (left > 0) { // 往右，图片左方不能超过裁剪区左方
                left = 0;
            } else if (left + clipParam.width < totalW) { // 往左，图片右方不能超过裁剪区右方
                left = totalW - clipParam.width;
            }
            if (top > offsetTop) { // 往下，图片上方不能超过裁剪区上方
                top = offsetTop;
            } else if (top + clipParam.height < (totalH + totalW) / 2) { // 往上，图片下方不能超过裁剪区下方
                top = (totalH + totalW) / 2 - clipParam.height;
            }

            clipParam.left = left;
            clipParam.top = top;
            srcImg.css({ transform: 'translate(' + left + 'px, ' + top + 'px)' });
            clipImg.css({ transform: 'translate(' + left + 'px, ' + (top - offsetTop) + 'px)' });
        }

        // 裁剪图片
        function clipImage() {
            var ctx = resultCanvas[0].getContext('2d');
            var sx = Math.abs(clipParam.left) * clipParam.scale;
            var sy = Math.abs(offsetTop - clipParam.top) * clipParam.scale;
            var sWidth = totalW * clipParam.scale;
            var sHeight = totalW * clipParam.scale;

            // 解决IOS上超出范围时drawImage画不出图像的BUG
            if (sx + sWidth > clipParam.img.width) {
                sx = clipParam.img.width - sWidth;
            }
            if (sy + sHeight > clipParam.img.height) {
                sy = clipParam.img.height - sHeight;
            }

            // 将canvas的width属性设置为css width值的pixelRatio可以避免drawImage失真
            ctx.clearRect(0, 0, 2 * totalW, 2 * totalW);
            ctx.drawImage(clipParam.img, sx, sy, sWidth, sHeight, 0, 0, 2 * totalW, 2 * totalW);
        }

        // 默认显示页
        $('#page-cropper').addClass('js-show');
        // 隐藏加载框
        $('#page-loading').addClass('hide');

        setChooseImage('./img/desktop1.jpg');
    }
});