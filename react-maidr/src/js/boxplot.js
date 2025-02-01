/**
 * A class representing a box plot.
 * @class
 */
class BoxPlot {
  /**
   * Creates a new instance of BoxPlot.
   * @constructor
   */
  constructor() {
    // the default sections for all boxplots
    this.sections = [
      'lower_outlier',
      'min',
      'q1',
      'q2',
      'q3',
      'max',
      'upper_outlier',
    ];

    // set orientation
    constants.plotOrientation = 'horz';
    if ('axes' in singleMaidr) {
      if ('x' in singleMaidr.axes) {
        if ('level' in singleMaidr.axes.x) {
          constants.plotOrientation = 'vert';
        }
      }
    }

    // title
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
    // subtitle
    this.subtitle = '';
    if ('labels' in singleMaidr) {
      if ('subtitle' in singleMaidr.labels) {
        this.subtitle = singleMaidr.labels.subtitle;
      }
    }
    // caption
    this.caption = '';
    if ('labels' in singleMaidr) {
      if ('caption' in singleMaidr.labels) {
        this.caption = singleMaidr.labels.caption;
      }
    }

    // axes labels
    if ('labels' in singleMaidr) {
      if (!this.x_group_label) {
        if ('x' in singleMaidr.labels) {
          this.x_group_label = singleMaidr.labels.x;
        }
      }
      if (!this.y_group_label) {
        if ('y' in singleMaidr.labels) {
          this.y_group_label = singleMaidr.labels.y;
        }
      }
    }
    if ('axes' in singleMaidr) {
      if ('x' in singleMaidr.axes) {
        if ('label' in singleMaidr.axes.x) {
          if (!this.x_group_label) {
            this.x_group_label = singleMaidr.axes.x.label;
          }
        }
        if ('level' in singleMaidr.axes.x) {
          this.x_labels = singleMaidr.axes.x.level;
        } else {
          this.x_labels = [];
        }
      }
      if ('y' in singleMaidr.axes) {
        if ('label' in singleMaidr.axes.y) {
          if (!this.y_group_label) {
            this.y_group_label = singleMaidr.axes.y.label;
          }
        }
        if ('level' in singleMaidr.axes.y) {
          this.y_labels = singleMaidr.axes.y.level;
        } else {
          this.y_labels = [];
        }
      }
    }

    // main data
    this.plotData = singleMaidr.data;

    // bounds data
    if ('selector' in singleMaidr) {
      let elements = document.querySelector(singleMaidr.selector);
      this.plotBounds = this.GetPlotBounds(elements);
      constants.hasRect = true;
    } else if ('elements' in singleMaidr) {
      this.plotBounds = this.GetPlotBounds(singleMaidr.elements);
      constants.hasRect = true;
    } else {
      constants.hasRect = false;
    }

    this.CleanData();
  }

  /**
   * Cleans up data and extra variables like min/max stuff.
   */
  CleanData() {
    let min, max;
    for (let i = 0; i < this.plotData.length; i++) {
      if (this.plotData[i].lower_outlier) {
        let outlierMin = Math.min(...this.plotData[i].lower_outlier);
        let outlierMax = Math.max(...this.plotData[i].lower_outlier);

        if (min == undefined || outlierMin < min) min = outlierMin;
        if (max == undefined || outlierMax > max) max = outlierMax;
      }
      if (this.plotData[i].min) {
        if (min == undefined || this.plotData[i].min < min)
          min = this.plotData[i].min;
        if (max == undefined || this.plotData[i].max > max)
          max = this.plotData[i].max;
      }
      if (this.plotData[i].q1) {
        if (min == undefined || this.plotData[i].q1 < min)
          min = this.plotData[i].q1;
        if (max == undefined || this.plotData[i].q1 > max)
          max = this.plotData[i].q1;
      }
      if (this.plotData[i].q2) {
        if (min == undefined || this.plotData[i].q2 < min)
          min = this.plotData[i].q2;
        if (max == undefined || this.plotData[i].q2 > max)
          max = this.plotData[i].q2;
      }
      if (this.plotData[i].q3) {
        if (min == undefined || this.plotData[i].q3 < min)
          min = this.plotData[i].q3;
        if (max == undefined || this.plotData[i].q3 > max)
          max = this.plotData[i].q3;
      }
      if (this.plotData[i].max) {
        if (min == undefined || this.plotData[i].max < min)
          min = this.plotData[i].max;
        if (max == undefined || this.plotData[i].max > max)
          max = this.plotData[i].max;
      }
      if (this.plotData[i].upper_outlier) {
        let outlierMin = Math.min(...this.plotData[i].upper_outlier);
        let outlierMax = Math.max(...this.plotData[i].upper_outlier);

        if (min == undefined || outlierMin < min) min = outlierMin;
        if (max == undefined || outlierMax > max) max = outlierMax;
      }
    }

    if (constants.plotOrientation == 'vert') {
      constants.minY = min;
      constants.maxY = max;
      constants.minX = 0;
      constants.maxX = this.plotData.length - 1;
    } else {
      constants.minX = min;
      constants.maxX = max;
      constants.minY = 0;
      constants.maxY = this.plotData.length - 1;
    }
    constants.autoPlayRate = Math.min(
      Math.ceil(constants.AUTOPLAY_DURATION / this.plotData.length),
      constants.MAX_SPEED
    );
    constants.DEFAULT_SPEED = constants.autoPlayRate;
    if (constants.autoPlayRate < constants.MIN_SPEED) {
      constants.MIN_SPEED = constants.autoPlayRate;
    }
  }

