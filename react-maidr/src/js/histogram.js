/**
 * A class representing a histogram.
 * @class
 */
class Histogram {
  /**
   * Creates a new Histogram object.
   * @constructor
   */
  constructor() {
    // initialize main data: data, elements

    // data (required)
    if ('data' in singleMaidr) {
      this.plotData = singleMaidr.data;
    } else {
      console.log('Error: no data found');
      return;
    }
    // elements (optional)
    this.bars = null;
    if ('selector' in singleMaidr) {
      this.bars = document.querySelectorAll(singleMaidr.selector);
    } else if ('elements' in singleMaidr) {
      this.bars = singleMaidr.elements;
    }

    // labels (optional)
    this.legendX = null;
    this.legendY = null;
    if ('labels' in singleMaidr) {
      if ('x' in singleMaidr.labels) {
        this.legendX = singleMaidr.labels.x;
      }
      if ('y' in singleMaidr.labels) {
        this.legendY = singleMaidr.labels.y;
      }
    }
    if ('axes' in singleMaidr) {
      if ('x' in singleMaidr.axes) {
        if ('label' in singleMaidr.axes.x) {
          if (!this.legendX) {
            this.legendX = singleMaidr.axes.x.label;
          }
        }
      }
      if ('y' in singleMaidr.axes) {
        if ('label' in singleMaidr.axes.y) {
          if (!this.legendY) {
            this.legendY = singleMaidr.axes.y.label;
          }
        }
      }
    }

    // tick labels: todo, not sure if they'll exist or not

    // title (optional)
    this.title = '';
    if ('labels' in singleMaidr) {
      if ('title' in singleMaidr.labels) {
        this.title = singleMaidr.labels.title;
      }
    }
    if (this.title == '') {
      if ('title' in singleMaidr) {
        this.title = singleMaidr.title;
      }
    }

    // title (optional)
    if ('labels' in singleMaidr) {
      if ('subtitle' in singleMaidr.labels) {
        this.subtitle = singleMaidr.labels.subtitle;
      }
    }
    // title (optional)
    if ('labels' in singleMaidr) {
      if ('caption' in singleMaidr.labels) {
        this.caption = singleMaidr.labels.caption;
      }
    }

    this.SetMaxMin();

    this.autoplay = null;
  }

  /**
   * Plays a tone using the audio object.
   */
  PlayTones() {
    audio.playTone();
  }

  /**
   * Sets the maximum and minimum values for the plot data.
   */
  SetMaxMin() {
    for (let i = 0; i < this.plotData.length; i++) {
      if (i == 0) {
        constants.maxY = this.plotData[i].y;
        constants.minY = this.plotData[i].y;
        constants.maxX = this.plotData[i].xmax;
        constants.minX = this.plotData[i].xmin;
      } else {
        if (this.plotData[i].y > constants.maxY) {
          constants.maxY = this.plotData[i].y;
        }
        if (this.plotData[i].y < constants.minY) {
          constants.minY = this.plotData[i].y;
        }
        if (this.plotData[i].xmax > constants.maxX) {
          constants.maxX = this.plotData[i].xmax;
        }
        if (this.plotData[i].xmin < constants.minX) {
          constants.minX = this.plotData[i].xmin;
        }
      }
    }
    constants.autoPlayRate = Math.min(
      Math.ceil(constants.AUTOPLAY_DURATION / (constants.maxX + 1)),
      constants.MAX_SPEED
    );
    constants.DEFAULT_SPEED = constants.autoPlayRate;
    if (constants.autoPlayRate < constants.MIN_SPEED) {
      constants.MIN_SPEED = constants.autoPlayRate;
    }
  }

  /**
   * Selects an element and changes its color.
   */
  Select() {
    this.UnSelectPrevious();
    if (this.bars) {
      this.activeElement = this.bars[position.x];
      if (this.activeElement) {
        // Case where fill is a direct attribute
        if (this.activeElement.hasAttribute('fill')) {
          this.activeElementColor = this.activeElement.getAttribute('fill');
          // Get new color to highlight and replace fill value
          this.activeElement.setAttribute(
              'fill',
              constants.GetBetterColor(this.activeElementColor)
          );
          // Case where fill is within the style attribute
        } else if (
            this.activeElement.hasAttribute('style') &&
            this.activeElement.getAttribute('style').indexOf('fill') !== -1
        ) {
          let styleString = this.activeElement.getAttribute('style');
          // Extract all style attributes and values
          let styleArray = constants.GetStyleArrayFromString(styleString);
          this.activeElementColor = styleArray[styleArray.indexOf('fill') + 1];
          // Get new color to highlight and replace fill value in style array
          styleArray[styleArray.indexOf('fill') + 1] = constants.GetBetterColor(
              this.activeElementColor
          );
          // Recreate style string and set style attribute
          styleString = constants.GetStyleStringFromArray(styleArray);
          this.activeElement.setAttribute('style', styleString);
        }
      }
    }
  }

  /**
   * Unselects the previously selected element by setting its fill attribute to the original color.
   * @function
   * @name UnSelectPrevious
   * @memberof module:histogram
   * @instance
   * @returns {void}
   */
  UnSelectPrevious() {
    if (this.activeElement) {
      // set fill attribute to the original color
      if (this.activeElement.hasAttribute('fill')) {
        this.activeElement.setAttribute('fill', this.activeElementColor);
        this.activeElement = null;
      } else if (
          this.activeElement.hasAttribute('style') &&
          this.activeElement.getAttribute('style').indexOf('fill') !== -1
      ) {
        let styleString = this.activeElement.getAttribute('style');
        let styleArray = constants.GetStyleArrayFromString(styleString);
        styleArray[styleArray.indexOf('fill') + 1] = this.activeElementColor;
        // Recreate style string and set style attribute
        styleString = constants.GetStyleStringFromArray(styleArray);
        this.activeElement.setAttribute('style', styleString);
        this.activeElement = null;
      }
    }
  }
}
