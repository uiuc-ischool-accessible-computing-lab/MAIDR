/**
 * A class representing system vars, user config vars, and helper functions used throughout the application.
 *
 * @class
 */
class Constants {
  chart_container_id = 'chart-container';
  main_container_id = 'maidr-container';
  //chart_container_class = 'chart-container'; // remove later
  braille_container_id = 'braille-div';
  braille_input_id = 'braille-input';
  info_id = 'info';
  announcement_container_id = 'announcements';
  end_chime_id = 'end_chime';
  container_id = 'container';
  project_id = 'maidr';
  review_id_container = 'review_container';
  review_id = 'review';
  reviewSaveSpot;
  reviewSaveBrailleMode;
  chartId = '';
  events = [];
  postLoadEvents = [];

  constructor() {}

  // BTS modes initial values
  textMode = 'verbose'; // off / terse / verbose
  brailleMode = 'off'; // on / off
  sonifMode = 'on'; // sep / same / off
  reviewMode = 'off'; // on / off

  // basic chart properties
  minX = 0;
  maxX = 0;
  minY = 0;
  maxY = 0;
  plotId = ''; // update with id in chart specific js
  chartType = ''; // set as 'box' or whatever later in chart specific js file
  navigation = 1; // 0 = row navigation (up/down), 1 = col navigation (left/right)

  // basic audio properties
  MAX_FREQUENCY = 1000;
  MIN_FREQUENCY = 200;
  NULL_FREQUENCY = 100;
  combinedVolMin = 0.25; // volume for min amplitude combined tones
  combinedVolMax = 1.25; // volume for max amplitude combined tones

  // autoplay speed
  MAX_SPEED = 500;
  MIN_SPEED = 50; // 50;
  DEFAULT_SPEED = 250;
  INTERVAL = 20;
  AUTOPLAY_DURATION = 5000; // 5s

  // user settings
  vol = 0.5;
  MAX_VOL = 30;
  // autoPlayRate = this.DEFAULT_SPEED; // ms per tone
  autoPlayRate = this.DEFAULT_SPEED; // ms per tone
  colorSelected = '#03C809';
  brailleDisplayLength = 32; // num characters in user's braille display.  40 is common length for desktop / mobile applications

  // advanced user settings
  showRect = 1; // true / false
  hasRect = 1; // true / false
  hasSmooth = 1; // true / false (for smooth line points)
  duration = 0.3;
  outlierDuration = 0.06;
  autoPlayOutlierRate = 50; // ms per tone
  autoPlayPointsRate = 50; // time between tones in a run
  colorUnselected = '#595959'; // deprecated, todo: find all instances replace with storing old color method
  isTracking = 1; // 0 / 1, is tracking on or off
  visualBraille = false; // do we want to represent braille based on what's visually there or actually there. Like if we have 2 outliers with the same position, do we show 1 (visualBraille true) or 2 (false)
  globalMinMax = true;
  ariaMode = 'assertive'; // assertive (default) / polite

  // LLM settings
  openAIAuthKey = null; // OpenAI authentication key, set in menu
  geminiAuthKey = null; // Gemini authentication key, set in menu
  LLMmaxResponseTokens = 1000; // max tokens to send to LLM, 20 for testing, 1000 ish for real
  playLLMWaitingSound = true;
  LLMDetail = 'high'; // low (default for testing, like 100 tokens) / high (default for real, like 1000 tokens)
  LLMModel = 'openai'; // openai (default) / gemini
  LLMSystemMessage =
    'You are a helpful assistant describing the chart to a blind person. ';
  skillLevel = 'basic'; // basic / intermediate / expert
  skillLevelOther = ''; // custom skill level

  // user controls (not exposed to menu, with shortcuts usually)
  showDisplay = 1; // true / false
  showDisplayInBraille = 1; // true / false
  showDisplayInAutoplay = 0; // true / false
  outlierInterval = null;

  // platform controls
  isMac = navigator.userAgent.toLowerCase().includes('mac'); // true if macOS
  control = this.isMac ? 'Cmd' : 'Ctrl';
  alt = this.isMac ? 'option' : 'Alt';
  home = this.isMac ? 'fn + Left arrow' : 'Home';
  end = this.isMac ? 'fn + Right arrow' : 'End';

  // internal controls
  keypressInterval = 2000; // ms or 2s
  tabMovement = null;

  // debug stuff
  debugLevel = 3; // 0 = no console output, 1 = some console, 2 = more console, etc
  canPlayEndChime = false; //
  manualData = true; // pull from manual data like chart2music (true), or do the old method where we pull from the chart (false)

