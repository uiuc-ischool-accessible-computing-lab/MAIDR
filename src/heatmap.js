document.addEventListener('DOMContentLoaded', function (e) { // we wrap in DOMContentLoaded to make sure everything has loaded before we run anything

    // variable initialization
    constants.plotId = 'geom_rect.rect.2.1';
    window.position = new Position(-1, -1);
    window.plot = new HeatMap();
    constants.chartType = "heatmap";
    let rect = new HeatMapRect();
    let audio = new Audio();
    let lastPlayed = '';
    let lastx = 0;
    let lastKeyTime = 0;
    let pressedL = false;

    // control eventlisteners
    constants.svg_container.addEventListener("keydown", function (e) {
        let updateInfoThisRound = false;
        let isAtEnd = false;

        // right arrow 39
        if (e.which === 39) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.x;
                    position.x -= 1;
                    Autoplay('right', position.x, plot.num_cols);
                } else {
                    position.x = plot.num_cols - 1;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.x != plot.num_cols - 1) {
                lastx = position.x;
                Autoplay('reverse-right', plot.num_cols, position.x);
            } else {
                if (position.x == -1 && position.y == -1) {
                    position.y += 1;
                }
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
            }
            constants.navigation = 1;
        }

        // left arrow 37
        if (e.which === 37) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.x;
                    position.x += 1;
                    Autoplay('left', position.x, -1);
                } else {
                    position.x = 0;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
                lastx = position.x;
                Autoplay('reverse-left', -1, position.x);
            } else {
                position.x -= 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
            }
            constants.navigation = 1;
        }

        // up arrow 38
        if (e.which === 38) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.y;
                    position.y += 1;
                    Autoplay('up', position.y, -1);
                } else {
                    position.y = 0;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.y != 0) {
                lastx = position.x;
                Autoplay('reverse-up', -1, position.y);
            } else {
                position.y -= 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
            }
            constants.navigation = 0;
        }

        // down arrow 40
        if (e.which === 40) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.y;
                    position.y -= 1;
                    Autoplay('down', position.y, plot.num_rows);
                } else {
                    position.y = plot.num_rows - 1;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.y != plot.num_rows - 1) {
                lastx = position.x;
                Autoplay('reverse-down', plot.num_rows, position.y);
            } else {
                if (position.x == -1 && position.y == -1) {
                    position.x += 1;
                }
                position.y += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
            }
            constants.navigation = 0;
        }

        // update text, display, and audio
        if (updateInfoThisRound && !isAtEnd) {
            UpdateAll();
        }
        if (isAtEnd) {
            audio.playEnd();
        }
    });


    constants.brailleInput.addEventListener("keydown", function (e) {
        let updateInfoThisRound = false;
        let isAtEnd = false;

        if (e.which == 9) { // let user tab
        } else if (e.which == 39) { // right arrow
            if (e.target.selectionStart > e.target.value.length - 3 || e.target.value.substring(e.target.selectionStart + 1, e.target.selectionStart + 2) == '⠳') {
                // already at the end, do nothing
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (position.x == -1 && position.y == -1) {
                        position.x += 1;
                        position.y += 1;
                    }
                    if (e.shiftKey) {
                        position.x -= 1;
                        Autoplay('right', position.x, plot.num_cols);
                    } else {
                        position.x = plot.num_cols - 1;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.x != plot.num_cols - 1) {
                    lastx = position.x;
                    Autoplay('reverse-right', plot.num_cols, position.x);
                } else {
                    if (position.x == -1 && position.y == -1) {
                        position.y += 1;
                    }
                    position.x += 1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                // we need pos to be y*(num_cols+1), (and num_cols+1 because there's a spacer character)
                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 1;
            }
        } else if (e.which == 37) { // left
            if (e.target.selectionStart == 0 || e.target.value.substring(e.target.selectionStart - 1, e.target.selectionStart) == '⠳') {
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (e.shiftKey) {
                        // lastx = position.x;
                        position.x += 1;
                        Autoplay('left', position.x, -1);
                    } else {
                        position.x = 0;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.x != 0) {
                    lastx = position.x;
                    Autoplay('reverse-left', -1, position.x);
                } else {
                    position.x += -1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 1;
            }
        } else if (e.which == 40) { // down
            if (position.y + 1 == plot.num_rows) {
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (position.x == -1 && position.y == -1) {
                        position.x += 1;
                        position.y += 1;
                    }
                    if (e.shiftKey) {
                        position.y -= 1;
                        Autoplay('down', position.y, plot.num_rows);
                    } else {
                        position.y = plot.num_rows - 1;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.y != plot.num_rows - 1) {
                    lastx = position.x;
                    Autoplay('reverse-down', plot.num_rows, position.y);
                } else {
                    if (position.x == -1 && position.y == -1) {
                        position.x += 1;
                    }
                    position.y += 1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 0;
            }
        } else if (e.which == 38) { // up
            if (e.target.selectionStart - plot.num_cols - 1 < 0) {
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (e.shiftKey) {
                        // lastx = position.y;
                        position.y += 1;
                        Autoplay('up', position.y, -1);
                    } else {
                        position.y = 0;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.y != 0) {
                    lastx = position.x;
                    Autoplay('reverse-up', -1, position.y);
                } else {
                    position.y += -1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 0;
            }
        } else {
            e.preventDefault();
        }

        // auto turn off braille mode if we leave the braille box
        constants.brailleInput.addEventListener('focusout', function (e) {
            display.toggleBrailleMode('off');
        });

        if (updateInfoThisRound && !isAtEnd) {
            UpdateAllBraille();
        }
        if (isAtEnd) {
            audio.playEnd();
        }
    });

    // var keys;

    let controlElements = [constants.svg_container, constants.brailleInput];
    for (let i = 0; i < controlElements.length; i++) {
        controlElements[i].addEventListener("keydown", function (e) {

            // B: braille mode
            if (e.which == 66) {
                display.toggleBrailleMode();
                e.preventDefault();
            }
            // keys = (keys || []);
            // keys[e.keyCode] = true;
            // if (keys[84] && !keys[76]) {
            //     display.toggleTextMode();
            // }

            // T: aria live text output mode
            if (e.which == 84) {
                let timediff = window.performance.now() - lastKeyTime;
                if (!pressedL || timediff > constants.keypressInterval) {
                    display.toggleTextMode();
                }
            }

            // S: sonification mode
            if (e.which == 83) {
                display.toggleSonificationMode();
            }

            // space: replay info but no other changes
            if (e.which === 32) {
                UpdateAll();
            }

        });
    }

    document.addEventListener("keydown", function (e) {

        if (constants.isMac ? e.metaKey : e.ctrlKey) {

            // (ctrl/cmd)+(home/fn+left arrow): first element
            if (e.which == 36) {
                position.x = 0;
                position.y = 0;
                UpdateAllBraille();
            }

            // (ctrl/cmd)+(end/fn+right arrow): last element
            else if (e.which == 35) {
                position.x = plot.num_cols - 1;
                position.y = plot.num_rows - 1;
                UpdateAllBraille();
            }
        }

        // keys = (keys || []);
        // keys[e.keyCode] = true;
        // // lx: x label, ly: y label, lt: title, lf: fill
        // if (keys[76] && keys[88]) { // lx
        //     display.displayXLabel(plot);
        // }

        // if (keys[76] && keys[89]) { // ly
        //     display.displayYLabel(plot);
        // }

        // if (keys[76] && keys[84]) { // lt
        //     display.displayTitle(plot);
        // }

        // if (keys[76] && keys[70]) { // lf
        //     display.displayFill(plot);
        // }

        // must come before the prefix L
        if (pressedL) {
            if (e.which == 88) { // X: x label
                let timediff = window.performance.now() - lastKeyTime;
                if (pressedL && timediff <= constants.keypressInterval) {
                    display.displayXLabel(plot);
                }
                pressedL = false;
            } else if (e.which == 89) { // Y: y label
                let timediff = window.performance.now() - lastKeyTime;
                if (pressedL && timediff <= constants.keypressInterval) {
                    display.displayYLabel(plot);
                }
                pressedL = false;
            } else if (e.which == 84) { // T: title
                let timediff = window.performance.now() - lastKeyTime;
                if (pressedL && timediff <= constants.keypressInterval) {
                    display.displayTitle(plot);
                }
                pressedL = false;
            } else if (e.which == 70) { // F: fill label
                let timediff = window.performance.now() - lastKeyTime;
                if (pressedL && timediff <= constants.keypressInterval) {
                    display.displayFill(plot);
                }
                pressedL = false;
            } else if (e.which == 76) {
                lastKeyTime = window.performance.now();
                pressedL = true;
            } else {
                pressedL = false;
            }
        }

        // L: prefix for label; must come after suffix
        if (e.which == 76) {
            lastKeyTime = window.performance.now();
            pressedL = true;
        }

        // period: speed up
        if (e.which == 190) {
            constants.SpeedUp();
            if (constants.autoplayId != null) {
                constants.KillAutoplay();
                if (lastPlayed == 'reverse-left') {
                    Autoplay('right', position.x, lastx);
                } else if (lastPlayed == 'reverse-right') {
                    Autoplay('left', position.x, lastx);
                } else if (lastPlayed == 'reverse-up') {
                    Autoplay('down', position.x, lastx);
                } else if (lastPlayed == 'reverse-down') {
                    Autoplay('up', position.x, lastx);
                } else {
                    Autoplay(lastPlayed, position.x, lastx);
                }
            }
        }

        // comma: speed down
        if (e.which == 188) {
            constants.SpeedDown();
            if (constants.autoplayId != null) {
                constants.KillAutoplay();
                if (lastPlayed == 'reverse-left') {
                    Autoplay('right', position.x, lastx);
                } else if (lastPlayed == 'reverse-right') {
                    Autoplay('left', position.x, lastx);
                } else if (lastPlayed == 'reverse-up') {
                    Autoplay('down', position.x, lastx);
                } else if (lastPlayed == 'reverse-down') {
                    Autoplay('up', position.x, lastx);
                } else {
                    Autoplay(lastPlayed, position.x, lastx);
                }
            }
        }
    });

    // document.addEventListener("keyup", function (e) {
    //     keys[e.keyCode] = false;
    //     stop();
    // }, false);

    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    // helper functions
    function lockPosition() {
        // lock to min / max postions
        let isLockNeeded = false;

        if (position.x < 0) {
            position.x = 0;
            isLockNeeded = true;
        }
        if (position.x > plot.num_cols - 1) {
            position.x = plot.num_cols - 1;
            isLockNeeded = true;
        }
        if (position.y < 0) {
            position.y = 0;
            isLockNeeded = true;
        }
        if (position.y > plot.num_rows - 1) {
            position.y = plot.num_rows - 1;
            isLockNeeded = true;
        }

        return isLockNeeded;
    }

    function UpdateAll() {
        if (constants.showDisplay) {
            display.displayValues(plot);
        }
        if (constants.showRect && constants.hasRect) {
            rect.UpdateRectDisplay();
        }
        if (constants.sonifMode != "off") {
            audio.playTone();
        }
    }
    function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
            display.displayValues(plot);
        }
        if (constants.showRect && constants.hasRect) {
            rect.UpdateRectDisplay();
        }
        if (constants.sonifMode != "off") {
            audio.playTone();
        }
        if (constants.brailleMode != "off") {
            display.UpdateBraillePos(plot);
        }
    }
    function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
            display.displayValues(plot);
        }
        if (constants.showRect && constants.hasRect) {
            rect.UpdateRectDisplay();
        }
        if (constants.sonifMode != "off") {
            audio.playTone();
        }
        display.UpdateBraillePos(plot);
    }

    function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right, down, reverse-left, and reverse-up
        if (dir == "left" || dir == "up" || dir == "reverse-right" || dir == "reverse-down") {
            step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
            constants.KillAutoplay();
        }

        if (dir == "reverse-left" || dir == "reverse-right") {
            position.x = start;
        } else if (dir == "reverse-up" || dir == "reverse-down") {
            position.y = start;
        }

        constants.autoplayId = setInterval(function () {
            if (dir == "left" || dir == "right" || dir == "reverse-left" || dir == "reverse-right") {
                position.x += step;
                if (position.x < 0 || plot.num_cols - 1 < position.x) {
                    constants.KillAutoplay();
                    lockPosition();
                } else if (position.x == end) {
                    constants.KillAutoplay();
                    UpdateAllAutoplay();
                } else {
                    UpdateAllAutoplay();
                }
            } else { // up or down
                position.y += step;
                if (position.y < 0 || plot.num_rows - 1 < position.y) {
                    constants.KillAutoplay();
                    lockPosition();
                } else if (position.y == end) {
                    constants.KillAutoplay();
                    UpdateAllAutoplay();
                } else {
                    UpdateAllAutoplay();
                }
            }
        }, constants.autoPlayRate);
    }

});


