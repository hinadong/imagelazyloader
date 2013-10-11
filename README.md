Image Lazy Loader
=================

HTML 图片延迟加载组件，当页面滚动到图片位置时才加载图片。

#### 应用 &lt;img&gt; 标签
```
<img src="images/blank.gif" data-src="images/original_image.jpg" />
```

#### 初始化组件
```
var imageLoader = new ImageLazyLoader();

// or
/*
var imageLoader = new ImageLazyLoader({
    realSrcAttribute: 'data-original' // realSrcAttribute 可以更改访问图片真实地址 img 属性
});
*/
```

当页面有新的DOM被渲染时，可以使用 scan 接口扫描被新加入到页面中的 image
```
imageLoader.scan(document.getElementById('newElement1'));
```

