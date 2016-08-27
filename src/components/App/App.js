import React, { Component } from 'react';
// import {
//   fabric
// } from 'fabric';
import styles from './App.scss';

const DEBUG_IMAGES = [{
  url: 'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x800&w=1000&h=800',
  width: 1000,
  height: 800
}, {
  url: 'https://placeholdit.imgix.net/~text?txtsize=75&txt=900x1000&w=900&h=1000',
  width: 900,
  height: 1000
}, {
  url: 'https://placeholdit.imgix.net/~text?txtsize=75&txt=800x800&w=800&h=800',
  width: 800,
  height: 800
}, {
  url: 'https://placeholdit.imgix.net/~text?txtsize=75&txt=700x1000&w=700&h=1000',
  width: 700,
  height: 1000
}, {
  url: 'https://placeholdit.imgix.net/~text?txtsize=75&txt=601x602&w=601&h=602',
  width: 601,
  height: 602
}];

export default class App extends Component {
  constructor() {
    super();
    this.canvas = {};
  }

  kickOut() {
    const {
      canvas,
      ctx,
      width,
      height
    } = this.canvas;

    this.canvas.lastX = canvas.width / 2;
    this.canvas.lastY = canvas.height / 2;
    canvas.width = width;
    canvas.height = height;

    canvas.addEventListener('mousedown', event => {
      const lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
      const lastY = event.offsetY || (event.pageY - canvas.offsetTop);
      const dragStart = ctx.transformedPoint(lastX, lastY);

      this.canvas.lastX = lastX;
      this.canvas.lastY = lastY;
      this.canvas.dragStart = dragStart;
      this.canvas.dragged = false;
    }, false);

    canvas.addEventListener('mousemove', event => {
      const lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
      const lastY = event.offsetY || (event.pageY - canvas.offsetTop);

      this.canvas.lastX = lastX;
      this.canvas.lastY = lastY;
      this.canvas.dragged = true;

      if (this.canvas.dragStart) {
        const pt = ctx.transformedPoint(lastX, lastY);

        ctx.translate(pt.x - this.canvas.dragStart.x, pt.y - this.canvas.dragStart.y);
        this.redraw();
      }
    }, false);

    canvas.addEventListener('mouseup', () => {
      this.canvas.dragStart = null;
    }, false);

    canvas.addEventListener('dblclick', event => {
      const {
        ctx,
        contentWidth,
        contentHeight,
        zoom
      } = this.canvas;
      const lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
      const lastY = event.offsetY || (event.pageY - canvas.offsetTop);
      const minZoom = 1;
      const maxZoom = 2;
      const pt = ctx.transformedPoint(lastX, lastY);
      const factor = zoom === minZoom ? maxZoom : 1 / maxZoom;

      this.canvas.lastX = lastX;
      this.canvas.lastY = lastY;
      this.canvas.contentWidth = contentWidth * factor;
      this.canvas.contentHeight = contentHeight * factor;
      this.canvas.zoom = zoom === minZoom ? maxZoom : minZoom;
      ctx.translate(pt.x, pt.y);
      ctx.scale(factor, factor);
      ctx.translate(-pt.x, -pt.y);

      // And now goes compensation. It relies on current state of transform in CanvasRenderingContext2D and it is just crazy.
      const {
        a: zoomX,
        d: zoomY,
        e: nextX,
        f: nextY
      } = ctx.getTransform();

      if (nextX > 0) {
        ctx.translate(-nextX, 0);
      } else if (nextX < width - this.canvas.contentWidth) {
        ctx.translate(-nextX - width + this.canvas.contentWidth, 0);
      }

      if (nextY > 0) {
        ctx.translate(0, -nextY);
      } else if (nextY < height - this.canvas.contentHeight) {
        ctx.translate(0, -nextY - height + this.canvas.contentHeight);
      }

      this.canvas.left = nextX / zoomX;
      this.canvas.top = nextY / zoomY;

      this.redraw();
    }, false);

    canvas.addEventListener('wheel', (event) => {
      this.canvas.dragged = true;
      this.canvas.ctx.translate(event.wheelDeltaX / 4, event.wheelDeltaY / 4);
      this.redraw();
    }, false);

    this.trackTransforms();
    this.redraw();
  }

