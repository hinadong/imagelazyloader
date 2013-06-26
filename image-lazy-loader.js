(function(window) {

    var isAndroid = /Android[\s\/]+[\d.]+/i.test(window.navigator.userAgent),
        dummyStyle = document.createElement('div').style,
        vendor = (function () {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle ) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
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

        this.onScrollProxy = proxy(this.onScroll, this);
        window.addEventListener('scroll', this.onScrollProxy, false);
        this.maxScrollY = 0;

        this.elements = [];
        this.lazyElements = [];
        this.scan(document.body);
    };

    ImageLazyLoader.prototype = {

        range: 200,

        realSrcAttribute: 'data-src',

        useFade: true,

        onScroll: function(e) {
            var scrollY = window.pageYOffset;
            if (scrollY > this.maxScrollY) {
                clearTimeout(this.lazyLoadTimeout);
                this.scrollAction();
                this.maxScrollY = scrollY;
            }
        },

        scrollAction: function() {
            this.elements = this.elements.filter(function(el) {
                if ((this.range + window.innerHeight) >= (el.getBoundingClientRect().top - document.documentElement.clientTop)) {
                    this.lazyElements.push(el);
                    return false;
                }
                return true;
            }, this);
            this.lazyLoadTimeout = setTimeout(proxy(this.lazyLoad, this), isAndroid ? 500 : 0);
        },

        lazyLoad: function() {
            this.lazyElements.forEach(proxy(this.loadImage, this));
            this.lazyElements = [];
        },

        loadImage: function(image) {
            if (!isAndroid && this.useFade) {
                image.style.opacity = '0';
                image.addEventListener('load', function() {
                    image.style.cssText = 'opacity:1;' + cssVendor + 'transition:opacity 200ms;';
                }, false);
            }
            image.src = image.getAttribute(this.realSrcAttribute);
        },

        scan: function(ct) {
            ct = ct || document.body;
            var imgs = ct.querySelectorAll('img[' + this.realSrcAttribute + ']') || [];
            imgs = Array.prototype.slice.call(imgs, 0);
            imgs = imgs.filter(function(el) {
                if (this.elements.indexOf(el) != -1) {
                    return false;
                }
                return true;
            }, this);
            this.elements = this.elements.concat(imgs);
            this.scrollAction();
        },

        destroy: function() {
            window.removeEventListener('scroll', this.onScrollProxy, false);
            this.elements = null;
        }
    };

    window.ImageLazyLoader = ImageLazyLoader;

})(window);