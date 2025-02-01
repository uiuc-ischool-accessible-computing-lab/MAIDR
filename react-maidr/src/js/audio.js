/**
 * Audio class
 * Sets up audio stuff (compressor, gain),
 * sets up an oscillator that has good falloff (no clipping sounds) and can be instanced to be played anytime and can handle overlaps,
 * sets up an actual playTone function that plays tones based on current chart position
 *
 * @class
 */
class Audio {
  constructor() {
    this.AudioContext = window['AudioContext'] || window['webkitAudioContext'];
    this.audioContext = new AudioContext();
    this.compressor = this.compressorSetup(this.audioContext);
  }

  /**
   * Sets up a dynamics compressor for better audio quality.
   * @returns {DynamicsCompressorNode} The created compressor.
   */
  compressorSetup() {
    let compressor = this.audioContext.createDynamicsCompressor(); // create compressor for better audio quality

    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;
    let gainMaster = this.audioContext.createGain(); // create master gain
    gainMaster.gain.value = constants.vol;
    compressor.connect(gainMaster);
    gainMaster.connect(this.audioContext.destination);

    return compressor;
  }

  /**
   * Initilizes a tone play based on the current chart type and position.
   * Triggers playOscillator() with the correct parameters.
   */
  playTone(params = null) {
    let currentDuration = constants.duration;
    let volume = constants.vol;
    if (params != null) {
      if (params.volScale != null) {
        volume = params.volScale * constants.vol;
      }
    }

    let rawPanning = 0;
    let rawFreq = 0;
    let frequency = 0;
    let panning = 0;

    let waveType = 'sine';

    // freq goes between min / max as rawFreq goes between min(0) / max
    if (constants.chartType == 'bar') {
      rawFreq = plot.plotData[position.x];
      rawPanning = position.x;
      frequency = this.SlideBetween(
        rawFreq,
        constants.minY,
        constants.maxY,
        constants.MIN_FREQUENCY,
        constants.MAX_FREQUENCY
      );
      panning = this.SlideBetween(
        rawPanning,
        constants.minX,
        constants.maxX,
        -1,
        1
      );
    } else if (constants.chartType == 'box') {
      let plotPos =
        constants.plotOrientation == 'vert' ? position.x : position.y;
      let sectionKey = plot.GetSectionKey(
        constants.plotOrientation == 'vert' ? position.y : position.x
      );
      if (Array.isArray(plot.plotData[plotPos][sectionKey])) {
        // outliers are stored in values with a seperate itterator
        rawFreq = plot.plotData[plotPos][sectionKey][position.z];
      } else {
        // normal points
        rawFreq = plot.plotData[plotPos][sectionKey];
      }
      if (plot.plotData[plotPos][sectionKey] != null) {
        if (constants.plotOrientation == 'vert') {
          frequency = this.SlideBetween(
            rawFreq,
            constants.minY,
            constants.maxY,
            constants.MIN_FREQUENCY,
            constants.MAX_FREQUENCY
          );
          panning = this.SlideBetween(
            rawFreq,
            constants.minY,
            constants.maxY,
            -1,
            1
          );
        } else {
          frequency = this.SlideBetween(
            rawFreq,
            constants.minX,
            constants.maxX,
            constants.MIN_FREQUENCY,
            constants.MAX_FREQUENCY
          );
          panning = this.SlideBetween(
            rawFreq,
            constants.minX,
            constants.maxX,
            -1,
            1
          );
        }
      } else {
        frequency = constants.MIN_FREQUENCY;
        panning = 0;
      }
    } else if (constants.chartType == 'heat') {
      rawFreq = plot.data[position.y][position.x];
      rawPanning = position.x;
      frequency = this.SlideBetween(
        rawFreq,
        constants.minY,
        constants.maxY,
        constants.MIN_FREQUENCY,
        constants.MAX_FREQUENCY
      );
      panning = this.SlideBetween(
        rawPanning,
        constants.minX,
        constants.maxX,
        -1,
        1
      );
    } else if (
      constants.chartType == 'point' ||
      constants.chartType == 'smooth'
    ) {
      // are we using global min / max, or just this layer?
      constants.globalMinMax = true;
      let chartMin = constants.minY;
      let chartMax = constants.maxY;
      if (constants.chartType == 'smooth') {
        chartMin = plot.curveMinY;
        chartMax = plot.curveMaxY;
      }
      if (constants.globalMinMax) {
        chartMin = Math.min(constants.minY, plot.curveMinY);
        chartMax = Math.max(constants.maxY, plot.curveMaxY);
      }
      if (constants.chartType == 'point') {
        // point layer
        // more than one point with same x-value
        rawFreq = plot.y[position.x][position.z];
        if (plot.max_count == 1) {
          volume = constants.vol;
        } else {
          volume = this.SlideBetween(
            plot.points_count[position.x][position.z],
            1,
            plot.max_count,
            constants.vol,
            constants.MAX_VOL
          );
        }

        rawPanning = position.x;
        frequency = this.SlideBetween(
          rawFreq,
          chartMin,
          chartMax,
          constants.MIN_FREQUENCY,
          constants.MAX_FREQUENCY
        );
        panning = this.SlideBetween(rawPanning, chartMin, chartMax, -1, 1);
      } else if (constants.chartType == 'smooth') {
        // best fit smooth layer

        rawFreq = plot.curvePoints[positionL1.x];
        rawPanning = positionL1.x;
        frequency = this.SlideBetween(
          rawFreq,
          chartMin,
          chartMax,
          constants.MIN_FREQUENCY,
          constants.MAX_FREQUENCY
        );
        panning = this.SlideBetween(rawPanning, chartMin, chartMax, -1, 1);
      }
    } else if (constants.chartType == 'hist') {
      rawFreq = plot.plotData[position.x].y;
      rawPanning = plot.plotData[position.x].x;
      frequency = this.SlideBetween(
        rawFreq,
        constants.minY,
        constants.maxY,
        constants.MIN_FREQUENCY,
        constants.MAX_FREQUENCY
      );
      panning = this.SlideBetween(
        rawPanning,
        constants.minX,
        constants.maxX,
        -1,
        1
      );
    } else if (constants.chartType == 'line') {
      rawFreq = plot.pointValuesY[position.x];
      rawPanning = position.x;
      frequency = this.SlideBetween(
        rawFreq,
        constants.minY,
        constants.maxY,
        constants.MIN_FREQUENCY,
        constants.MAX_FREQUENCY
      );
      panning = this.SlideBetween(
        rawPanning,
        constants.minX,
        constants.maxX,
        -1,
        1
      );
    } else if (
      constants.chartType == 'stacked_bar' ||
      constants.chartType == 'stacked_normalized_bar' ||
      constants.chartType == 'dodged_bar'
    ) {
      rawFreq = plot.plotData[position.x][position.y];
      if (rawFreq == 0) {
        this.PlayNull();
        return;
      } else if (Array.isArray(rawFreq)) {
        rawFreq = rawFreq[position.z];
      }
      rawPanning = position.x;
      frequency = this.SlideBetween(
        rawFreq,
        constants.minY,
        constants.maxY,
        constants.MIN_FREQUENCY,
        constants.MAX_FREQUENCY
      );
      panning = this.SlideBetween(
        rawPanning,
        constants.minX,
        constants.maxX,
        -1,
        1
      );
      let waveTypeArr = ['triangle', 'square', 'sawtooth', 'sine'];
      waveType = waveTypeArr[position.y];
    }

    if (constants.debugLevel > 5) {
      console.log('will play tone at freq', frequency);
      if (constants.chartType == 'box') {
        console.log(
          'based on',
          constants.minY,
          '<',
          rawFreq,
          '<',
          constants.maxY,
          ' | freq min',
          constants.MIN_FREQUENCY,
          'max',
          constants.MAX_FREQUENCY
        );
      } else {
        console.log(
          'based on',
          constants.minX,
          '<',
          rawFreq,
          '<',
          constants.maxX,
          ' | freq min',
          constants.MIN_FREQUENCY,
          'max',
          constants.MAX_FREQUENCY
        );
      }
    }

    if (constants.chartType == 'box') {
      // different types of sounds for different regions.
      // outlier = short tone
      // whisker = normal tone
      // range = chord
      let sectionKey = plot.GetSectionKey(
        constants.plotOrientation == 'vert' ? position.y : position.x
      );
      if (sectionKey == 'lower_outlier' || sectionKey == 'upper_outlier') {
        currentDuration = constants.outlierDuration;
      } else if (
        sectionKey == 'q1' ||
        sectionKey == 'q2' ||
        sectionKey == 'q3'
      ) {
        //currentDuration = constants.duration * 2;
      } else {
        //currentDuration = constants.duration * 2;
      }
    }

    // create tones
    this.playOscillator(frequency, currentDuration, panning, volume, waveType);
    if (constants.chartType == 'box') {
      let sectionKey = plot.GetSectionKey(
        constants.plotOrientation == 'vert' ? position.y : position.x
      );
      if (sectionKey == 'q1' || sectionKey == 'q2' || sectionKey == 'q3') {
        // also play an octive below at lower vol
        let freq2 = frequency / 2;
        this.playOscillator(
          freq2,
          currentDuration,
          panning,
          constants.vol / 4,
          'triangle'
        );
      }
    } else if (constants.chartType == 'heat') {
      // Added heatmap tone feature
      if (rawFreq == 0) {
        this.PlayNull();
      }
    }
  }