  /**
   * Calculates the bounding boxes for all elements in the parent element, including outliers, whiskers, and range.
   * @returns {Array} An array of bounding boxes for all elements.
   */
  GetPlotBounds(elements) {
    // we fetch the elements in our parent,
    // and similar to old GetData we run through and get bounding boxes (or blanks) for everything,
    // and store in an identical structure

    let plotBounds = [];
    let allWeNeed = this.GetAllSegmentTypes();
    let re = /(?:\d+(?:\.\d*)?|\.\d+)/g;

    // get initial set of elements, a parent element for all outliers, whiskers, and range
    let initialElemSet = [];
    let plots = elements.children;
    for (let i = 0; i < plots.length; i++) {
      // each plot
      let plotSet = {};
      let sections = plots[i].children;
      for (let j = 0; j < sections.length; j++) {
        let elemType = this.GetBoxplotSegmentType(
          sections[j].getAttribute('id')
        );
        plotSet[elemType] = sections[j];
      }
      initialElemSet.push(plotSet);
    }

    // we build our structure based on the full set we need, and have blanks as placeholders
    // many of these overlap or are missing, so now we go through and make the actual array structure we need
    // like, all outliers are in 1 set, so we have to split those out and then get the bounding boxes
    for (let i = 0; i < initialElemSet.length; i++) {
      let plotBound = [];

      // we always have a range, and need those bounds to set others, so we'll do this first
      let rangeBounds = initialElemSet[i].range.getBoundingClientRect();

      // we get the midpoint from actual point values in the chart GRID.segments
      let midPoints = initialElemSet[i].range
        .querySelector('polyline[id^="GRID"]')
        .getAttribute('points')
        .match(re);
      let rangePoints = initialElemSet[i].range
        .querySelector('polygon[id^="geom_polygon"]')
        .getAttribute('points')
        .match(re);
      // get midpoint as percentage from bottom to mid to apply to bounding boxes
      // vert: top(rangePoints[1]) | mid(midPoints[1]) | bottom(rangePoints[3])
      // horz: top(rangePoints[0]) | mid(midPoints[0]) | bottom(rangePoints[2])
      let midPercent = 0;
      if (constants.plotOrientation == 'vert') {
        midPercent =
          (midPoints[1] - rangePoints[3]) / (rangePoints[1] - rangePoints[3]);
      } else {
        midPercent =
          (midPoints[0] - rangePoints[2]) / (rangePoints[0] - rangePoints[2]);
      }
      let midSize = 0;
      if (constants.plotOrientation == 'vert') {
        midSize = rangeBounds.height * midPercent;
      } else {
        midSize = rangeBounds.width * midPercent;
      }

      // set bounding box values
      // we critically need x / left, y / top, width, height. We can ignore the rest or let it be wrong

      // 25%
      plotBound[2] = this.convertBoundingClientRectToObj(rangeBounds);
      plotBound[2].label = allWeNeed[2];
      plotBound[2].type = 'range';
      if (constants.plotOrientation == 'vert') {
        plotBound[2].height = midSize;
        plotBound[2].top = plotBound[2].bottom - midSize;
        plotBound[2].y = plotBound[2].top;
      } else {
        plotBound[2].width = midSize;
      }
      // 50%
      plotBound[3] = this.convertBoundingClientRectToObj(rangeBounds);
      plotBound[3].label = allWeNeed[3];
      plotBound[3].type = 'range';
      if (constants.plotOrientation == 'vert') {
        plotBound[3].height = 0;
        plotBound[3].top = rangeBounds.bottom - midSize;
        plotBound[3].y = plotBound[3].top;
        plotBound[3].bottom = plotBound[3].top;
      } else {
        plotBound[3].width = 0;
        plotBound[3].left = rangeBounds.left + midSize;
      }
      // 75%
      plotBound[4] = this.convertBoundingClientRectToObj(rangeBounds);
      plotBound[4].label = allWeNeed[4];
      plotBound[4].type = 'range';
      if (constants.plotOrientation == 'vert') {
        plotBound[4].height = rangeBounds.height - midSize;
        plotBound[4].bottom = plotBound[3].top;
      } else {
        plotBound[4].width = rangeBounds.width - midSize;
        plotBound[4].left = plotBound[3].left;
      }

      // now the tricky ones, outliers and whiskers, if we have them
      if (Object.hasOwn(initialElemSet[i], 'whisker')) {
        // ok great we have a whisker. It could be just above or below or span across the range (in which case we need to split it up). Let's check
        let whiskerBounds = initialElemSet[i].whisker.getBoundingClientRect();
        let hasBelow = false;
        let hasAbove = false;
        if (constants.plotOrientation == 'vert') {
          if (whiskerBounds.bottom > rangeBounds.bottom) hasBelow = true;
          if (whiskerBounds.top < rangeBounds.top) hasAbove = true;
        } else {
          if (whiskerBounds.left < rangeBounds.left) hasBelow = true;
          if (whiskerBounds.right > rangeBounds.right) hasAbove = true;
        }

        // lower whisker
        if (hasBelow) {
          plotBound[1] = this.convertBoundingClientRectToObj(whiskerBounds);
          plotBound[1].label = allWeNeed[1];
          plotBound[1].type = 'whisker';
          if (constants.plotOrientation == 'vert') {
            plotBound[1].top = plotBound[2].bottom;
            plotBound[1].y = plotBound[1].top;
            plotBound[1].height = plotBound[1].bottom - plotBound[1].top;
          } else {
            plotBound[1].width = plotBound[2].left - plotBound[1].left;
          }
        } else {
          plotBound[1] = {};
          plotBound[1].label = allWeNeed[1];
          plotBound[1].type = 'blank';
        }
        // upper whisker
        if (hasAbove) {
          plotBound[5] = this.convertBoundingClientRectToObj(whiskerBounds);
          plotBound[5].label = allWeNeed[5];
          plotBound[5].type = 'whisker';
          if (constants.plotOrientation == 'vert') {
            plotBound[5].bottom = plotBound[4].top;
            plotBound[5].height = plotBound[5].bottom - plotBound[5].top;
          } else {
            plotBound[5].left = plotBound[4].right;
            plotBound[5].x = plotBound[4].right;
            plotBound[5].width = plotBound[5].right - plotBound[5].left;
          }
        } else {
          plotBound[5] = {};
          plotBound[5].label = allWeNeed[5];
          plotBound[5].type = 'blank';
        }
      }
      if (Object.hasOwn(initialElemSet[i], 'outlier')) {
        // we have one or more outliers.
        // Where do they appear? above or below the range? both?
        // we want to split them up and put 1 bounding box around each above and below

        let outlierElems = initialElemSet[i].outlier.children;
        let outlierUpperBounds = null;
        let outlierLowerBounds = null;
        for (let j = 0; j < outlierElems.length; j++) {
          // add this outlier's bounds, or expand if more than one
          let newOutlierBounds = outlierElems[j].getBoundingClientRect();

          if (constants.plotOrientation == 'vert') {
            if (newOutlierBounds.y < rangeBounds.y) {
              // higher, remember y=0 is at the bottom of the page
              if (!outlierUpperBounds) {
                outlierUpperBounds =
                  this.convertBoundingClientRectToObj(newOutlierBounds);
              } else {
                if (newOutlierBounds.y < outlierUpperBounds.y)
                  outlierUpperBounds.y = newOutlierBounds.y;
                if (newOutlierBounds.top < outlierUpperBounds.top)
                  outlierUpperBounds.top = newOutlierBounds.top;
                if (newOutlierBounds.bottom > outlierUpperBounds.bottom)
                  outlierUpperBounds.bottom = newOutlierBounds.bottom;
              }
            } else {
              if (!outlierLowerBounds) {
                outlierLowerBounds =
                  this.convertBoundingClientRectToObj(newOutlierBounds);
              } else {
                if (newOutlierBounds.y < outlierLowerBounds.y)
                  outlierLowerBounds.y = newOutlierBounds.y;
                if (newOutlierBounds.top < outlierLowerBounds.top)
                  outlierLowerBounds.top = newOutlierBounds.top;
                if (newOutlierBounds.bottom > outlierLowerBounds.bottom)
                  outlierLowerBounds.bottom = newOutlierBounds.bottom;
              }
            }
          } else {
            if (newOutlierBounds.x > rangeBounds.x) {
              // higher, remember x=0 is at the left of the page
              if (!outlierUpperBounds) {
                outlierUpperBounds =
                  this.convertBoundingClientRectToObj(newOutlierBounds);
              } else {
                if (newOutlierBounds.x < outlierUpperBounds.x)
                  outlierUpperBounds.x = newOutlierBounds.x;
                if (newOutlierBounds.left < outlierUpperBounds.left)
                  outlierUpperBounds.left = newOutlierBounds.left;
                if (newOutlierBounds.right > outlierUpperBounds.right)
                  outlierUpperBounds.right = newOutlierBounds.right;
              }
            } else {
              if (!outlierLowerBounds) {
                outlierLowerBounds =
                  this.convertBoundingClientRectToObj(newOutlierBounds);
              } else {
                if (newOutlierBounds.x < outlierLowerBounds.x)
                  outlierLowerBounds.x = newOutlierBounds.x;
                if (newOutlierBounds.left < outlierLowerBounds.left)
                  outlierLowerBounds.left = newOutlierBounds.left;
                if (newOutlierBounds.right > outlierLowerBounds.right)
                  outlierLowerBounds.right = newOutlierBounds.right;
              }
            }
          }
        }

        // now we add plotBound outlier stuff
        if (outlierLowerBounds) {
          outlierLowerBounds.height =
            outlierLowerBounds.bottom - outlierLowerBounds.top;
          outlierLowerBounds.width =
            outlierLowerBounds.right - outlierLowerBounds.left;

          plotBound[0] =
            this.convertBoundingClientRectToObj(outlierLowerBounds);
          plotBound[0].label = allWeNeed[0];
          plotBound[0].type = 'outlier';
        } else {
          plotBound[0] = {};
          plotBound[0].label = allWeNeed[0];
          plotBound[0].type = 'blank';
        }
        if (outlierUpperBounds) {
          outlierUpperBounds.height =
            outlierUpperBounds.bottom - outlierUpperBounds.top;
          outlierUpperBounds.width =
            outlierUpperBounds.right - outlierUpperBounds.left;

          plotBound[6] =
            this.convertBoundingClientRectToObj(outlierUpperBounds);
          plotBound[6].label = allWeNeed[6];
          plotBound[6].type = 'outlier';
        } else {
          plotBound[6] = {};
          plotBound[6].label = allWeNeed[6];
          plotBound[6].type = 'blank';
        }
      } else {
        // add all blanks
        plotBound[0] = {};
        plotBound[0].label = allWeNeed[0];
        plotBound[0].type = 'blank';
        plotBound[6] = {};
        plotBound[6].label = allWeNeed[6];
        plotBound[6].type = 'blank';
      }

      plotBounds.push(plotBound);
    }

    if (constants.debugLevel > 5) {
      console.log('plotBounds', plotBounds);
    }

    return plotBounds;
  }