class HeatMap {

    constructor() {

        if ( 'elements' in maidr ) {
            this.plots = maidr.elements;
            constants.hasRect = 1;
        } else {
            this.plots = document.querySelectorAll('g[id^="geom_rect"] > rect');
            constants.hasRect = 0;
        }

        this.group_labels = this.getGroupLabels();
        this.x_labels = this.getXLabels();
        this.y_labels = this.getYLabels();
        this.title = this.getTitle();

        this.plotData = this.getHeatMapData();
        this.updateConstants();

        this.x_coord = this.plotData[0];
        this.y_coord = this.plotData[1];
        this.values = this.plotData[2];
        this.num_rows = this.plotData[3];
        this.num_cols = this.plotData[4];

        this.x_group_label = this.group_labels[0].trim();
        this.y_group_label = this.group_labels[1].trim();
        this.box_label = this.group_labels[2].trim();

    }

    getHeatMapData() {

        // get the x_coord and y_coord to check if a square exists at the coordinates
        let x_coord_check = [];
        let y_coord_check = [];

        let unique_x_coord = [];
        let unique_y_coord = [];
        if (constants.hasRect) {
            for (let i = 0; i < this.plots.length; i++) {
                if (this.plots[i]) {
                    x_coord_check.push(parseFloat(this.plots[i].getAttribute('x')));
                    y_coord_check.push(parseFloat(this.plots[i].getAttribute('y')));
                }
            }

            // sort the squares to access from left to right, up to down
            x_coord_check.sort(function (a, b) { return a - b }); // ascending
            y_coord_check.sort(function (a, b) { return a - b }).reverse(); // descending

            // get unique elements from x_coord and y_coord
            unique_x_coord = [...new Set(x_coord_check)];
            unique_y_coord = [...new Set(y_coord_check)];
        }

        // get num of rows, num of cols, and total numbers of squares
        let num_rows = 0;
        let num_cols = 0;
        let num_squares = 0;
        if ( 'data' in maidr ) {
            num_rows = maidr.data.length;
            num_cols = maidr.data[0].length;
        } else {
            num_rows = unique_y_coord.length;
            num_cols = unique_x_coord.length;
        }
        num_squares = num_rows * num_cols;

        let norms = [];
        if ( 'data' in maidr ) {
            norms = [...maidr.data];
        } else {
            norms = Array(num_rows).fill().map(() => Array(num_cols).fill(0));
            let min_norm = 3 * (Math.pow(255, 2));
            let max_norm = 0;

            for (var i = 0; i < this.plots.length; i++) {
                var x_index = unique_x_coord.indexOf(x_coord_check[i]);
                var y_index = unique_y_coord.indexOf(y_coord_check[i]);
                let norm = this.getRGBNorm(i);
                norms[y_index][x_index] = norm;

                if (norm < min_norm) min_norm = norm;
                if (norm > max_norm) max_norm = norm;
            }
        }

        let plotData = [unique_x_coord, unique_y_coord, norms, num_rows, num_cols];

        return plotData;
    }