  redraw() {
    const {
      canvas,
      ctx
    } = this.canvas;

    if (canvas && ctx) {
      const {
        images = DEBUG_IMAGES
      } = this.props;
      const imageElements = images.map(({url, width, height}) => {
        const image = new Image;
        image.src = url;
        image.height = height;
        image.width = width;

        return {
          image,
          height,
          width
        };
      });
      const p1 = ctx.transformedPoint(0, 0);
      const p2 = ctx.transformedPoint(this.canvas.width, this.canvas.height);

      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      imageElements.reduce((total, {image, height, width}) => {
        const next = {
          width: this.canvas.height * width / height,
          height: this.canvas.height
        };

        ctx.drawImage(image, total, 0, next.width, next.height);

        return total + next.width;
      }, 0);
    }
  }

  trackTransforms() {
    const {
      ctx
    } = this.canvas;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const savedTransforms = [];
    const {
      save,
      restore,
      scale,
      rotate,
      translate,
      transform,
      setTransform,
    } = ctx;
    const pt  = svg.createSVGPoint();
    let xform = svg.createSVGMatrix();

    ctx.getTransform = () => xform;

    ctx.save = () => {
      savedTransforms.push(xform.translate(0, 0));
      save.call(ctx);
    };

    ctx.restore = () => {
      xform = savedTransforms.pop();
      restore.call(ctx);
    };

    ctx.scale = (sx, sy) => {
      xform = xform.scaleNonUniform(sx, sy);
      scale.call(ctx, sx, sy);
    };

    ctx.rotate = (radians) => {
      xform = xform.rotate(radians * 180 / Math.PI);
      rotate.call(ctx, radians);
    };

    ctx.translate = (dx, dy) => {
      const {
        dragged,
        left,
        top,
        contentWidth,
        contentHeight,
        width,
        height,
        zoom
      } = this.canvas;
      const next = {
        left: left + dx,
        top: top + dy
      };

      if (dragged && next.left <= 0 && next.left >= (width - contentWidth) / zoom) {
        this.canvas.left = next.left;
        xform = xform.translate(dx, 0);
        translate.call(ctx, dx, 0);
      }

      if (dragged && next.top <= 0 && next.top >= (height - contentHeight) / zoom) {
        this.canvas.top = next.top;
        xform = xform.translate(0, dy);
        translate.call(ctx, 0, dy);
      }

      if (!dragged) {
        xform = xform.translate(dx, dy);
        translate.call(ctx, dx, dy);
      }
    };

    ctx.transform = (a, b, c, d, e, f) => {
      const m2 = svg.createSVGMatrix();

      m2.a = a;
      m2.b = b;
      m2.c = c;
      m2.d = d;
      m2.e = e;
      m2.f = f;
      xform = xform.multiply(m2);

      return transform.call(ctx, a, b, c, d, e, f);
    };

    ctx.setTransform = (a, b, c, d, e, f) => {
      xform.a = a;
      xform.b = b;
      xform.c = c;
      xform.d = d;
      xform.e = e;
      xform.f = f;

      return setTransform.call(ctx, a, b, c, d, e, f);
    };

    ctx.transformedPoint = (x, y) => {
      pt.x = x;
      pt.y = y;

      return pt.matrixTransform(xform.inverse());
    };
  }

  componentDidMount() {
    window.addEventListener('load', () => {
      this.kickOut();
    });

    window.cc = this.canvas;
  }

  render() {
    const {
      images = DEBUG_IMAGES
    } = this.props;
    const imageElements = images.map(({url, width, height}) => {
      const image = new Image;
      image.src = url;
      image.height = height;
      image.width = width;

      return {
        image,
        height,
        width
      };
    });

    return (
      <div className={styles.app}>
        <canvas
          className={styles.canvas}
          ref={node => {
            this.canvas = {
              canvas: node,
              ctx: node.getContext('2d'),
              width: node.clientWidth,
              height: node.clientHeight,
              zoom: 1,
              left: 0,
              top: 0,
              contentWidth: imageElements.reduce((total, {width, height}) => total + node.clientHeight * width / height, 0),
              contentHeight: node.clientHeight
            };
          }}>
          YAYAY!
        </canvas>
      </div>
    );
  }
}