  /**
   * Returns an array of all segment types needed for a box plot.
   * @returns {string[]} Array of segment types.
   */
  GetAllSegmentTypes() {
    let allWeNeed = [];
    for (let i = 0; i < this.sections.length; i++) {
      allWeNeed.push(resources.GetString(this.sections[i]));
    }

    return allWeNeed;
  }

  /**
   * Returns the type of boxplot segment based on the section id.
   * @param {string} sectionId - The section id to determine the segment type.
   * @returns {string} - The type of boxplot segment ('range', 'whisker', or 'outlier').
   */
  GetBoxplotSegmentType(sectionId) {
    // Helper function for main GetData:
    // Fetch type, which comes from section id:
    // geom_polygon = range
    // GRID = whisker
    // points = outlier

    let segmentType = 'outlier'; // default? todo: should probably default null, and then throw error instead of return if not set after ifs
    if (sectionId.includes('geom_crossbar')) {
      segmentType = 'range';
    } else if (sectionId.includes('GRID')) {
      segmentType = 'whisker';
    } else if (sectionId.includes('points')) {
      segmentType = 'outlier';
    }

    return segmentType;
  }

  /**
   * Helper function for main GetData: Fetch x and y point data from chart
   * @param {Object} segment - The segment object to get points from
   * @param {string} segmentType - The type of segment ('range', 'outlier', or 'whisker')
   * @returns {Array} - An array of x and y point data from the chart
   */
  GetBoxplotSegmentPoints(segment, segmentType) {
    // Helper function for main GetData:
    // Fetch x and y point data from chart

    let re = /(?:\d+(?:\.\d*)?|\.\d+)/g;
    let pointString = '';
    let points = [];
    if (segmentType == 'range') {
      // ranges go a level deeper
      let matches = segment.children[0].getAttribute('points').match(re);
      points.push(matches[0], matches[1]);
      // the middle bar has 2 points but we just need one, check if they're the same
      if (matches[0] != matches[2]) {
        points.push(matches[2], matches[3]);
      }
    } else if (segmentType == 'outlier') {
      // outliers use x attr directly, but have multiple children
      points.push(segment.getAttribute('x'), segment.getAttribute('y'));
    } else {
      // whisker. Get first and third number from points attr
      // but sometimes it's null, giving the same for both, and don't add if that's true
      let matches = segment.getAttribute('points').match(re);
      if (constants.plotOrientation == 'vert') {
        if (matches[1] != matches[3]) {
          points.push(matches[0], matches[1], matches[2], matches[3]);
        }
      } else {
        if (matches[0] != matches[2]) {
          points.push(matches[0], matches[1], matches[2], matches[3]);
        }
      }
    }

    return points;
  }
  /**
   * Returns an array of all the segment types needed for a box plot.
   * @returns {string[]} Array of segment types.
   */
  GetAllSegmentTypes() {
    let allWeNeed = [
      resources.GetString('lower_outlier'),
      resources.GetString('min'),
      resources.GetString('25'),
      resources.GetString('50'),
      resources.GetString('75'),
      resources.GetString('max'),
      resources.GetString('upper_outlier'),
    ];

    return allWeNeed;
  }