  KillAutoplay() {
    if (this.autoplayId) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

  KillSepPlay() {
    if (this.sepPlayId) {
      clearInterval(this.sepPlayId);
      this.sepPlayId = null;
    }
  }

  SpeedUp() {
    if (constants.autoPlayRate - this.INTERVAL > this.MIN_SPEED) {
      constants.autoPlayRate -= this.INTERVAL;
    }
  }

  SpeedDown() {
    if (constants.autoPlayRate + this.INTERVAL <= this.MAX_SPEED) {
      constants.autoPlayRate += this.INTERVAL;
    }
  }

  SpeedReset() {
    constants.autoPlayRate = constants.DEFAULT_SPEED;
  }

  /**
   * Function to convert hexadecimal color to string formatted rgb() functional notation.
   * @param hexColorString - hexadecimal color (e.g., "#595959").
   * @returns {string} - rgb() functional notation string (e.g., "rgb(100,100,100)").
   * @constructor
   */
  ConvertHexToRGBString(hexColorString) {
    return (
      'rgb(' +
      parseInt(hexColorString.slice(1, 3), 16) +
      ',' +
      parseInt(hexColorString.slice(3, 5), 16) +
      ',' +
      parseInt(hexColorString.slice(5, 7), 16) +
      ')'
    );
  }

  /**
   * Function to convert an rgb() functional notation string to hexadecimal color.
   * @param rgbColorString - color in rgb() functional notation (e.g., "rgb(100,100,100)").
   * @returns {string} - hexadecimal color (e.g., "#595959").
   * @constructor
   */
  ConvertRGBStringToHex(rgbColorString) {
    let rgb = rgbColorString.replace(/[^\d,]/g, '').split(',');
    return (
      '#' +
      rgb[0].toString(16).padStart(2, '0') +
      rgb[1].toString(16).padStart(2, '0') +
      rgb[2].toString(16).padStart(2, '0')
    );
  }

  ColorInvert(color) {
    // invert an rgb color
    let rgb = color.replace(/[^\d,]/g, '').split(',');
    let r = 255 - rgb[0];
    let g = 255 - rgb[1];
    let b = 255 - rgb[2];
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  GetBetterColor(oldColor) {
    // get a highly contrasting color against the current
    // method: choose an inverted color, but if it's just a shade of gray, default to this.colorSelected
    // Convert hex color to RGB color string if needed
    if (oldColor.indexOf('#') !== -1) {
      oldColor = this.ConvertHexToRGBString(oldColor);
    }
    let newColor = this.ColorInvert(oldColor);
    let rgb = newColor.replace(/[^\d,]/g, '').split(',');
    if (
      rgb[1] < rgb[0] + 10 &&
      rgb[1] > rgb[0] - 10 &&
      rgb[2] < rgb[0] + 10 &&
      rgb[2] > rgb[0] - 10 &&
      (rgb[0] > 86 || rgb[0] < 169)
    ) {
      // too gray and too close to center gray, use default
      newColor = this.colorSelected;
    }

    return newColor;
  }

  /**
   * Function to parse a string containing CSS styles and return an array of strings containing CSS style attributes and values.
   * @param styleString - a string containing CSS styles in inline format.
   * @returns {string[]} - an array of strings containing CSS style attributes and values.
   * @constructor
   */
  GetStyleArrayFromString(styleString) {
    // Get an array of CSS style attributes and values from a style string
    return styleString.replaceAll(' ', '').split(/[:;]/);
  }

  /**
   * Function to parse an array of strings containing CSS style attributes and values and return a string containing CSS styles.
   * @param styleArray - an array of strings containing CSS style attributes and values.
   * @returns {string} - a string containing the CSS styles.
   * @constructor
   */
  GetStyleStringFromArray(styleArray) {
    // Get CSS style string from an array of style attributes and values
    let styleString = '';
    for (let i = 0; i < styleArray.length; i++) {
      if (i % 2 === 0) {
        if (i !== styleArray.length - 1) {
          styleString += styleArray[i] + ': ';
        } else {
          styleString += styleArray[i];
        }
      } else {
        styleString += styleArray[i] + '; ';
      }
    }
    return styleString;
  }
}

/**
 * Resources class contains properties and methods related to language, knowledge level, and strings.
 */
class Resources {
  constructor() {}

  language = 'en'; // 2 char lang code
  knowledgeLevel = 'basic'; // basic, intermediate, expert

  // these strings run on getters, which pull in language, knowledgeLevel, chart, and actual requested string
  strings = {
    en: {
      basic: {
        upper_outlier: 'Upper Outlier',
        lower_outlier: 'Lower Outlier',
        min: 'Minimum',
        max: 'Maximum',
        25: '25%',
        50: '50%',
        75: '75%',
        q1: '25%',
        q2: '50%',
        q3: '75%',
        son_on: 'Sonification on',
        son_off: 'Sonification off',
        son_des: 'Sonification descrete',
        son_comp: 'Sonification compare',
        son_ch: 'Sonification chord',
        son_sep: 'Sonification separate',
        son_same: 'Sonification combined',
        empty: 'Empty',
        openai: 'OpenAI Vision',
        gemini: 'Gemini Pro Vision',
        multi: 'Multiple AI',
      },
    },
  };

  /**
   * Returns a string based on the provided ID, language, and knowledge level.
   * @param {string} id - The ID of the string to retrieve.
   * @returns {string} The string corresponding to the provided ID, language, and knowledge level.
   */
  GetString(id) {
    return this.strings[this.language][this.knowledgeLevel][id];
  }
}

/**
 * Represents a menu object with various settings and keyboard shortcuts.
 */
class Menu {
  whereWasMyFocus = null;

  constructor() {
    this.CreateMenu();
    this.LoadDataFromLocalStorage();
  }

  menuHtml = `
    <div id="menu" class="modal hidden" role="dialog" tabindex="-1">
      <div class="modal-dialog" role="document" tabindex="0">
      <div class="modal-content">
        <div class="modal-header" style="text-align: center;">
        <h4 class="modal-title" style="align:center">Menu</h2>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        <h5 class="modal-title">Keyboard Shortcuts</h5>
        <div class="modal-body">
        <div class="modal-body">
          <table>
          <tr>
            <td><strong>Move around plot:</strong></td>
            <td>Arrow keys</td>
          </tr>
          <tr>
            <td><strong>Go to the very left right up down:</strong></td>
            <td>${constants.control} + Arrow key</td>
          </tr>
          <tr>
            <td><strong>Select the first element:</strong></td>
            <td>${constants.control} + ${constants.home}</td>
          </tr>
          <tr>
            <td><strong>Select the last element:</strong></td>
            <td>${constants.control} + ${constants.end}</td>
          </tr>
          <tr>
            <td><strong>Toggle Braille Mode:</strong></td>
            <td>b</td>
          </tr>
          <tr>
            <td><strong>Toggle Sonification Mode:</strong></td>
            <td>s</td>
          </tr>
          <tr>
            <td><strong>Toggle Text Mode:</strong></td>
            <td>t</td>
          </tr>
          <tr>
            <td><strong>Repeat current sound:</strong></td>
            <td>Space</td>
          </tr>
          <tr>
            <td><strong>Auto-play outward in direction of arrow:</strong></td>
            <td>${constants.control} + Shift + Arrow key</td>
          </tr>
          <tr>
            <td><strong>Auto-play inward in direction of arrow:</strong></td>
            <td>${constants.alt} + Shift + Arrow key</td>
          </tr>
          <tr>
            <td><strong>Stop Auto
        <td>${constants.control}</td>
        </tr>
        <tr>
        <td><strong>Auto-play speed up:</strong></td>
        <td>Period</td>
        </tr>
        <tr>
        <td><strong>Auto-play speed down:</strong></td>
        <td>Comma</td>
        </tr>
        </table>
        </div>
        </div>

        <div class="setting" style="align-items: center;">
          <h5 class="modal-title">Settings</h5>
          <div style="display: flex; align-items: center;">
          <label for="vol" style="margin-right: 100px;">Volume</label>
          <input type="range" id="vol" name="vol" min="0" max="1" step=".05" style="margin-right: 160px; margin-left: auto;">
          </div>
          <div style="display: flex; align-items: center; margin-top: 30px">
          <label for="braille_display_length" style="margin-right: 10px;">Braille Display Size</label>
          <input type="number" min="4" max="2000" step="1" id="braille_display_length" name="braille_display_length" style="margin-right: 25%; margin-left: auto;">
          </div>
          <div style="display: flex; align-items: center; margin-top: 30px">
          <label for="autoplay_rate" style="margin-right: 10px;">Autoplay Rate</label>
          <input type="number" min="${constants.MIN_SPEED}" max="500" step="${
    constants.INTERVAL
  }" id="autoplay_rate" name="autoplay_rate" style="margin-right: 26%; margin-left: auto;">
          </div>
          <div style="display: flex; align-items: center; margin-top: 30px">
          <label for="color_selected" style="margin-right: 10px;">Outline Color</label>
          <input type="color" id="color_selected" name="color_selected" style="margin-right: 28%; margin-left: auto;"">
          </div>
          <div style="display: flex; align-items: center; margin-top: 30px">
          <label for="min_freq" style="margin-right: 10px;">Min Frequency (Hz)</label>
          <input type="number" min="10" max="2000" step="10" id="min_freq" name="min_freq"  style="margin-right: 25%; margin-left: auto;">
          </div>
          <div style="display: flex; align-items: center; margin-top: 30px">
          <label for="max_freq" style="margin-right: 10px;">Max Frequency (Hz)</label>
          <input type="number" min="20" max="2010" step="10" id="max_freq" name="max_freq"  style="margin-right: 25%; margin-left: auto;">
          </div>
          <div style="display: flex; align-items: center; margin-top: 30px">
          <label for="keypress_interval" style="margin-right: 10px;">Keypress Interval (ms)</label>
          <input type="number" min="500" max="5000" step="500" id="keypress_interval" name="keypress_interval" style="margin-right: 25%; margin-left: auto;">
          </div>
          <div style="margin-top: 30px; margin-right: 160px; margin-left:10px">
          <fieldset>
            <legend>Aria Mode</legend>
            <p>
            <input type="radio" id="aria_mode_assertive" name="aria_mode" value="assertive" ${
              constants.ariaMode == 'assertive' ? 'checked' : ''
            }>
            <label for="aria_mode_assertive">Assertive</label>
            </p>
            <p>
            <input type="radio" id="aria_mode_polite" name="aria_mode" value="polite" ${
              constants.ariaMode == 'polite' ? 'checked' : ''
            }>
            <label for="aria_mode_polite">Polite</label>
            </p>
          </fieldset>
          </div>
        </div>


        <div class="setting" style="align-items: center;">
          <h5 class="modal-title"> LLM Settings</h5>
          <div style="display: flex; align-items: center;">
            <label for="LLM_model">LLM Model</label>
            <select id="LLM_model" style="margin-right: 21%; margin-left: auto;">
              <option value="openai">OpenAI Vision</option>
              <option value="gemini">Gemini Pro Vision</option>
              <option value="multi">Multiple</option>
            </select>
          </div>
          <div id="openai_auth_key_container" class="multi_container hidden" style="margin-top: 30px" >
            <label for="openai_auth_key">OpenAI Authentication Key</label>
            <span id="openai_multi_container" class="hidden">
              <input type="checkbox" id="openai_multi" name="openai_multi" aria-label="Use OpenAI in Multi modal mode">
            </span>
            <input type="password" id="openai_auth_key" style="margin-left: 29.5%; margin-right: auto;">
            <button aria-label="Delete OpenAI key" title="Delete OpenAI key" id="delete_openai_key" class="invis_button">&times;</button>
          </div>
          <div id="gemini_auth_key_container" class="multi_container hidden" style="margin-top: 30px" >
            <label for="gemini_auth_key">Gemini Authentication Key</label>
            <span id="gemini_multi_container" class="hidden">
              <input type="checkbox" id="gemini_multi" name="gemini_multi" aria-label="Use Gemini in Multi modal mode">
            </span>
            <input type="password" id="gemini_auth_key" style="margin-left: 29.5%; margin-right: auto;">
            <button aria-label="Delete Gemini key" title="Delete Gemini key" id="delete_gemini_key" class="invis_button">&times;</button>
          </div>
          <div style="margin-top: 30px" >
            <label for="skill_level">Level of skill in statistical charts</label>
            <select id="skill_level" style="margin-left: 26%; margin-right: auto;">
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
              <option value="other">other</option>
            </select>
          </div>
          <div id="skill_level_other_container" class="hidden" style="margin-top: 30px" >
            <label for="skill_level_other">Describe your level of skill in statistical charts</label>
            <input type="text" placeholder="Very basic" id="skill_level_other" style="margin-right: 25%; margin-left: auto;">
          </div>
          <div style="margin-top: 30px" >
            <label for="LLM_preferences" styles="margin-right: 50px">LLM Preferences</label>
            <textarea id="LLM_preferences" rows="4" cols="50" placeholder="I'm a stats undergrad and work with Python. I prefer a casual tone, and favor information accuracy over creative description; just the facts please!"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" id="save_and_close_menu">Save and Close</button>
            <button type="button" id="close_menu">Close</button>
          </div>

        </div>
        </div>
        
      </div>
      </div>
    </div>
    <div id="menu_modal_backdrop" class="modal-backdrop hidden"></div>
    `;

  /**
   * Creates a menu element and sets up event listeners for opening and closing the menu,
   * and saving and loading data from local storage.
   */
  CreateMenu() {
    // menu element creation
    document
      .querySelector('body')
      .insertAdjacentHTML('beforeend', this.menuHtml);

    // menu close events
    let allClose = document.querySelectorAll('#close_menu, #menu .close');
    for (let i = 0; i < allClose.length; i++) {
      constants.events.push([
        allClose[i],
        'click',
        function (e) {
          menu.Toggle(false);
        },
      ]);
    }
    constants.events.push([
      document.getElementById('save_and_close_menu'),
      'click',
      function (e) {
        menu.SaveData();
        menu.Toggle(false);
      },
    ]);
    constants.events.push([
      document.getElementById('menu'),
      'keyup',
      function (e) {
        if (e.key == 'Esc') {
          // esc
          menu.Toggle(false);
        }
      },
    ]);

    // Menu open events
    constants.events.push([
      document,
      'keyup',
      function (e) {
        // don't fire on input elements
        if (
          e.target.tagName.toLowerCase() == 'input' ||
          e.target.tagName.toLowerCase() == 'textarea'
        ) {
          return;
        } else if (e.key == 'h') {
          menu.Toggle(true);
        }
      },
    ]);

    // toggle auth key fields
    constants.events.push([
      document.getElementById('LLM_model'),
      'change',
      function (e) {
        if (e.target.value == 'openai') {
          document
            .getElementById('openai_auth_key_container')
            .classList.remove('hidden');
          document
            .getElementById('gemini_auth_key_container')
            .classList.add('hidden');
          document
            .getElementById('openai_multi_container')
            .classList.add('hidden');
          document
            .getElementById('gemini_multi_container')
            .classList.add('hidden');
          document.getElementById('openai_multi').checked = true;
          document.getElementById('gemini_multi').checked = false;
        } else if (e.target.value == 'gemini') {
          document
            .getElementById('openai_auth_key_container')
            .classList.add('hidden');
          document
            .getElementById('gemini_auth_key_container')
            .classList.remove('hidden');
          document
            .getElementById('openai_multi_container')
            .classList.add('hidden');
          document
            .getElementById('gemini_multi_container')
            .classList.add('hidden');
          document.getElementById('openai_multi').checked = false;
          document.getElementById('gemini_multi').checked = true;
        } else if (e.target.value == 'multi') {
          document
            .getElementById('openai_auth_key_container')
            .classList.remove('hidden');
          document
            .getElementById('gemini_auth_key_container')
            .classList.remove('hidden');
          document
            .getElementById('openai_multi_container')
            .classList.remove('hidden');
          document
            .getElementById('gemini_multi_container')
            .classList.remove('hidden');
          document.getElementById('openai_multi').checked = true;
          document.getElementById('gemini_multi').checked = true;
        }
      },
    ]);

    // Skill level other events
    constants.events.push([
      document.getElementById('skill_level'),
      'change',
      function (e) {
        if (e.target.value == 'other') {
          document
            .getElementById('skill_level_other_container')
            .classList.remove('hidden');
        } else {
          document
            .getElementById('skill_level_other_container')
            .classList.add('hidden');
        }
      },
    ]);
  }

  /**
   * Destroys the menu element and its backdrop.
   * @function
   * @name Destroy
   * @memberof module:constants
   * @returns {void}
   */
  Destroy() {
    // menu element destruction
    let menu = document.getElementById('menu');
    if (menu) {
      menu.remove();
    }
    let backdrop = document.getElementById('menu_modal_backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  /**
   * Toggles the menu on and off.
   * @param {boolean} [onoff=false] - Whether to turn the menu on or off. Defaults to false (close).
   */
  Toggle(onoff = false) {
    if (typeof onoff == 'undefined') {
      if (document.getElementById('menu').classList.contains('hidden')) {
        onoff = true;
      } else {
        onoff = false;
      }
    }
    // don't open if we have another modal open already
    if (onoff && document.getElementById('chatLLM')) {
      if (!document.getElementById('chatLLM').classList.contains('hidden')) {
        return;
      }
    }
    if (onoff) {
      // open
      this.whereWasMyFocus = document.activeElement;
      this.PopulateData();
      constants.tabMovement = 0;
      document.getElementById('menu').classList.remove('hidden');
      document.getElementById('menu_modal_backdrop').classList.remove('hidden');
      document.querySelector('#menu .close').focus();
    } else {
      // close
      document.getElementById('menu').classList.add('hidden');
      document.getElementById('menu_modal_backdrop').classList.add('hidden');
      this.whereWasMyFocus.focus();
      this.whereWasMyFocus = null;
    }
  }

  /**
   * Populates the form fields in the help menu with the values from the constants object.
   */
  PopulateData() {
    document.getElementById('vol').value = constants.vol;
    document.getElementById('autoplay_rate').value = constants.autoPlayRate;
    document.getElementById('braille_display_length').value =
      constants.brailleDisplayLength;
    document.getElementById('color_selected').value = constants.colorSelected;
    document.getElementById('min_freq').value = constants.MIN_FREQUENCY;
    document.getElementById('max_freq').value = constants.MAX_FREQUENCY;
    document.getElementById('keypress_interval').value =
      constants.keypressInterval;
    if (typeof constants.openAIAuthKey == 'string') {
      document.getElementById('openai_auth_key').value =
        constants.openAIAuthKey;
    }
    if (typeof constants.geminiAuthKey == 'string') {
      document.getElementById('gemini_auth_key').value =
        constants.geminiAuthKey;
    }
    document.getElementById('skill_level').value = constants.skillLevel;
    if (constants.skillLevelOther) {
      document.getElementById('skill_level_other').value =
        constants.skillLevelOther;
    }
    document.getElementById('LLM_model').value = constants.LLMModel;

    // aria mode
    if (constants.ariaMode == 'assertive') {
      document.getElementById('aria_mode_assertive').checked = true;
      document.getElementById('aria_mode_polite').checked = false;
    } else {
      document.getElementById('aria_mode_polite').checked = true;
      document.getElementById('aria_mode_assertive').checked = false;
    }
    // hide either openai or gemini auth key field
    if (constants.LLMModel == 'openai') {
      document
        .getElementById('openai_auth_key_container')
        .classList.remove('hidden');
      document
        .getElementById('gemini_auth_key_container')
        .classList.add('hidden');
    } else if (constants.LLMModel == 'gemini') {
      document
        .getElementById('openai_auth_key_container')
        .classList.add('hidden');
      document
        .getElementById('gemini_auth_key_container')
        .classList.remove('hidden');
    } else if (constants.LLMModel == 'multi') {
      // multi LLM mode
      document
        .getElementById('openai_auth_key_container')
        .classList.remove('hidden');
      document
        .getElementById('gemini_auth_key_container')
        .classList.remove('hidden');
      document
        .getElementById('openai_multi_container')
        .classList.remove('hidden');
      document
        .getElementById('gemini_multi_container')
        .classList.remove('hidden');
      document.getElementById('openai_multi').checked = false;
      if (constants.LLMOpenAiMulti) {
        document.getElementById('openai_multi').checked = true;
      }
      document.getElementById('gemini_multi').checked = false;
      if (constants.LLMGeminiMulti) {
        document.getElementById('gemini_multi').checked = true;
      }
    }
    // skill level other
    if (constants.skillLevel == 'other') {
      document
        .getElementById('skill_level_other_container')
        .classList.remove('hidden');
    }
    // LLM preferences
    if (constants.LLMPreferences) {
      document.getElementById('LLM_preferences').value =
        constants.LLMPreferences;
    }
  }

  /**
   * Saves the data from the HTML elements into the constants object.
   */
  SaveData() {
    this.HandleLLMChanges();

    constants.vol = document.getElementById('vol').value;
    constants.autoPlayRate = document.getElementById('autoplay_rate').value;
    constants.brailleDisplayLength = document.getElementById(
      'braille_display_length'
    ).value;
    constants.colorSelected = document.getElementById('color_selected').value;
    constants.MIN_FREQUENCY = document.getElementById('min_freq').value;
    constants.MAX_FREQUENCY = document.getElementById('max_freq').value;
    constants.keypressInterval =
      document.getElementById('keypress_interval').value;

    constants.openAIAuthKey = document.getElementById('openai_auth_key').value;
    constants.geminiAuthKey = document.getElementById('gemini_auth_key').value;
    constants.skillLevel = document.getElementById('skill_level').value;
    constants.skillLevelOther =
      document.getElementById('skill_level_other').value;
    constants.LLMModel = document.getElementById('LLM_model').value;
    constants.LLMPreferences = document.getElementById('LLM_preferences').value;

    constants.LLMOpenAiMulti = document.getElementById('openai_multi').checked;
    constants.LLMGeminiMulti = document.getElementById('gemini_multi').checked;

    // aria
    if (document.getElementById('aria_mode_assertive').checked) {
      constants.ariaMode = 'assertive';
    } else if (document.getElementById('aria_mode_polite').checked) {
      constants.ariaMode = 'polite';
    }

    this.SaveDataToLocalStorage();
    this.UpdateHtml();
  }

  /**
   * Updates various html elements and attributes.
   * Typically used to do things like update the aria-live attributes
   *
   * @function
   * @memberof constants
   * @returns {void}
   */
  UpdateHtml() {
    // set aria attributes
    constants.infoDiv.setAttribute('aria-live', constants.ariaMode);
    document
      .getElementById(constants.announcement_container_id)
      .setAttribute('aria-live', constants.ariaMode);
  }

  /**
   * Handles changes to the LLM model and multi-modal settings.
   * We reset if we change the LLM model, multi settings, or skill level.
   */
  HandleLLMChanges() {
    let shouldReset = false;
    if (
      !shouldReset &&
      constants.skillLevel != document.getElementById('skill_level').value
    ) {
      shouldReset = true;
    }
    if (
      !shouldReset &&
      constants.LLMModel != document.getElementById('LLM_model').value
    ) {
      shouldReset = true;
    }
    if (
      !shouldReset &&
      (constants.LLMOpenAiMulti !=
        document.getElementById('openai_multi').checked ||
        constants.LLMGeminiMulti !=
          document.getElementById('gemini_multi').checked)
    ) {
      shouldReset = true;
    }

    if (shouldReset) {
      if (chatLLM) {
        chatLLM.ResetChatHistory();
      }
    }
  }

  /**
   * Saves all data in Menu to local storage.
   * @function
   * @memberof constants
   * @returns {void}
   */
  SaveDataToLocalStorage() {
    let data = {};
    data.vol = constants.vol;
    data.autoPlayRate = constants.autoPlayRate;
    data.brailleDisplayLength = constants.brailleDisplayLength;
    data.colorSelected = constants.colorSelected;
    data.MIN_FREQUENCY = constants.MIN_FREQUENCY;
    data.MAX_FREQUENCY = constants.MAX_FREQUENCY;
    data.keypressInterval = constants.keypressInterval;
    data.ariaMode = constants.ariaMode;
    data.openAIAuthKey = constants.openAIAuthKey;
    data.geminiAuthKey = constants.geminiAuthKey;
    data.skillLevel = constants.skillLevel;
    data.skillLevelOther = constants.skillLevelOther;
    data.LLMModel = constants.LLMModel;
    data.LLMPreferences = constants.LLMPreferences;
    data.LLMOpenAiMulti = constants.LLMOpenAiMulti;
    data.LLMGeminiMulti = constants.LLMGeminiMulti;
    localStorage.setItem('settings_data', JSON.stringify(data));
  }
  /**
   * Loads data from local storage and updates the constants object with the retrieved values, to be loaded into the menu
   */
  LoadDataFromLocalStorage() {
    let data = JSON.parse(localStorage.getItem('settings_data'));
    if (data) {
      constants.vol = data.vol;
      constants.autoPlayRate = data.autoPlayRate;
      constants.brailleDisplayLength = data.brailleDisplayLength;
      constants.colorSelected = data.colorSelected;
      constants.MIN_FREQUENCY = data.MIN_FREQUENCY;
      constants.MAX_FREQUENCY = data.MAX_FREQUENCY;
      constants.keypressInterval = data.keypressInterval;
      constants.ariaMode = data.ariaMode;
      constants.openAIAuthKey = data.openAIAuthKey;
      constants.geminiAuthKey = data.geminiAuthKey;
      constants.skillLevel = data.skillLevel;
      constants.skillLevelOther = data.skillLevelOther;
      constants.LLMModel = data.LLMModel ? data.LLMModel : constants.LLMModel;
      constants.LLMPreferences = data.LLMPreferences;
      constants.LLMOpenAiMulti = data.LLMOpenAiMulti;
      constants.LLMGeminiMulti = data.LLMGeminiMulti;
    }
    this.PopulateData();
    this.UpdateHtml();
  }
}

/**
 * Creates an html modal with a basic text input,
 * and hooks to send info to an LLM
 * @class
 */
class ChatLLM {
  constructor() {
    this.firstTime = true;
    this.firstMulti = true;
    this.CreateComponent();
    this.SetEvents();
  }

  /**
   * Creates a modal component containing basic text input
   * Sets events to toggle on and off chat window
   */
  CreateComponent() {
    let html = `
        <div id="chatLLM" class="modal hidden" role="dialog" tabindex="-1">
            <div class="modal-dialog" role="document" tabindex="0">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="chatLLM_title" class="modal-title">Ask a Question</h2>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="chatLLM_chat_history" aria-live="${constants.ariaMode}" aria-relevant="additions">
                        </div>
                        <div id="chatLLM_content">
                          <p><input type="text" id="chatLLM_input" class="form-control" name="chatLLM_input" aria-labelledby="chatLLM_title" size="50"></p>
                          <div class="LLM_suggestions">
                            <p><button type="button">What is the title?</button></p>
                            <p><button type="button">What are the high and low values?</button></p>
                            <p><button type="button">What is the general shape of the chart?</button></p>
                            <p><button type="button" id="more_suggestions">More</button></p>
                          </div>
                          <div id="more_suggestions_container" class="hidden LLM_suggestions">
                            <p><button type="button">Please provide the title of this visualization, then provide a description for someone who is blind or low vision. Include general overview of axes and the data at a high-level.</button></p>
                            <p><button type="button">For the visualization I shared, please provide the following (where applicable): mean, standard deviation, extrema, correlations, relational comparisons like greater than OR lesser than.</button></p>
                            <p><button type="button">Based on the visualization shared, address the following: Do you observe any unforeseen trends? If yes, what?  Please convey any complex multi-faceted patterns present. Can you identify any noteworthy exceptions that aren't readily apparent through non-visual methods of analysis?</button></p>
                            <p><button type="button">Provide context to help explain the data depicted in this visualization based on domain-specific insight.</button></p>
                          </div>
                          <p><button type="button" id="chatLLM_submit">Submit</button></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" id="reset_chatLLM">Reset</button>
                      <button type="button" id="close_chatLLM">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="chatLLM_modal_backdrop" class="modal-backdrop hidden"></div>
    `;
    document.querySelector('body').insertAdjacentHTML('beforeend', html);
  }

  /**
   * Sets events for the chatLLM modal
   */
  SetEvents() {
    // chatLLM close events
    let allClose = document.querySelectorAll('#close_chatLLM, #chatLLM .close');
    for (let i = 0; i < allClose.length; i++) {
      constants.events.push([
        allClose[i],
        'click',
        function (e) {
          chatLLM.Toggle(false);
        },
      ]);
    }
    constants.events.push([
      document.getElementById('chatLLM'),
      'keyup',
      function (e) {
        if (e.key == 'Esc') {
          // esc
          chatLLM.Toggle(false);
        }
      },
    ]);

    // ChatLLM open/close toggle
    constants.events.push([
      document,
      'keyup',
      function (e) {
        if (e.key == '?' && (e.ctrlKey || e.metaKey)) {
          chatLLM.Toggle();
        }
      },
    ]);

    // ChatLLM request events
    constants.events.push([
      document.getElementById('chatLLM_submit'),
      'click',
      function (e) {
        let text = document.getElementById('chatLLM_input').value;
        chatLLM.DisplayChatMessage('User', text);
        chatLLM.Submit(text);
      },
    ]);
    constants.events.push([
      document.getElementById('chatLLM_input'),
      'keyup',
      function (e) {
        if (e.key == 'Enter' && !e.shiftKey) {
          let text = document.getElementById('chatLLM_input').value;
          chatLLM.DisplayChatMessage('User', text);
          chatLLM.Submit(text);
        }
      },
    ]);

    // ChatLLM suggestion events
    // the more button
    constants.events.push([
      document.getElementById('more_suggestions'),
      'click',
      function (e) {
        document
          .getElementById('more_suggestions_container')
          .classList.toggle('hidden');
        // focus on button right after the more button
        document
          .querySelector('#more_suggestions_container > p > button')
          .focus();
        document.getElementById('more_suggestions').remove();
      },
    ]);
    // actual suggestions:
    let suggestions = document.querySelectorAll(
      '#chatLLM .LLM_suggestions button:not(#more_suggestions)'
    );
    for (let i = 0; i < suggestions.length; i++) {
      constants.events.push([
        suggestions[i],
        'click',
        function (e) {
          let text = e.target.innerHTML;
          chatLLM.DisplayChatMessage('User', text);
          chatLLM.Submit(text);
        },
      ]);
    }

    // Delete OpenAI and Gemini keys
    constants.events.push([
      document.getElementById('delete_openai_key'),
      'click',
      function (e) {
        document.getElementById('openai_auth_key').value = '';
      },
    ]);
    constants.events.push([
      document.getElementById('delete_gemini_key'),
      'click',
      function (e) {
        document.getElementById('gemini_auth_key').value = '';
      },
    ]);

    // Reset chatLLM
    constants.events.push([
      document.getElementById('reset_chatLLM'),
      'click',
      function (e) {
        chatLLM.Toggle(false);
        chatLLM.ResetChatHistory();
      },
    ]);
  }

  /**
   * Submits text to the LLM with a REST call, returns the response to the user.
   * Depends on the one or more LLMs being selected in the menu.
   * @function
   * @name Submit
   * @memberof module:constants
   * @text {string} - The text to send to the LLM.
   * @img {string} - The image to send to the LLM in base64 string format. Defaults to null (no image).
   * @returns {void}
   */
  async Submit(text, firsttime = false) {
    // start waiting sound
    if (constants.playLLMWaitingSound) {
      chatLLM.WaitingSound(true);
    }

    let img = null;
    this.firstMulti = true;

    if (constants.LLMOpenAiMulti || constants.LLMModel == 'openai') {
      if (firsttime) {
        img = await this.ConvertSVGtoJPG(singleMaidr.id, 'openai');
      }
      chatLLM.OpenAIPrompt(text, img);
    }
    if (constants.LLMGeminiMulti || constants.LLMModel == 'gemini') {
      if (firsttime) {
        img = await this.ConvertSVGtoJPG(singleMaidr.id, 'gemini');
      }
      chatLLM.GeminiPrompt(text, img);
    }
  }

  /*
   * Sets a waiting sound to play while waiting for the LLM to respond.
   * @function
   * @name SetWaitingSound
   * @memberof module:constants
   * @onoff {boolean} - Whether to turn the waiting sound on or off. Defaults to true (on).
   * @returns {void}
   */
  WaitingSound(onoff = true) {
    // clear old intervals and timeouts
    if (constants.waitingInterval) {
      // destroy old waiting sound
      clearInterval(constants.waitingInterval);
      constants.waitingSound = null;
    }
    if (constants.waitingSoundOverride) {
      clearTimeout(constants.waitingSoundOverride);
      constants.waitingSoundOverride = null;
    }

    // assuming we're turning it on, start playing a new waiting sound
    if (onoff) {
      // create new waiting sound
      let delay = 1000;
      let freq = 440; // a440 babee
      constants.waitingInterval = setInterval(function () {
        if (audio) {
          audio.playOscillator(freq, 0.2, 0);
        }
      }, delay);

      // clear automatically after 30 sec, assuming no response
      constants.waitingSoundOverride = setTimeout(function () {
        chatLLM.WaitingSound(false);
      }, 30000);
    }
  }

  /**
   * Processes the response from the LLM and displays it to the user.
   * @function
   * @returns {void}
   */
  ProcessLLMResponse(data, model) {
    chatLLM.WaitingSound(false);
    console.log('LLM response: ', data);
    let text = '';
    let LLMName = resources.GetString(model);

    if (model == 'openai') {
      text = data.choices[0].message.content;
      let i = this.requestJson.messages.length;
      this.requestJson.messages[i] = {};
      this.requestJson.messages[i].role = 'assistant';
      this.requestJson.messages[i].content = text;

      if (data.error) {
        chatLLM.DisplayChatMessage(LLMName, 'Error processing request.', true);
      } else {
        chatLLM.DisplayChatMessage(LLMName, text);
      }
    } else if (model == 'gemini') {
      if (data.text()) {
        text = data.text();
        chatLLM.DisplayChatMessage(LLMName, text);
      } else {
        if (!data.error) {
          data.error = 'Error processing request.';
        }
      }
      if (data.error) {
        chatLLM.DisplayChatMessage(LLMName, 'Error processing request.', true);
      } else {
        // todo: display actual response
      }
    }
  }

  /**
   * Fakes an LLM response for testing purposes. Returns a JSON object formatted like the LLM response.
   * @function
   * @returns {json}
   */
  fakeLLMResponseData() {
    let responseText = {};
    if (this.requestJson.messages.length > 2) {
      // subsequent responses
      responseText = {
        id: 'chatcmpl-8Y44iRCRrohYbAqm8rfBbJqTUADC7',
        object: 'chat.completion',
        created: 1703129508,
        model: 'gpt-4-1106-vision-preview',
        usage: {
          prompt_tokens: 451,
          completion_tokens: 16,
          total_tokens: 467,
        },
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'A fake response from the LLM. Nice.',
            },
            finish_reason: 'length',
            index: 0,
          },
        ],
      };
    } else {
      // first response
      responseText = {
        id: 'chatcmpl-8Y44iRCRrohYbAqm8rfBbJqTUADC7',
        object: 'chat.completion',
        created: 1703129508,
        model: 'gpt-4-1106-vision-preview',
        usage: {
          prompt_tokens: 451,
          completion_tokens: 16,
          total_tokens: 467,
        },
        choices: [
          {
            message: {
              role: 'assistant',
              content:
                'The chart you\'re referring to is a bar graph titled "The Number of Diamonds',
            },
            finish_reason: 'length',
            index: 0,
          },
        ],
      };
    }

    return responseText;
  }

  /**
   * Gets running prompt info, appends the latest request, and packages it into a JSON object for the LLM.
   * @function
   * @name OpenAIPrompt
   * @memberof module:constants
   * @returns {json}
   */
  OpenAIPrompt(text, img = null) {
    // request init
    let url = 'https://api.openai.com/v1/chat/completions';
    let auth = constants.openAIAuthKey;
    let requestJson = chatLLM.OpenAIJson(text, img);
    console.log('LLM request: ', requestJson);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + auth,
      },
      body: JSON.stringify(requestJson),
    })
      .then((response) => response.json())
      .then((data) => {
        chatLLM.ProcessLLMResponse(data, 'openai');
      })
      .catch((error) => {
        chatLLM.WaitingSound(false);
        console.error('Error:', error);
        chatLLM.DisplayChatMessage(LLMName, 'Error processing request.', true);
        // also todo: handle errors somehow
      });
  }
  OpenAIJson(text, img = null) {
    let sysMessage = constants.LLMSystemMessage;
    let backupMessage =
      'Describe ' + singleMaidr.type + ' charts to a blind person';
    // headers and sys message
    if (!this.requestJson) {
      this.requestJson = {};
      this.requestJson.model = 'gpt-4-vision-preview';
      this.requestJson.max_tokens = constants.LLMmaxResponseTokens; // note: if this is too short (tested with less than 200), the response gets cut off

      // sys message
      this.requestJson.messages = [];
      this.requestJson.messages[0] = {};
      this.requestJson.messages[0].role = 'system';
      this.requestJson.messages[0].content = sysMessage;
      if (constants.LLMPreferences) {
        this.requestJson.messages[1] = {};
        this.requestJson.messages[1].role = 'system';
        this.requestJson.messages[1].content = constants.LLMPreferences;
      }
    }

    // user message
    // if we have an image (first time only), send the image and the text, otherwise just the text
    let i = this.requestJson.messages.length;
    this.requestJson.messages[i] = {};
    this.requestJson.messages[i].role = 'user';
    if (img) {
      // first message, include the img
      this.requestJson.messages[i].content = [
        {
          type: 'text',
          text: text,
        },
        {
          type: 'image_url',
          image_url: { url: img },
        },
      ];
    } else {
      // just the text
      this.requestJson.messages[i].content = text;
    }

    return this.requestJson;
  }

  async GeminiPrompt(text, imgBase64 = null) {
    try {
      // Save the image for next time
      if (imgBase64 == null) {
        imgBase64 = constants.LLMImage;
      } else {
        constants.LLMImage = imgBase64;
      }
      constants.LLMImage = imgBase64;

      // Import the module
      const { GoogleGenerativeAI } = await import(
        'https://esm.run/@google/generative-ai'
      );
      const API_KEY = constants.geminiAuthKey;
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      // Create the prompt
      let prompt = constants.LLMSystemMessage;
      if (constants.LLMPreferences) {
        prompt += constants.LLMPreferences;
      }
      prompt += '\n\n' + text; // Use the text parameter as the prompt
      const image = {
        inlineData: {
          data: imgBase64, // Use the base64 image string
          mimeType: 'image/png', // Or the appropriate mime type of your image
        },
      };

      // Generate the content
      console.log('LLM request: ', prompt, image);
      const result = await model.generateContent([prompt, image]);
      console.log(result.response.text());

      // Process the response
      chatLLM.ProcessLLMResponse(result.response, 'gemini');
    } catch (error) {
      console.error('Error in GeminiPrompt:', error);
      throw error; // Rethrow the error for further handling if necessary
    }
  }

  /**
   * Displays chat message from the user and LLM in a chat history window
   * @function
   * @name DisplayChatMessage
   * @memberof module:constants
   * @returns {void}
   */
  DisplayChatMessage(user = 'User', text = '', isSystem = false) {
    let hLevel = 'h3';
    if (!isSystem && constants.LLMModel == 'multi' && user != 'User') {
      if (this.firstMulti) {
        let multiAIName = resources.GetString('multi');
        let titleHtml = `
          <div class="chatLLM_message chatLLM_message_other">
            <h3 class="chatLLM_message_user">${multiAIName} Responses</h3>
          </div>
        `;
        this.RenderChatMessage(titleHtml);
        this.firstMulti = false;
      }
      hLevel = 'h4';
    }
    let html = `
      <div class="chatLLM_message ${
        user == 'User' ? 'chatLLM_message_self' : 'chatLLM_message_other'
      }">
        <${hLevel} class="chatLLM_message_user">${user}</${hLevel}>
        <p class="chatLLM_message_text">${text}</p>
      </div>
    `;

    this.RenderChatMessage(html);
  }
  RenderChatMessage(html) {
    document
      .getElementById('chatLLM_chat_history')
      .insertAdjacentHTML('beforeend', html);
    document.getElementById('chatLLM_input').value = '';

    // scroll to bottom
    document.getElementById('chatLLM_chat_history').scrollTop =
      document.getElementById('chatLLM_chat_history').scrollHeight;
  }

  /**
   * Resets the chat history window
   */
  ResetChatHistory() {
    // clear the main chat history
    document.getElementById('chatLLM_chat_history').innerHTML = '';
    // unhide the more button
    document
      .getElementById('more_suggestions_container')
      .classList.add('hidden');
    document.getElementById('more_suggestions').classList.remove('hidden');

    // reset the data
    this.requestJson = null;
    this.firstTime = true;
  }

  /**
   * Destroys the chatLLM element and its backdrop.
   * @function
   * @name Destroy
   * @memberof module:constants
   * @returns {void}
   */
  Destroy() {
    // chatLLM element destruction
    let chatLLM = document.getElementById('chatLLM');
    if (chatLLM) {
      chatLLM.remove();
    }
    let backdrop = document.getElementById('chatLLM_modal_backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  /**
   * Toggles the modal on and off.
   * @param {boolean} [onoff=false] - Whether to turn the chatLLM on or off. Defaults to false (close).
   */
  Toggle(onoff) {
    if (typeof onoff == 'undefined') {
      if (document.getElementById('chatLLM').classList.contains('hidden')) {
        onoff = true;
      } else {
        onoff = false;
      }
    }
    if (onoff) {
      // open
      this.whereWasMyFocus = document.activeElement;
      constants.tabMovement = 0;
      document.getElementById('chatLLM').classList.remove('hidden');
      document
        .getElementById('chatLLM_modal_backdrop')
        .classList.remove('hidden');
      document.querySelector('#chatLLM .close').focus();

      // first time, send default query
      if (this.firstTime) {
        // get name from resource
        let LLMName = resources.GetString(constants.LLMModel);
        this.firstTime = false;
        this.DisplayChatMessage(LLMName, 'Processing Chart...', true);
        let defaultPrompt = this.GetDefaultPrompt();
        this.Submit(defaultPrompt, true);
      }
    } else {
      // close
      document.getElementById('chatLLM').classList.add('hidden');
      document.getElementById('chatLLM_modal_backdrop').classList.add('hidden');
      this.whereWasMyFocus.focus();
      this.whereWasMyFocus = null;
    }
  }

  /**
   * Converts the active chart to a jpg image.
   * @id {string} - The html ID of the chart to convert.
   */
  async ConvertSVGtoJPG(id, model) {
    let svgElement = document.getElementById(id);
    return new Promise((resolve, reject) => {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      var svgData = new XMLSerializer().serializeToString(svgElement);
      if (!svgData.startsWith('<svg xmlns')) {
        svgData = `<svg xmlns="http://www.w3.org/2000/svg" ${svgData.slice(4)}`;
      }

      var svgSize =
        svgElement.viewBox.baseVal || svgElement.getBoundingClientRect();
      canvas.width = svgSize.width;
      canvas.height = svgSize.height;

      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, svgSize.width, svgSize.height);
        var jpegData = canvas.toDataURL('image/jpeg', 0.9); // 0.9 is the quality parameter
        if (model == 'openai') {
          resolve(jpegData);
        } else if (model == 'gemini') {
          let base64Data = jpegData.split(',')[1];
          resolve(base64Data);
          //resolve(jpegData);
        }
        URL.revokeObjectURL(url);
      };

      img.onerror = function () {
        reject(new Error('Error loading SVG'));
      };

      var svgBlob = new Blob([svgData], {
        type: 'image/svg+xml;charset=utf-8',
      });
      var url = URL.createObjectURL(svgBlob);
      img.src = url;
    });
  }

  /**
   * GetDefaultPrompt is an asynchronous function that generates a prompt for describing a chart to a blind person.
   * It converts the chart to a JPG image using the ConvertSVGtoJPG method and then submits the prompt to the chatLLM function.
   * The prompt includes information about the blind person's skill level and the chart's image and raw data, if available.
   */
  GetDefaultPrompt() {
    let text = 'Describe this chart to a blind person';
    if (constants.skillLevel) {
      if (constants.skillLevel == 'other' && constants.skillLevelOther) {
        text +=
          ' who has a ' +
          constants.skillLevelOther +
          ' understanding of statistical charts. ';
      } else {
        text +=
          ' who has a ' +
          constants.skillLevel +
          ' understanding of statistical charts. ';
      }
    } else {
      text += ' who has a basic understanding of statistical charts. ';
    }
    text += 'Here is chart in png format';
    if (singleMaidr) {
      text += ' and raw data in json format: \n';
      text += JSON.stringify(singleMaidr);
    }

    return text;
  }
}
/**
 * Creates an html modal containing summary info of the active chart. Title, subtitle, data table, etc.
 * @class
 */
