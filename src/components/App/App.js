import React, { Component } from 'react';
// import {
//   fabric
// } from 'fabric';
import styles from './App.scss';

export default class App extends Component {
  constructor() {
    super();
    this.canvas = {};
    this.state = {
      images: [
        'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
        'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
        'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
        'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
        'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000'
      ].map(url => {
        const image = new Image;
        image.src = url;
        return image;
      })
    };
  }

  redraw() {
    const {
      canvas,
      ctx
    } = this.canvas;

    if (canvas && ctx) {
      const {
        images = []
      } = this.state;
      const p1 = ctx.transformedPoint(0, 0);
      const p2 = ctx.transformedPoint(canvas.width, canvas.height);

      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

      images.map((image, index) => {
        ctx.drawImage(image, index * 1010, 0);
      });
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
    let xform = svg.createSVGMatrix();
    // const save = ctx.save;
    // const restore = ctx.restore;
    // const scale = ctx.scale;
    // const rotate = ctx.rotate;
    // const translate = ctx.translate;
    // const transform = ctx.transform;
    // const setTransform = ctx.setTransform;
    const pt  = svg.createSVGPoint();

    ctx.getTransform = () => xform;

    ctx.save = () => {
      savedTransforms.push(xform.translate(0, 0));

      return save.call(ctx);
    };

    ctx.restore = () => {
      xform = savedTransforms.pop();

      return restore.call(ctx);
    };

    ctx.scale = (sx, sy) => {
      xform = xform.scaleNonUniform(sx, sy);

      return scale.call(ctx, sx, sy);
    };

    ctx.rotate = (radians) => {
      xform = xform.rotate(radians * 180 / Math.PI);

      return rotate.call(ctx, radians);
    };

    ctx.translate = (dx, dy) => {
      xform = xform.translate(dx, dy);

      return translate.call(ctx, dx, dy);
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

  zoom(clicks) {
    const {
      ctx,
      scaleFactor,
      lastX,
      lastY
    } = this.canvas;
    const pt = ctx.transformedPoint(lastX, lastY);
    const factor = Math.pow(scaleFactor, clicks);

    ctx.translate(pt.x, pt.y);
    ctx.scale(factor, factor);
    ctx.translate(-pt.x, -pt.y);

    this.redraw();
  }

  componentDidMount() {
    const {
      canvas,
      ctx,
      height,
      width,
    } = this.canvas;
    const kickOut = () => {
      this.trackTransforms();
      this.redraw();
    };

    this.canvas.lastX = canvas.width / 2;
    this.canvas.lastY = canvas.height / 2;
    this.canvas.scaleFactor = 1.1;
    canvas.width = width;
    canvas.height = height;

    canvas.addEventListener('mousedown', (evt) => {
      const lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
      const lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
      const dragStart = ctx.transformedPoint(lastX, lastY);

      this.canvas.lastX = lastX;
      this.canvas.lastY = lastY;
      this.canvas.dragStart = dragStart;
      this.canvas.dragged = false;
    }, false);

    canvas.addEventListener('mousemove', (evt) => {
      const lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
      const lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

      this.canvas.lastX = lastX;
      this.canvas.lastY = lastY;
      this.canvas.dragged = true;

      if (this.canvas.dragStart) {
        const pt = ctx.transformedPoint(lastX, lastY);

        ctx.translate(pt.x - this.canvas.dragStart.x, pt.y - this.canvas.dragStart.y);
        this.redraw();
      }
    }, false);

    canvas.addEventListener('mouseup', (evt) => {
      this.canvas.dragStart = null;

      if (!this.canvas.dragged) {
        this.zoom(evt.shiftKey ? -1 : 1 );
      }
    }, false);

    window.addEventListener('load', kickOut);
  }

  render() {
    return (
      <div className={styles.app}>
        <canvas
          className={styles.canvas}
          ref={node => {
            this.canvas = {
              canvas: node,
              ctx: node.getContext('2d'),
              height: node.clientHeight,
              width: node.clientWidth
            };
          }}>
          YAYAY!
        </canvas>
      </div>
    );
  }
}
