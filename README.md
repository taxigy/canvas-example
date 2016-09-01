# Canvas example

Example of scrollable, draggable, zoomable canvas showing a catalogue of images

See [the demo](http://specular.space/canvas-example/).

## Usage

Pass `images` prop to the component, with the value an array of objects
where every object has three properties:

- url,
- width,
- height.

Just like this:

```javascript
const images = [{
  url: 'http://lorempixel.com/200/200',
  height: 200,
  width: 200
}]
```

so

```javascript
<Canvas images={images} />
```

## Problem

- [ ] When source image is big, its downscaled version is ugly, whatever the
  reason.
- [ ] When two-finger swipes are turned on in the browser, scrolling left and
  right is pain.