class Description {
  // This class creates an html modal containing summary info of the active chart
  // Trigger popup with 'D' key
  // Info is basically anything available, but stuff like:
  // - chart type
  // - chart labels, like title, subtitle, caption etc
  // - chart data (an accessible html table)

  constructor() {
    //this.CreateComponent(); // disabled as we're in development and have switched priorities
  }

  /**
   * Creates a modal component containing description summary stuff.
   */
  CreateComponent() {
    // modal containing description summary stuff
    let html = `
        <div id="description" class="modal hidden" role="dialog" tabindex="-1">
            <div class="modal-dialog" role="document" tabindex="0">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="desc_title" class="modal-title">Description</h2>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="desc_content">
                        content here
                        </div>
                        <div id="desc_table">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="close_desc">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="desc_modal_backdrop" class="modal-backdrop hidden"></div>

    `;

    document.querySelector('body').insertAdjacentHTML('beforeend', html);

    // close events
    let allClose = document.querySelectorAll(
      '#close_desc, #description .close'
    );
    for (let i = 0; i < allClose.length; i++) {
      constants.events.push([
        allClose[i],
        'click',
        function (e) {
          description.Toggle(false);
        },
      ]);
    }
    constants.events.push([
      document.getElementById('description'),
      'keyup',
      function (e) {
        if (e.key == 'Esc') {
          // esc
          description.Toggle(false);
        }
      },
    ]);

    // open events
    constants.events.push([
      document,
      'keyup',
      function (e) {
        if (e.key == 'd') {
          description.Toggle(true);
        }
      },
    ]);
  }

