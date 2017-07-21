require(['common', 'mqtt', 'wx-sdk', 'hammer'], function ($, mqtt, wx, Hammer) {
    var rootUrl = OP_CONFIG.rootUrl;

    wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: JsSdkPackageAppId, // 必填，公众号的唯一标识
        timestamp: JsSdkPackageTimestamp, // 必填，生成签名的时间戳
        nonceStr: JsSdkPackageNonceStr, // 必填，生成签名的随机串
        signature: JsSdkPackageSignature,// 必填，签名
        jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'getNetworkType',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView'
        ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2。详见：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
    });

    wx.error(function (res) {
        console.log(res);
    });

    wx.ready(function () {





        //转发到朋友圈
        wx.onMenuShareTimeline({
            title: 'JSSDK朋友圈转发测试',
            link: '',
            imgUrl: '',
            success: function () {
                $Tips('转发成功！');
            },
            cancel: function () {
                $Tips('转发失败！');
            }
        });
        //转发给朋友
        wx.onMenuShareAppMessage({
            title: 'JSSDK朋友圈转发测试',
            desc: '转发给朋友',
            link: '',
            imgUrl: '',
            type: 'link',
            dataUrl: '',
            success: function () {
                alert('转发成功！');
            },
            cancel: function () {
                alert('转发失败！');
            }
        });

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

    });

    var images = {
        localId: [],
        serverId: []
    };

    $('#choose-image').on('tap', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var localIds = res.localIds;
                if (res.localIds.length == 0) {
                    alert('请先使用 chooseImage 接口选择图片');
                    return;
                }
                //$("#previewIMG").attr('src', localIds[0]);
                wx.uploadImage({
                    localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: function (res) {
                        var serverId = res.serverId; // 返回图片的服务器端ID
                        upModelData.WeixinImage = serverId;
                        $.getJSON(rootUrl + 'DEMO/GetPictureUrl?media_id=' + serverId, function (result) {
                            $("#previewIMG").attr('src', rootUrl + result.url);
                            $("#previewIMG").addClass("carousel-inner img-responsive img-rounded");

                        });

                    }
                });

            }
        });
        //$("#previewIMG").attr('src', rootUrl + 'assets/img/color3.png');
        //$("#previewIMG").addClass("carousel-inner img-responsive img-rounded");
        //upModelData.WeixinImage = "color3.png";

    });
    $('#previewIMG').load(function () {

        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext('2d');
        var img = $('#previewIMG')[0]
        ctx.drawImage(img, 0, 0, 40, 40);
    })

    $('#submit').on('tap', function () {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext('2d');
        getPiexl(ctx);

    });



    var getPiexl = function (ctx) {
        var count = 180; //180份扇页
        var angle = 0; //当前取数据角度
        var angleStep = 360 / count; //每步度数
        var context = ctx;
        var c = 0;
        var imageLines = [];
        try {
            for (c = 0; c < count; c++) {
                var x = 0, y = 0; //X,Y轴
                var send = "";
                for (r = 0; r < 20; r++) { //r半径来取
                    x = 20 + r * Math.cos(angle * Math.PI / 180); //换成X坐标
                    y = 20 + r * Math.sin(angle * Math.PI / 180); //换成Y坐标
                    var imageData = context.getImageData(x, y, 1, 1); //取X，Y 指定点的一个像素高宽的数据
                    red = imageData.data[0]; //红色值 
                    green = imageData.data[1];  //绿色值 
                    blue = imageData.data[2]; //蓝色值
                    hexi = ("0" + parseInt(green, 10).toString(16)).slice(-2) + ("0" + parseInt(red, 10).toString(16)).slice(-2) + ("0" + parseInt(blue, 10).toString(16)).slice(-2);
                    //组成一个RGB串
                    send = send + hexi;

                    //console.log(x + "_" + y+":"+red+ ' '+green+' '+blue );

                }
                angle += angleStep; //角度加一步
                angle %= 360;
                var sendResult = ("00" + parseInt(c, 10)).slice(-3) + send;
                //console.log(sendResult); //本地打印
                imageLines.push(sendResult);
            }
            upModelData.ImageLines = imageLines;
            $.post(rootUrl + 'DEMO/FirstPost', {
                dataJson: JSON.stringify(upModelData)
            }, function (res) {
                console.log(res.msg);

            });

        }
        catch (err) {

        }

    }

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


});