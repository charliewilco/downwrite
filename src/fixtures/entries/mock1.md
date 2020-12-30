---
title: CSS Variables
date: 2016-09-09 00:00:00
layout: post
---

Quick, what are the two most useful features of every CSS pre-processor out there? Top of that list are probably variables and concatenating files. There have been rumblings about CSS getting native variables for a few years now and they're finally in the wild in major browsers.

These native variables are called "custom properties". To me they're one of the coolest things in CSS today. They give you as a developer the ability to natively keep values consistent without the help of a build process.

### Browser Support

- Firefox 31+
- Chrome 49+
- Safari 9.1+ / iOS Safari 9.3+
- Android Browser 51+
- Opera 36+
- Edge [In Development](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/csscustompropertiesakacssvariables/)

_from [Can I Use](http://caniuse.com/#search=custom%20properties)_

### Using Variables

You can define a custom property in the root of your project and call it with the `var()` function. The only trick to defining a custom property is that you need to prefix them with the double dashes `--`. It may be a little odd at first, but it prevents naming collisions with reserved words and values. It's also worth noting these custom property names are case sensitive.

Custom properties store any value you want. It can be a color, a `calc()` function, measurement, a string or any other value you would normally define in CSS.

```css
:root {
  --base-color: #147aab;
}

a {
  color: var(--base-color);
}
```

You can also define a custom property at the selector level and then that property is scoped to that parent selector.

```css
.Block {
  --theme: #147aab;
  border-top-color: var(--theme);
  padding: 1rem;
}

.Block__title {
  color: var(--theme);
}
```

You can optionally set a fallback in the `var()` function if that named variable isn't available. For example, if the variable `--theme` isn't available, it will use the hex value in the second parameter.

```css
.Block {
  color: var(--theme, #ffc600);
}
```

You can redefine custom properties at breakpoints.

```css
:root {
  --blue: #5886a7;
}

html {
  background: var(--blue, #ffc600);
}

@media only screen and (min-width: 20rem) {
  :root {
    --blue: #147aab;
  }
}
```

### Working with Numbers

Custom properties store values but you can't interpolate them like you can with Sass with the `#{$variable}px` or similar syntax. You can store a unit-less number but you can't just append a unit when you're calling that custom property. To achieve this you can combine the unit-less value with the `calc()` function.

```css
:root {
  --size: 1.5;
}

h1 {
  font-size: var(--size) rem; /* Doesn't Work */
  font-size: calc(var(--size) * 1rem); /* Works Perfectly */
}
```

### Mixin-like Properties

There's another [spec](http://tabatkins.github.io/specs/css-apply-rule/) related to custom properties with the `@apply` rule. It's similar to a Sass mixin in that it applies groups of styles, but it's static so it doesn't take any parameters like Sass mixins would.

```css
:root {
  --awesome-headline: {
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--base-color);
  }
}

h1 {
  @apply --awesome-headline;
}
```

As of the time of writing this post, you can only use `@apply` in Chrome behind a feature flag. But maybe that will change soon. There is a [PostCSS plugin](https://github.com/pascalduez/postcss-apply) that will let you compile those values.

### Examples

This is an example of applying custom property to a parent element and applying it child elements.

<p data-height="436" data-theme-id="4981" data-slug-hash="EgjzWA" data-default-tab="css,result" data-user="charlespeters" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/charlespeters/pen/EgjzWA/">Custom Properties</a> by Charles Peters (<a href="http://codepen.io/charlespeters">@charlespeters</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

This is an example of updating a custom property's value with JavaScript.

<p data-height="300" data-theme-id="4981" data-slug-hash="ORVrQy" data-default-tab="css,result" data-user="charlespeters" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/charlespeters/pen/ORVrQy/">Changing CSS Custom Props</a> by Charles Peters (<a href="http://codepen.io/charlespeters">@charlespeters</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

### Further Reading

- [CSS Variables: Why Should You Care?](https://developers.google.com/web/updates/2016/02/css-variables-why-should-you-care) from Google Developers
- [Custom Variables Spec](https://drafts.csswg.org/css-variables/)