  /**
   * Converts a DOMRect object to a plain object with properties for top, right, bottom, left, width, height, x, and y.
   * @param {DOMRect} rect - The DOMRect object to convert.
   * @returns {Object} An object with properties for top, right, bottom, left, width, height, x, and y.
   */
  convertBoundingClientRectToObj(rect) {
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
    };
  }

  /**
   * Plays tones based on the plot data and position.
   */
  PlayTones() {
    // init
    let plotPos = null;
    let sectionKey = null;
    if (constants.outlierInterval) clearInterval(constants.outlierInterval);
    if (constants.plotOrientation == 'vert') {
      plotPos = position.x;
      sectionKey = this.GetSectionKey(position.y);
    } else {
      plotPos = position.y;
      sectionKey = this.GetSectionKey(position.x);
    }

    // chose tone to play
    if (plot.plotData[plotPos][sectionKey] == null) {
      audio.PlayNull();
    } else if (sectionKey != 'lower_outlier' && sectionKey != 'upper_outlier') {
      // normal tone
      audio.playTone();
    } else if (plot.plotData[plotPos][sectionKey].length == 0) {
      audio.PlayNull();
    } else {
      // outlier(s): we play a run of tones
      position.z = 0;
      constants.outlierInterval = setInterval(function () {
        // play this tone
        audio.playTone();

        // and then set up for the next one
        position.z += 1;

        // and kill if we're done
        if (plot.plotData[plotPos][sectionKey] == null) {
          clearInterval(constants.outlierInterval);
          position.z = -1;
        } else if (position.z + 1 > plot.plotData[plotPos][sectionKey].length) {
          clearInterval(constants.outlierInterval);
          position.z = -1;
        }
      }, constants.autoPlayOutlierRate);
    }
  }

  /**
   * Returns the section key at the specified position.
   * @param {number} sectionPos - The position of the section.
   * @returns {string} The section key.
   */
  GetSectionKey(sectionPos) {
    return this.sections[sectionPos];
  }
}