  /**
   * Plays an oscillator with the given frequency, duration, panning, volume, and wave type.
   * Typically used by playTone(), which does all the heavy lifting.
   * @param {number} frequency - The frequency of the oscillator.
   * @param {number} currentDuration - The duration of the oscillator in seconds.
   * @param {number} panning - The panning value of the oscillator.
   * @param {number} [currentVol=1] - The volume of the oscillator.
   * @param {string} [wave='sine'] - The wave type of the oscillator.
   */
  playOscillator(
    frequency,
    currentDuration,
    panning,
    currentVol = 1,
    wave = 'sine'
  ) {
    const t = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = wave;
    oscillator.frequency.value = parseFloat(frequency);
    oscillator.start();

    // create gain for this event
    const gainThis = this.audioContext.createGain();
    gainThis.gain.setValueCurveAtTime(
      [
        0.5 * currentVol,
        1 * currentVol,
        0.5 * currentVol,
        0.5 * currentVol,
        0.5 * currentVol,
        0.1 * currentVol,
        1e-4 * currentVol,
      ],
      t,
      currentDuration
    ); // this is what makes the tones fade out properly and not clip

    let MAX_DISTANCE = 10000;
    let posZ = 1;
    const panner = new PannerNode(this.audioContext, {
      panningModel: 'HRTF',
      distanceModel: 'linear',
      positionX: position.x,
      positionY: position.y,
      positionZ: posZ,
      plotOrientationX: 0.0,
      plotOrientationY: 0.0,
      plotOrientationZ: -1.0,
      refDistance: 1,
      maxDistance: MAX_DISTANCE,
      rolloffFactor: 10,
      coneInnerAngle: 40,
      coneOuterAngle: 50,
      coneOuterGain: 0.4,
    });

    // create panning
    const stereoPanner = this.audioContext.createStereoPanner();
    stereoPanner.pan.value = panning;
    oscillator.connect(gainThis);
    gainThis.connect(stereoPanner);
    stereoPanner.connect(panner);
    panner.connect(this.compressor);

    // create panner node

    // play sound for duration
    setTimeout(() => {
      panner.disconnect();
      gainThis.disconnect();
      oscillator.stop();
      oscillator.disconnect();
    }, currentDuration * 1e3 * 2);
  }