  /**
   * Removes the description element and backdrop from the DOM.
   */
  Destroy() {
    // description element destruction
    let description = document.getElementById('menu');
    if (description) {
      description.remove();
    }
    let backdrop = document.getElementById('desc_modal_backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  /**
   * Toggles the visibility of the description element.
   * @param {boolean} [onoff=false] - Whether to turn the description element on or off.
   */
  Toggle(onoff = false) {
    if (typeof onoff == 'undefined') {
      if (document.getElementById('description').classList.contains('hidden')) {
        onoff = true;
      } else {
        onoff = false;
      }
    }
    if (onoff) {
      // open
      this.whereWasMyFocus = document.activeElement;
      constants.tabMovement = 0;
      this.PopulateData();
      document.getElementById('description').classList.remove('hidden');
      document.getElementById('desc_modal_backdrop').classList.remove('hidden');
      document.querySelector('#description .close').focus();
    } else {
      // close
      document.getElementById('description').classList.add('hidden');
      document.getElementById('desc_modal_backdrop').classList.add('hidden');
      this.whereWasMyFocus.focus();
      this.whereWasMyFocus = null;
    }
  }

  /**
   * Populates the data for the chart and table based on the chart type and plot data.
   */
  PopulateData() {
    let descHtml = '';

    // chart labels and descriptions
    let descType = '';
    if (constants.chartType == 'bar') {
      descType = 'Bar chart';
    } else if (constants.chartType == 'heat') {
      descType = 'Heatmap';
    } else if (constants.chartType == 'box') {
      descType = 'Box plot';
    } else if (constants.chartType == 'scatter') {
      descType = 'Scatter plot';
    } else if (constants.chartType == 'line') {
      descType = 'Line chart';
    } else if (constants.chartType == 'hist') {
      descType = 'Histogram';
    }

    if (descType) {
      descHtml += `<p>Type: ${descType}</p>`;
    }
    if (plot.title != null) {
      descHtml += `<p>Title: ${plot.title}</p>`;
    }
    if (plot.subtitle != null) {
      descHtml += `<p>Subtitle: ${plot.subtitle}</p>`;
    }
    if (plot.caption != null) {
      descHtml += `<p>Caption: ${plot.caption}</p>`;
    }

    // table of data, prep
    let descTableHtml = '';
    let descLabelX = null;
    let descLabelY = null;
    let descTickX = null;
    let descTickY = null;
    let descData = null;
    let descNumCols = 0;
    let descNumColsWithLabels = 0;
    let descNumRows = 0;
    let descNumRowsWithLabels = 0;
    if (constants.chartType == 'bar') {
      if (plot.plotLegend.x != null) {
        descLabelX = plot.plotLegend.x;
        descNumColsWithLabels += 1;
      }
      if (plot.plotLegend.y != null) {
        descLabelY = plot.plotLegend.y;
        descNumRowsWithLabels += 1;
      }
      if (plot.columnLabels != null) {
        descTickX = plot.columnLabels;
        descNumRowsWithLabels += 1;
      }
      if (plot.plotData != null) {
        descData = [];
        descData[0] = plot.plotData;
        descNumCols = plot.plotData.length;
        descNumRows = 1;
        descNumColsWithLabels += descNumCols;
        descNumRowsWithLabels += descNumRows;
      }
    }

    // table of data, create
    if (descData != null) {
      descTableHtml += '<table>';

      // header rows
      if (descLabelX != null || descTickX != null) {
        descTableHtml += '<thead>';
        if (descLabelX != null) {
          descTableHtml += '<tr>';
          if (descLabelY != null) {
            descTableHtml += '<td></td>';
          }
          if (descTickY != null) {
            descTableHtml += '<td></td>';
          }
          descTableHtml += `<th scope="col" colspan="${descNumCols}">${descLabelX}</th>`;
          descTableHtml += '</tr>';
        }
        if (descTickX != null) {
          descTableHtml += '<tr>';
          if (descLabelY != null) {
            descTableHtml += '<td></td>';
          }
          if (descTickY != null) {
            descTableHtml += '<td></td>';
          }
          for (let i = 0; i < descNumCols; i++) {
            descTableHtml += `<th scope="col">${descTickX[i]}</th>`;
          }
          descTableHtml += '</tr>';
        }
        descTableHtml += '</thead>';
      }

      // body rows
      if (descNumRows > 0) {
        descTableHtml += '<tbody>';
        for (let i = 0; i < descNumRows; i++) {
          descTableHtml += '<tr>';
          if (descLabelY != null && i == 0) {
            descTableHtml += `<th scope="row" rowspan="${descNumRows}">${descLabelY}</th>`;
          }
          if (descTickY != null) {
            descTableHtml += `<th scope="row">${descTickY[i]}</th>`;
          }
          for (let j = 0; j < descNumCols; j++) {
            descTableHtml += `<td>${descData[i][j]}</td>`;
          }
          descTableHtml += '</tr>';
        }
        descTableHtml += '</tbody>';
      }

      descTableHtml += '</table>';
    }

    // bar: don't need colspan or rowspan stuff, put legendX and Y as headers

    document.getElementById('desc_title').innerHTML = descType + ' description';
    document.getElementById('desc_content').innerHTML = descHtml;
    document.getElementById('desc_table').innerHTML = descTableHtml;
  }
}

/**
 * Represents a position in 3D space.
 * @class
 */
class Position {
  constructor(x = 0, y = 0, z = -1) {
    this.x = x;
    this.y = y;
    this.z = z; // rarely used
  }
}

// HELPER FUNCTIONS
/**
 * A helper class with static methods.
 */
class Helper {
  /**
   * Checks if an object is present in an array.
   * @param {Object} obj - The object to search for.
   * @param {Array} arr - The array to search in.
   * @returns {boolean} - True if the object is present in the array, false otherwise.
   */
  static containsObject(obj, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === obj) return true;
    }
    return false;
  }
}