    updateConstants() {

        constants.minX = 0;
        constants.maxX = this.plotData[4]
        constants.minY = this.plotData[2][0][0]; // initial val
        constants.maxY = this.plotData[2][0][0]; // initial val
        for (let i = 0; i < this.plotData[2].length; i++) {
            for (let j = 0; j < this.plotData[2][i].length; j++) {
                if (this.plotData[2][i][j] < constants.minY) constants.minY = this.plotData[2][i][j];
                if (this.plotData[2][i][j] > constants.maxY) constants.maxY = this.plotData[2][i][j];
            }
        }
    }

    getRGBNorm(i) {
        let rgb_string = this.plots[i].getAttribute('fill');
        let rgb_array = rgb_string.slice(4, -1).split(',');
        // just get the sum of squared value of rgb, similar without sqrt, save computation 
        return rgb_array.map(function (x) {
            return Math.pow(x, 2);
        }).reduce(function (a, b) {
            return a + b;
        });
    }

    getGroupLabels() {

        let labels_nodelist;
        let title = "";
        let legendX = "";
        let legendY = "";

        if ('title' in maidr) {
            title = maidr.title;
        } else {
            title = document.querySelector('g[id^="guide.title"] text > tspan').innerHTML;
        }

        if ('axes' in maidr) {
            if ('x' in maidr.axes) {
                if ('label' in maidr.axes.x) {
                    legendX = maidr.axes.x.label;
                }
            }
            if ('y' in maidr.axes) {
                if ('label' in maidr.axes.y) {
                    legendY = maidr.axes.y.label;
                }
            }
        } else {
            legendX = document.querySelector('g[id^="xlab"] text > tspan').innerHTML;
            legendY = document.querySelector('g[id^="ylab"] text > tspan').innerHTML;
        }

        labels_nodelist = [
            legendX,
            legendY,
            title
        ];

        return labels_nodelist;
    }