  /**
   * Plays a smooth sound with the given frequency array, duration, panning array, volume, and wave type.
   * The idea here is you give it an array of frequencies, and it plays them smoothly in order, like listening to a whole line chart
   * @param {number[]} freqArr - The array of frequencies to play.
   * @param {number} currentDuration - The duration of the sound in seconds.
   * @param {number[]} panningArr - The array of panning values.
   * @param {number} currentVol - The volume of the sound.
   * @param {string} wave - The type of wave to use for the oscillator.
   */
  playSmooth(
    freqArr = [600, 500, 400, 300],
    currentDuration = 2,
    panningArr = [-1, 0, 1],
    currentVol = 1,
    wave = 'sine'
  ) {
    // todo: make smooth duration dependant on how much line there is to do. Like, at max it should be max duration, but if we only have like a tiny bit to play we should just play for a tiny bit

    let gainArr = new Array(freqArr.length * 3).fill(0.5 * currentVol);
    gainArr.push(1e-4 * currentVol);

    const t = this.audioContext.currentTime;
    const smoothOscillator = this.audioContext.createOscillator();
    smoothOscillator.type = wave;
    smoothOscillator.frequency.setValueCurveAtTime(freqArr, t, currentDuration);
    smoothOscillator.start();
    constants.isSmoothAutoplay = true;

    // create gain for this event
    this.smoothGain = this.audioContext.createGain();
    this.smoothGain.gain.setValueCurveAtTime(gainArr, t, currentDuration); // this is what makes the tones fade out properly and not clip

    let MAX_DISTANCE = 10000;
    let posZ = 1;
    const panner = new PannerNode(this.audioContext, {
      panningModel: 'HRTF',
      distanceModel: 'linear',
      positionX: position.x,
      positionY: position.y,
      positionZ: posZ,
      plotOrientationX: 0.0,
      plotOrientationY: 0.0,
      plotOrientationZ: -1.0,
      refDistance: 1,
      maxDistance: MAX_DISTANCE,
      rolloffFactor: 10,
      coneInnerAngle: 40,
      coneOuterAngle: 50,
      coneOuterGain: 0.4,
    });

    // create panning
    const stereoPanner = this.audioContext.createStereoPanner();
    stereoPanner.pan.setValueCurveAtTime(panningArr, t, currentDuration);
    smoothOscillator.connect(this.smoothGain);
    this.smoothGain.connect(stereoPanner);
    stereoPanner.connect(panner);
    panner.connect(this.compressor);

    // play sound for duration
    constants.smoothId = setTimeout(() => {
      panner.disconnect();
      this.smoothGain.disconnect();
      smoothOscillator.stop();
      smoothOscillator.disconnect();
      constants.isSmoothAutoplay = false;
    }, currentDuration * 1e3 * 2);
  }