/**
 * A class representing a Tracker.
 * @class
 */
class Tracker {
  constructor() {
    this.DataSetup();
  }

  /**
   * Sets up the tracker data by checking if previous data exists and creating new data if it doesn't.
   */
  DataSetup() {
    let prevData = this.GetTrackerData();
    if (prevData) {
      // good to go already, do nothing
    } else {
      let data = {};
      data.userAgent = Object.assign(navigator.userAgent);
      data.vendor = Object.assign(navigator.vendor);
      data.language = Object.assign(navigator.language);
      data.platform = Object.assign(navigator.platform);
      data.events = [];

      this.SaveTrackerData(data);
    }
  }

  /**
   * Downloads the tracker data as a JSON file.
   */
  DownloadTrackerData() {
    let link = document.createElement('a');
    let data = this.GetTrackerData();
    let fileStr = new Blob([JSON.stringify(data)], { type: 'text/plain' });
    link.href = URL.createObjectURL(fileStr);
    link.download = 'tracking.json';
    link.click();
  }

  /**
   * Saves the tracker data to local storage.
   * @param {Object} data - The data to be saved.
   */
  SaveTrackerData(data) {
    localStorage.setItem(constants.project_id, JSON.stringify(data));
  }

  /**
   * Retrieves tracker data from local storage.
   * @returns {Object} The tracker data.
   */
  GetTrackerData() {
    let data = JSON.parse(localStorage.getItem(constants.project_id));
    return data;
  }

