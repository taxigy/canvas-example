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

  kickOut() {
    const {
      canvas,
      ctx,
      height,
      width,
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
      this.zoom(event.shiftKey ? -1 : 1);
    }, false);

    canvas.addEventListener('wheel', (event) => {
      this.canvas.ctx.translate(event.wheelDeltaX / 4, event.wheelDeltaY / 4);
      this.redraw();
    }, false);

    this.trackTransforms();
    this.redraw();
  }

  redraw() {
    const {
      canvas,
      ctx,
      height,
      width
    } = this.canvas;

    if (canvas && ctx) {
      const {
        images = []
      } = this.state;
      const p1 = ctx.transformedPoint(0, 0);
      const p2 = ctx.transformedPoint(width, height);

      ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      images.map((image, index) => {
        ctx.drawImage(image, index * 1000, 0);
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

      if (next.left <= 0 && next.left >= zoom * (width - contentWidth)) {
        this.canvas.left = next.left;
        xform = xform.translate(dx, 0);

        translate.call(ctx, dx, 0);
      }

      if (next.top <= 0 && next.top >= zoom * (height - contentHeight)) {
        this.canvas.top = next.top;
        xform = xform.translate(0, dy);

        translate.call(ctx, 0, dy);
      }

      // if (next.top <= 0 && next.left <= 0) {
      //   this.canvas.left = next.left;
      //   this.canvas.top = next.top;
      //   xform = xform.translate(dx, dy);

      //   return translate.call(ctx, dx, dy);
      // } else {
      //   return translate.call(ctx, 0, 0);
      // }
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

  zoom() {
    const {
      ctx,
      lastX,
      lastY,
      zoom
    } = this.canvas;
    console.log(typeof zoom, zoom);
    const minZoom = 1;
    const maxZoom = 2;
    const pt = ctx.transformedPoint(lastX, lastY);
    const factor = zoom <= minZoom ? maxZoom : 1 / maxZoom;

    this.canvas.zoom = factor;
    ctx.translate(pt.x, pt.y);
    ctx.scale(factor, factor);
    ctx.translate(-pt.x, -pt.y);
    this.redraw();
  }

  componentDidMount() {
    window.addEventListener('load', () => {
      this.kickOut();
    });
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
              width: node.clientWidth,
              zoom: 1,
              top: 0,
              left: 0,
              contentWidth: this.state.images.length * 1000,
              contentHeight: 1000
            };
          }}>
          YAYAY!
        </canvas>
      </div>
    );
  }
}