  /**
   * Initializes play of a custom null frequency sound.
   * Calls the usual playOscillator() to do so.
   */
  PlayNull() {
    let frequency = constants.NULL_FREQUENCY;
    let duration = constants.duration;
    let panning = 0;
    let vol = constants.vol;
    let wave = 'triangle';

    this.playOscillator(frequency, duration, panning, vol, wave);

    setTimeout(
      function (audioThis) {
        audioThis.playOscillator(
          (frequency * 23) / 24,
          duration,
          panning,
          vol,
          wave
        );
      },
      Math.round((duration / 5) * 1000),
      this
    );
  }

  /**
   * Plays a pleasant end chime.
   * @function
   * @memberof audio
   * @returns {void}
   */
  playEnd() {
    // play a pleasent end chime. We'll use terminal chime from VSCode
    if (constants.canPlayEndChime) {
      let chimeClone = constants.endChime.cloneNode(true); // we clone so that we can trigger a tone while one is already playing
      /* 
             * the following (panning) only works if we're on a server
        let panning = 0;
        try {
            if ( constants.chartType == 'bar' ) {
                panning = this.SlideBetween(position.x, 0, plot.bars.length-1, -1, 1);
            } else if ( constants.chartType == 'box' ) {
                panning = this.SlideBetween(position.x, 0, plot.plotData[position.y].length-1, -1, 1);
            } else if ( constants.chartType == 'heat' ) {
                panning = this.SlideBetween(position.x, 0, plot.num_cols-1, -1, 1);
            } else if ( constants.chartType == 'point' ) {
                panning = this.SlideBetween(position.x, 0, plot.x.length-1, -1, 1);
            }
        } catch {
        }

        const track = this.audioContext.createMediaElementSource(chimeClone);
        const stereoNode = new StereoPannerNode(this.audioContext, {pan:panning} );
        track.connect(stereoNode).connect(this.audioContext.destination);
        */
      chimeClone.play();
      chimeClone = null;
    }
  }

  /**
   * Stops the smooth gain and cancels any scheduled values.
   * @function
   * @memberof Audio
   * @instance
   * @returns {void}
   */
  KillSmooth() {
    if (constants.smoothId) {
      this.smoothGain.gain.cancelScheduledValues(0);
      this.smoothGain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.audioContext.currentTime + 0.03
      );

      clearTimeout(constants.smoothId);

      constants.isSmoothAutoplay = false;
    }
  }

  /**
   * Goes between min and max proportional to how val goes between a and b.
   * @param {number} val - The value to slide between a and b.
   * @param {number} a - The start value of the slide.
   * @param {number} b - The end value of the slide.
   * @param {number} min - The minimum value of the slide.
   * @param {number} max - The maximum value of the slide.
   * @returns {number} The new value between min and max.
   */
  SlideBetween(val, a, b, min, max) {
    val = Number(val);
    a = Number(a);
    b = Number(b);
    min = Number(min);
    max = Number(max);
    let newVal = ((val - a) / (b - a)) * (max - min) + min;
    if (a == 0 && b == 0) {
      newVal = 0;
    }
    return newVal;
  }
}