    getXLabels() {

        if ('axes' in maidr) {
            if ('x' in maidr.axes) {
                if ('format' in maidr.axes.x) {
                    return maidr.axes.x.format;
                }
            }
        } else {
            let x_labels_nodelist;
            x_labels_nodelist = document.querySelectorAll('tspan[dy="10"]');
            let labels = [];
            for (let i = 0; i < x_labels_nodelist.length; i++) {
                labels.push(x_labels_nodelist[i].innerHTML.trim());
            }

            return labels;
        }
    }

    getYLabels() {

        if ('axes' in maidr) {
            if ('y' in maidr.axes) {
                if ('format' in maidr.axes.y) {
                    return maidr.axes.y.format;
                }
            }
        } else {
            let y_labels_nodelist;
            let labels = [];
            y_labels_nodelist = document.querySelectorAll('tspan[id^="GRID.text.19.1"]');
            for (let i = 0; i < y_labels_nodelist.length; i++) {
                labels.push(y_labels_nodelist[i].innerHTML.trim());
            }

            return labels.reverse();
        }
    }

    getTitle() {
        if ('title' in maidr) {
            return maidr.title;
        } else {
            let heatmapTitle = document.querySelector('g[id^="layout::title"] text > tspan').innerHTML;
            if (constants.manualData && typeof heatmapTitle !== 'undefined' && typeof heatmapTitle != null) {
                return heatmapTitle;
            } else {
                return "";
            }
        }
    }
}


class HeatMapRect {

    constructor() {
        if (constants.hasRect) {
            this.x = plot.x_coord[0];
            this.y = plot.y_coord[0];
            this.rectStrokeWidth = 4; // px
            this.height = Math.abs(plot.y_coord[1] - plot.y_coord[0]);
        }
    }

    UpdateRect() {
        this.x = plot.x_coord[position.x];
        this.y = plot.y_coord[position.y];
    }

    UpdateRectDisplay() {
        this.UpdateRect();
        if (document.getElementById('highlight_rect')) document.getElementById('highlight_rect').remove(); // destroy and recreate
        const svgns = "http://www.w3.org/2000/svg";
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttribute('id', 'highlight_rect');
        rect.setAttribute('x', this.x);
        rect.setAttribute('y', constants.svg.getBoundingClientRect().height - this.height - this.y); // y coord is inverse from plot data
        rect.setAttribute('width', this.height);
        rect.setAttribute('height', this.height);
        rect.setAttribute('stroke', constants.colorSelected);
        rect.setAttribute('stroke-width', this.rectStrokeWidth);
        rect.setAttribute('fill', 'none');
        constants.svg.appendChild(rect);
    }
}