// BoxplotRect class
// Initializes and updates the visual outline around sections of the chart
/**
 * Represents a rectangular box in a box plot chart.
 * @class
 */
class BoxplotRect {
  /**
   * The padding between rectangles in pixels.
   * @type {number}
   */
  rectPadding = 15; // px
  /**
   * The stroke width of the rectangle in the box plot.
   * @type {number}
   */
  rectStrokeWidth = 4; // px

  /**
   * Creates a new BoxPlot object.
   * @constructor
   */
  constructor() {
    this.x1 = 0;
    this.width = 0;
    this.y1 = 0;
    this.height = 0;
    this.chartOffsetLeft = constants.chart.getBoundingClientRect().left;
    this.chartOffsetTop = constants.chart.getBoundingClientRect().top;
  }

  /**
   * Updates the bounding box values from the object and gets bounds of visual outline to be drawn.
   */
  UpdateRect() {
    if (document.getElementById('highlight_rect'))
      document.getElementById('highlight_rect').remove(); // destroy to be recreated

    let plotPos = position.x;
    let sectionPos = position.y;
    let sectionKey = plot.GetSectionKey(position.y);
    if (constants.plotOrientation == 'vert') {
    } else {
      plotPos = position.y;
      sectionPos = position.x;
      sectionKey = plot.GetSectionKey(position.x);
    }

    if (
      (constants.plotOrientation == 'vert' && position.y > -1) ||
      (constants.plotOrientation == 'horz' && position.x > -1)
    ) {
      // initial value could be -1, which throws errors, so ignore that

      let bounds = plot.plotBounds[plotPos][sectionPos];

      if (bounds.type != 'blank') {
        //let chartBounds = constants.chart.getBoundingClientRect();

        this.x1 = bounds.left - this.rectPadding - this.chartOffsetLeft;
        this.width = bounds.width + this.rectPadding * 2;
        this.y1 = bounds.top - this.rectPadding - this.chartOffsetTop;
        this.height = bounds.height + this.rectPadding * 2;

        if (constants.debugLevel > 5) {
          console.log(
            'Point',
            sectionKey,
            'bottom:',
            bounds.bottom,
            'top:',
            bounds.top
          );
          console.log(
            'x1:',
            this.x1,
            'y1:',
            this.y1,
            'width:',
            this.width,
            'height:',
            this.height
          );
        }

        this.CreateRectDisplay();
      }
    }
  }

  /**
   * Creates a visual outline using the given bounding points.
   * @function
   * @memberof module:boxplot.js
   * @returns {void}
   */
  CreateRectDisplay() {
    // CreateRectDisplay takes bounding points and creates the visual outline

    const svgns = 'http://www.w3.org/2000/svg';
    let rect = document.createElementNS(svgns, 'rect');
    rect.setAttribute('id', 'highlight_rect');
    rect.setAttribute('x', this.x1);
    rect.setAttribute('y', this.y1); // y coord is inverse from plot data
    rect.setAttribute('width', this.width);
    rect.setAttribute('height', this.height);
    rect.setAttribute('stroke', constants.colorSelected);
    rect.setAttribute('stroke-width', this.rectStrokeWidth);
    rect.setAttribute('fill', 'none');
    constants.chart.appendChild(rect);
  }
}