  /**
   * Removes the project_id from localStorage, clears the tracking data, and sets up new data.
   */
  Delete() {
    localStorage.removeItem(constants.project_id);
    this.data = null;

    if (constants.debugLevel > 0) {
      console.log('tracking data cleared');
    }

    this.DataSetup();
  }

  /**
   * Logs an event with various properties to the tracker data.
   * @param {Event} e - The event to log.
   */
  LogEvent(e) {
    let eventToLog = {};

    // computer stuff
    eventToLog.timestamp = Object.assign(e.timeStamp);
    eventToLog.time = Date().toString();
    eventToLog.key = Object.assign(e.key);
    eventToLog.altKey = Object.assign(e.altKey);
    eventToLog.ctrlKey = Object.assign(e.ctrlKey);
    eventToLog.shiftKey = Object.assign(e.shiftKey);
    if (e.path) {
      eventToLog.focus = Object.assign(e.path[0].tagName);
    }

    // settings etc, which we have to reassign otherwise they'll all be the same val
    if (!this.isUndefinedOrNull(constants.position)) {
      eventToLog.position = Object.assign(constants.position);
    }
    if (!this.isUndefinedOrNull(constants.minX)) {
      eventToLog.min_x = Object.assign(constants.minX);
    }
    if (!this.isUndefinedOrNull(constants.maxX)) {
      eventToLog.max_x = Object.assign(constants.maxX);
    }
    if (!this.isUndefinedOrNull(constants.minY)) {
      eventToLog.min_y = Object.assign(constants.minY);
    }
    if (!this.isUndefinedOrNull(constants.MAX_FREQUENCY)) {
      eventToLog.max_frequency = Object.assign(constants.MAX_FREQUENCY);
    }
    if (!this.isUndefinedOrNull(constants.MIN_FREQUENCY)) {
      eventToLog.min_frequency = Object.assign(constants.MIN_FREQUENCY);
    }
    if (!this.isUndefinedOrNull(constants.NULL_FREQUENCY)) {
      eventToLog.null_frequency = Object.assign(constants.NULL_FREQUENCY);
    }
    if (!this.isUndefinedOrNull(constants.MAX_SPEED)) {
      eventToLog.max_speed = Object.assign(constants.MAX_SPEED);
    }
    if (!this.isUndefinedOrNull(constants.MIN_SPEED)) {
      eventToLog.min_speed = Object.assign(constants.MIN_SPEED);
    }
    if (!this.isUndefinedOrNull(constants.INTERVAL)) {
      eventToLog.interval = Object.assign(constants.INTERVAL);
    }
    if (!this.isUndefinedOrNull(constants.vol)) {
      eventToLog.volume = Object.assign(constants.vol);
    }
    if (!this.isUndefinedOrNull(constants.autoPlayRate)) {
      eventToLog.autoplay_rate = Object.assign(constants.autoPlayRate);
    }
    if (!this.isUndefinedOrNull(constants.colorSelected)) {
      eventToLog.color = Object.assign(constants.colorSelected);
    }
    if (!this.isUndefinedOrNull(constants.brailleDisplayLength)) {
      eventToLog.braille_display_length = Object.assign(
        constants.brailleDisplayLength
      );
    }
    if (!this.isUndefinedOrNull(constants.duration)) {
      eventToLog.tone_duration = Object.assign(constants.duration);
    }
    if (!this.isUndefinedOrNull(constants.autoPlayOutlierRate)) {
      eventToLog.autoplay_outlier_rate = Object.assign(
        constants.autoPlayOutlierRate
      );
    }
    if (!this.isUndefinedOrNull(constants.autoPlayPointsRate)) {
      eventToLog.autoplay_points_rate = Object.assign(
        constants.autoPlayPointsRate
      );
    }
    if (!this.isUndefinedOrNull(constants.textMode)) {
      eventToLog.text_mode = Object.assign(constants.textMode);
    }
    if (!this.isUndefinedOrNull(constants.sonifMode)) {
      eventToLog.sonification_mode = Object.assign(constants.sonifMode);
    }
    if (!this.isUndefinedOrNull(constants.brailleMode)) {
      eventToLog.braille_mode = Object.assign(constants.brailleMode);
    }
    if (!this.isUndefinedOrNull(constants.chartType)) {
      eventToLog.chart_type = Object.assign(constants.chartType);
    }
    if (!this.isUndefinedOrNull(constants.infoDiv.innerHTML)) {
      let textDisplay = Object.assign(constants.infoDiv.innerHTML);
      textDisplay = textDisplay.replaceAll(/<[^>]*>?/gm, '');
      eventToLog.text_display = textDisplay;
    }
    if (!this.isUndefinedOrNull(location.href)) {
      eventToLog.location = Object.assign(location.href);
    }

    // chart specific values
    let x_tickmark = '';
    let y_tickmark = '';
    let x_label = '';
    let y_label = '';
    let value = '';
    let fill_value = '';
    if (constants.chartType == 'bar') {
      if (!this.isUndefinedOrNull(plot.columnLabels[position.x])) {
        x_tickmark = plot.columnLabels[position.x];
      }
      if (!this.isUndefinedOrNull(plot.plotLegend.x)) {
        x_label = plot.plotLegend.x;
      }
      if (!this.isUndefinedOrNull(plot.plotLegend.y)) {
        y_label = plot.plotLegend.y;
      }
      if (!this.isUndefinedOrNull(plot.plotData[position.x])) {
        value = plot.plotData[position.x];
      }
    } else if (constants.chartType == 'heat') {
      if (!this.isUndefinedOrNull(plot.x_labels[position.x])) {
        x_tickmark = plot.x_labels[position.x].trim();
      }
      if (!this.isUndefinedOrNull(plot.y_labels[position.y])) {
        y_tickmark = plot.y_labels[position.y].trim();
      }
      if (!this.isUndefinedOrNull(plot.x_group_label)) {
        x_label = plot.x_group_label;
      }
      if (!this.isUndefinedOrNull(plot.y_group_label)) {
        y_label = plot.y_group_label;
      }
      if (!this.isUndefinedOrNull(plot.values)) {
        if (!this.isUndefinedOrNull(plot.values[position.x][position.y])) {
          value = plot.values[position.x][position.y];
        }
      }
      if (!this.isUndefinedOrNull(plot.group_labels[2])) {
        fill_value = plot.group_labels[2];
      }
    } else if (constants.chartType == 'box') {
      let plotPos =
        constants.plotOrientation == 'vert' ? position.x : position.y;
      let sectionPos =
        constants.plotOrientation == 'vert' ? position.y : position.x;

      if (!this.isUndefinedOrNull(plot.x_group_label)) {
        x_label = plot.x_group_label;
      }
      if (!this.isUndefinedOrNull(plot.y_group_label)) {
        y_label = plot.y_group_label;
      }
      if (constants.plotOrientation == 'vert') {
        if (plotPos > -1 && sectionPos > -1) {
          if (
            !this.isUndefinedOrNull(plot.plotData[plotPos][sectionPos].label)
          ) {
            y_tickmark = plot.plotData[plotPos][sectionPos].label;
          }
          if (!this.isUndefinedOrNull(plot.x_labels[position.x])) {
            x_tickmark = plot.x_labels[position.x];
          }
          if (
            !this.isUndefinedOrNull(plot.plotData[plotPos][sectionPos].values)
          ) {
            value = plot.plotData[plotPos][sectionPos].values;
          } else if (
            !this.isUndefinedOrNull(plot.plotData[plotPos][sectionPos].y)
          ) {
            value = plot.plotData[plotPos][sectionPos].y;
          }
        }
      } else {
        if (plotPos > -1 && sectionPos > -1) {
          if (
            !this.isUndefinedOrNull(plot.plotData[plotPos][sectionPos].label)
          ) {
            x_tickmark = plot.plotData[plotPos][sectionPos].label;
          }
          if (!this.isUndefinedOrNull(plot.y_labels[position.y])) {
            y_tickmark = plot.y_labels[position.y];
          }
          if (
            !this.isUndefinedOrNull(plot.plotData[plotPos][sectionPos].values)
          ) {
            value = plot.plotData[plotPos][sectionPos].values;
          } else if (
            !this.isUndefinedOrNull(plot.plotData[plotPos][sectionPos].x)
          ) {
            value = plot.plotData[plotPos][sectionPos].x;
          }
        }
      }
    } else if (constants.chartType == 'point') {
      if (!this.isUndefinedOrNull(plot.x_group_label)) {
        x_label = plot.x_group_label;
      }
      if (!this.isUndefinedOrNull(plot.y_group_label)) {
        y_label = plot.y_group_label;
      }

      if (!this.isUndefinedOrNull(plot.x[position.x])) {
        x_tickmark = plot.x[position.x];
      }
      if (!this.isUndefinedOrNull(plot.y[position.x])) {
        y_tickmark = plot.y[position.x];
      }

      value = [x_tickmark, y_tickmark];
    }

    eventToLog.x_tickmark = Object.assign(x_tickmark);
    eventToLog.y_tickmark = Object.assign(y_tickmark);
    eventToLog.x_label = Object.assign(x_label);
    eventToLog.y_label = Object.assign(y_label);
    eventToLog.value = Object.assign(value);
    eventToLog.fill_value = Object.assign(fill_value);

    //console.log("x_tickmark: '", x_tickmark, "', y_tickmark: '", y_tickmark, "', x_label: '", x_label, "', y_label: '", y_label, "', value: '", value, "', fill_value: '", fill_value);

    let data = this.GetTrackerData();
    data.events.push(eventToLog);
    this.SaveTrackerData(data);
  }

