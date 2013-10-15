(function(window) {
    var isAndroid = /Android/i.test(window.navigator.userAgent),
        dummyStyle = document.createElement('div').style,
        vendor = (function() {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for (; i < l; i++) {
                t = vendors[i] + 'ransform';
                if (t in dummyStyle) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        proxy = function(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
            };
        };

    var ImageLazyLoader = function(config) {
        config = config || {};
        for (var o in config) {
            this[o] = config[o];
        }
        this.ct = document.body;

        this._onScroll = proxy(this.onScroll, this);
        window.addEventListener('scroll', this._onScroll, false);
        this.maxScrollY = 0;

        if (isAndroid) { // 在android下，opacity动画效果比较差
            this.useFade = false;
        }

        this.elements = [];
        this.lazyElements = {};
        this.scan(this.ct);

        this._onPageShow = proxy(this.onPageShow, this);
        window.addEventListener('pageshow', this._onPageShow, false);
    };

    ImageLazyLoader.prototype = {

        range: 200,

        realSrcAttribute: 'data-src',

        useFade: true,

        // private
        onPageShow: function() {
            this.maxScrollY = 0;
            this.scan(this.ct);
        },

        // private
        onScroll: function() {
            var scrollY = window.pageYOffset || window.scrollY;
            if (scrollY > this.maxScrollY) {
                this.maxScrollY = scrollY;
                this.scrollAction();
            }
        },

        // private
        scrollAction: function() {
            clearTimeout(this.lazyLoadTimeout);
            this.elements = this.elements.filter(function(img) {
                if ((this.range + window.innerHeight) >= (img.getBoundingClientRect().top - document.documentElement.clientTop)) {
                    var realSrc = img.getAttribute(this.realSrcAttribute);
                    if (realSrc) {
                        if (this.lazyElements[realSrc]) {
                            this.lazyElements[realSrc].push(img);
                        } else {
                            this.lazyElements[realSrc] = [img];
                        }
                    }
                    return false;
                }
                return true;
            }, this);
            this.lazyLoadTimeout = setTimeout(proxy(this.loadImage, this), isAndroid ? 500 : 0);
        },

        // private
        loadImage: function() {
            var img, realSrc, imgs;
            for (realSrc in this.lazyElements) {
                imgs = this.lazyElements[realSrc];
                img = imgs.shift();
                if (imgs.length === 0) {
                    delete this.lazyElements[realSrc];
                }
                img.addEventListener('load', proxy(this.onImageLoad, this), false);
                if (img.src != realSrc) {
                    this.setImageSrc(img, realSrc);
                } else {
                    this.onImageLoad(img);
                }
            }
        },

        // private
        onImageLoad: function(e) {
            var me = this,
                img = e.target || e,
                realSrc = img.getAttribute(me.realSrcAttribute),
                imgs = me.lazyElements[realSrc];

            me.showImage(img);

            if (imgs) {
                imgs.forEach(function(i) {
                    me.setImageSrc(i, realSrc);
                    me.showImage(i);
                });
                delete me.lazyElements[realSrc];
            }
        },

        // private
        setImageSrc: function(img, realSrc) {
            if (this.useFade) {
                img.style.opacity = '0';
            }
            img.src = realSrc;
        },

        // private
        showImage: function(img) {
            if (this.useFade) {
                img.style[vendor + 'Transition'] = 'opacity 200ms';
                img.style.opacity = 1;
            }
            img.setAttribute('data-lazy-load-completed', '1');
        },

        scan: function(ct) {
            var imgs;
            ct = ct || document.body;
            imgs = ct.querySelectorAll('img[' + this.realSrcAttribute + ']') || [];
            imgs = Array.prototype.slice.call(imgs, 0);
            imgs = imgs.filter(function(img) {
                if (this.elements.indexOf(img) != -1 || img.getAttribute('data-lazy-load-completed') == '1') {
                    return false;
                }
                return true;
            }, this);
            this.elements = this.elements.concat(imgs);
            this.scrollAction();
        },

        destroy: function() {
            if (!this.destroyed) {
                this.destroyed = true;
                window.removeEventListener('scroll', this._onScroll, false);
                window.removeEventListener('pageshow', this._onPageShow, false);
                this.elements = this.lazyElements = null;
            }
        }
    };

    dummyStyle = null;

    window.ImageLazyLoader = ImageLazyLoader;

})(window);