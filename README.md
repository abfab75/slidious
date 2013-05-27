jQuery Slidious
=========

jQuery Slidious is a plugin for creating a fancy responsive, ajaxified Website.
It's pretty much an experiment and a fun project of myself. Anyway I thought this
might be useful for someone for really special usecases.

For example this could be the base for creating a responsive website,
a presentation or a game with a starship travelling from one planet to another.

Slidious' basic feature is, that it creates the website itself from a supplied sitemap or an array of links & positions.
It stays fully responsive, because all containers are created & animated using percentage values.

Check below for further details and don't hesitate to ask questions.

Example:
---

Let me give you an example on how to use Slidious to create a fully responsive website.
First you will need to define some kind of sitemap. It should be a container with links inside.

You will have to apply two custom attributes per A-element: data-x & data-y.
These attributes describe the position the links contents should be placed.

```html
<div id="menu">
<a href="page-1.html" data-x="0" data-y="0">Link 1</a>
<a href="page-2.html" data-x="2" data-y="3">Link 2</a>
<a href="page-3.html" data-x="5" data-y="2">Link 3</a>
<a href="page-4.html" data-x="4" data-y="1">Link 4</a>
</div>
```
After defining our sitemap (and creating the additional pages of course), you can run Slidious on it.

```javascript
$('#menu').slidious();
```

Your resulting page will look like this. Note that the position is measured from the top-left corner, starting with 0.
The page will be exactly as big as it needs to be.

```html
[1][0][0][0][0][0]
[0][0][0][0][4][0]
[0][0][0][0][0][3]
[0][0][2][0][0][0]
```

Options:
---

There is a bunch of options you can change. Check the list below for details:

<table>
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>wrapper</td>
    <td>''</td>
    <td>
      A css selector for your content wrapper in all linked pages.
      If you define one, all other content will be ignored when loading pages.
      I recommend using a wrapper, if you want to let your page degrade gracefully.
    </td>
  </tr>
  <tr>
    <td>autoScan</td>
    <td>true</td>
    <td>
      Defines if Slidious should automatically scan all newly added contents for links & add event handlers.
      This is the default behaviour. If you deactivate this, you will have to process the links on your own.
    </td>
  </tr>
  <tr>
    <td>preLoad</td>
    <td>'linked'</td>
    <td>
      Defines which pages Slidious should preload to provide a seemless user experience.<br>
      Possible values:<br>
      <strong>'linked':</strong> Preload all pages linked within the active content.<br>
      <strong>'all':</strong> Preload all pages on init.<br>
      <strong>'':</strong> Preloading deactived. Page will be loaded after entering.
    </td>
  </tr>
  <tr>
    <td>aniSpeed</td>
    <td>500</td>
    <td>How fast should we go? This is the animation speed for all element-to-element-transitions.</td>
  </tr>
  <tr>
    <td>links</td>
    <td>[]</td>
    <td>
      Provide an array of objects with values for x, y & url added. These will be added to your sitemap's links.
      It is also possible to skip the sitemap entirely and just use this array. Call like this: <strong>$.slidious(yourOptions);</strong>
    </td>
  </tr>
  <tr>
    <td>initUrl</td>
    <td>''</td>
    <td>The Url this page should start with. By default this is the first url of the links array.</td>
  </tr>
</table>

Callbacks:
---

This is a list of all available callbacks. The params should be understandable without further explanation (except: $ marks variables as jQuery objects).

<table>
  <tr>
    <th>Function</th>
    <th>Params</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>onInit</td>
    <td>settings</td>
    <td>Called right after Slidious is initialized. You will be able to modify the settings object.</td>
  </tr>
  <tr>
    <td>onEnter</td>
    <td>settings<br>$oldElement<br>$newElement</td>
    <td>Called right after entering an element.</td>
  </tr>
  <tr>
    <td>onLeave</td>
    <td>settings<br>$oldElement<br>$newElement</td>
    <td>Called right before leaving an element.</td>
  </tr>
  <tr>
    <td>onLoad</td>
    <td>settings<br>$oldElement<br>$element</td>
    <td>Called after successfully preloading an element's contents.</td>
  </tr>
</table>

Methods:
---

There are some methods you may use to communicate with jQuerySlidious.

<table>
  <tr>
    <th>Function</th>
    <th>Params</th>
    <th>Description</th>
    <th>Example</th>
  </tr>
  <tr>
    <td>local</td>
    <td>url</td>
    <td>Checks if a provided url is part of the jQuerySlidious sitemap. Returns true or false.</td>
    <td>$('#yourSitemap').slidious('local', 'path/to/content.html');</td>
  </tr>
  <tr>
    <td>goto</td>
    <td>x & y or url</td>
    <td>Lets Slidious scroll to the provided location and/or element container.</td>
    <td>
      $('#yourSitemap').slidious('goto', 1, 3);<br>
      $('#yourSitemap').slidious('goto', 'path/to/content.html');
    </td>
  </tr>
</table>

Note that it is also possible to skip the sitemap & call these functions directly using <strong>$.slidious()</strong>.


Markup & CSS Selectors:
---

Just for your (& my) information: The basic html markup & css selector usage.

```html
<div id="slidious-container">
  <div class="slidious-element [slidious-loading|slidious-loaded]">
    <div class="slidious-content">[PAGE CONTENT]</div>
  </div>
  <div class="slidious-element [slidious-loading|slidious-loaded]">
    <div class="slidious-content">[PAGE CONTENT]</div>
  </div>
  ...
</div>
```

<table>
  <tr><td>Selector</td><td>Usage</td></tr>
  <tr>
    <td>#slidious</td>
    <td>Unique ID of the slidious container.</td>
  </tr>
  <tr>
    <td>.slidious-element</td>
    <td>Every element will get this class.</td>
  </tr>
  <tr>
    <td>.slidious-content</td>
    <td>Wrapper element for every elements' content.</td>
  </tr>
  <tr>
    <td>.slidious-hidden</td>
    <td>Added to the provided sitemap if available. Kind of self explanatory, isn't it?</td>
  </tr>
  <tr>
    <td>.slidious-loading</td>
    <td>Added to the corresponding .slidious-element when trying to load it's contents.</td>
  </tr>
  <tr>
    <td>.slidious-loaded</td>
    <td>Added to the corresponding .slidious-element as soon as content is loaded.</td>
  </tr>
  <tr>
    <td>.slidious-scanned</td>
    <td>Added to all links inside an slidious-element after scanning (& preloading) them.</td>
  </tr>
</table>