  /**
   * Checks if the given item is undefined or null.
   * @param {*} item - The item to check.
   * @returns {boolean} - Returns true if the item is undefined or null, else false.
   */
  isUndefinedOrNull(item) {
    try {
      return item === undefined || item === null;
    } catch {
      return true;
    }
  }
}

/**
 * Represents a Review object.
 * @class
 */
class Review {
  constructor() {}

  /**
   * Toggles the review mode on or off.
   * @param {boolean} [onoff=true] - Whether to turn review mode on or off. Default is true.
   */
  ToggleReviewMode(onoff = true) {
    // true means on or show
    if (onoff) {
      constants.reviewSaveSpot = document.activeElement;
      constants.review_container.classList.remove('hidden');
      constants.reviewSaveBrailleMode = constants.brailleMode;
      constants.review.focus();

      display.announceText('Review on');
    } else {
      constants.review_container.classList.add('hidden');
      if (constants.reviewSaveBrailleMode == 'on') {
        // we have to turn braille mode back on
        display.toggleBrailleMode('on');
      } else {
        constants.reviewSaveSpot.focus();
      }
      display.announceText('Review off');
    }
  }
}

/**
 * Represents a class for logging errors.
 */
class LogError {
  constructor() {}

  /**
   * Logs the absent element and turns off visual highlighting.
   * @param {string} a - The absent element to log.
   */
  LogAbsentElement(a) {
    console.log(a, 'not found. Visual highlighting is turned off.');
  }

  /**
   * Logs a critical element and indicates that MAIDR is unable to run.
   * @param {string} a - The critical element to log.
   */
  LogCriticalElement(a) {
    consolelog(a, 'is critical. MAIDR unable to run');
  }

  /**
   * Logs a message indicating that two values do not have the same length.
   * @param {*} a - The first value to compare.
   * @param {*} b - The second value to compare.
   */
  LogDifferentLengths(a, b) {
    console.log(
      a,
      'and',
      b,
      'do not have the same length. Visual highlighting is turned off.'
    );
  }

  /**
   * Logs a message indicating that too many elements were found and only the first n elements will be highlighted.
   * @param {string} a - The type of element being highlighted.
   * @param {number} b - The maximum number of elements to highlight.
   */
  LogTooManyElements(a, b) {
    console.log(
      'Too many',
      a,
      'elements. Only the first',
      b,
      'will be highlighted.'
    );
  }

  /**
   * Logs a message indicating that the provided parameter is not an array.
   * @param {*} a - The parameter that is not an array.
   */
  LogNotArray(a) {
    console.log(a, 'is not an array. Visual highlighting is turned off.');
  }
}
