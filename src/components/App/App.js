import React, { Component } from 'react';
import {
  fabric
} from 'fabric';
import styles from './App.scss';

export default class App extends Component {
  componentDidMount() {
    const canvas = new fabric.Canvas('c', {
      height: window.innerHeight,
      width: 1000 * 5
    });
    // let's pretend it's an async call to remote API that gives us
    const images = [
      'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
      'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
      'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
      'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000',
      'https://placeholdit.imgix.net/~text?txtsize=75&txt=1000x1000&w=1000&h=1000'
    ].map((url, index) => {
      fabric.Image.fromURL(url, image => {
        canvas.add(image, {
          top: 0,
          left: index * 1000
        });
      });
    });

    var rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 20,
      height: 20
    });

    // "add" rectangle onto canvas
    canvas.add(rect);

    console.log(images);
    canvas.renderAll();
  }

  render() {
    return (
      <div className={styles.app}>
        <canvas
          className={styles.canvas}
          id="c">
          YAYAY!
        </canvas>
      </div>
    );
  }
}
