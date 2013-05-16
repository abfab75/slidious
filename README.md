jQuery FlyByMenu
=========

Let me give you an example on how to use fbm to create a fully responsive website.
First you will need to define some kind of sitemap. It should be a container with links inside.

You will have to apply two custom attributes per <a>-element: data-x & data-y.
These attributes describe the position the links contents should be placed.

```html
<div id="menu">
<a href="page-1.html" data-x="0" data-y="0">Link 1</a>
<a href="page-2.html" data-x="2" data-y="3">Link 2</a>
<a href="page-3.html" data-x="5" data-y="2">Link 3</a>
<a href="page-4.html" data-x="4" data-y="1">Link 4</a>
</div>
```
After defining our sitemap (and creating the additional pages of course), you can run fbm on the sitemap.
The wrapper element of your pages' contents is mandatory. Other contents on the linked pages will be ignored.

```javascript
$('#menu').fbm({
  wrapper : '#container'
});
```

Your resulting page will look like this. Note that the position is measured from the top-left corner, starting with 0.
The page will exactly as big as it will need to be.

```html
[1][0][0][0][0][0]
[0][0][0][0][4][0]
[0][0][0][0][0][3]
[0][0][2][0][0][0]
```