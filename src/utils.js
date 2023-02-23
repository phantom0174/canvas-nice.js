export const requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (func) {
        return window.setTimeout(func, 1000 / 60);
    };

export const cancelAnimationFrame = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.clearTimeout;

export const canvasStyle = config =>
    `position:fixed;top:0;left:0;z-index:${config.zIndex};opacity:${config.opacity}`;


export const rand = (min, max) =>
    (max - min) * Math.random() + min;
