const RGB =
  /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
const RGBA =
  /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
const HEX = /^#([\da-f]{3}){1,2}$/i;
const HEXA = /^#([\da-f]{4}){1,2}$/i;
const HSL =
  /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
const HSLA =
  /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;

export const parseColor = function (color) {
  if (typeof color === 'undefined') {
    return console.error(`color is must,but got undefined`);
  }

  // rgb(255,25,2)
  // rgb(255 25 2)
  // rgb(50%,30%,10%)
  // rgb(50% 30% 10%)
  if (RGB.test(color)) {
    const RGBA = RGBToRGBA(color);
    return {
      type: 'RGBA',
      origin: color,
      value: RGBA,
    };
  }

  // rgba(255,25,2,0.5)
  // rgba(255 25 2 / 0.5)
  // rgba(50%,30%,10%,0.5)
  // rgba(50%,30%,10%,50%)
  // rgba(50% 30% 10% / 0.5)
  // rgba(50% 30% 10% / 50%)
  if (RGBA.test(color)) {
    return {
      type: 'RGBA',
      origin: color,
      value: color,
    };
  }

  // #000
  // #000000
  if (HEX.test(color)) {
    const RGBA = RGBToRGBA(HexToRGB(color));
    return {
      type: 'HEX',
      origin: color,
      value: RGBA,
    };
  }

  // #0008
  // #00000080
  if (HEXA.test(color)) {
    const RGBA = HexAToRGBA(color);
    return {
      type: 'HEX',
      origin: color,
      value: RGBA,
    };
  }

  // hsl(180 100% 50%)
  // hsl(180deg,100%,50%)
  // hsl(180deg 100% 50%)
  // hsl(3.14rad,100%,50%)
  // hsl(3.14rad 100% 50%)
  // hsl(0.5turn,100%,50%)
  // hsl(0.5turn 100% 50%)
  if (HSL.test(color)) {
    const RGBA = RGBToRGBA(HSLToRGB(color));
    return {
      type: 'HSLA',
      origin: color,
      value: RGBA,
    };
  }

  // hsla(180,100%,50%,50%)
  // hsla(180 100% 50% / 50%)
  // hsla(180deg,100%,50%,0.5)
  // hsla(3.14rad,100%,50%,0.5)
  // hsla(0.5turn 100% 50% / 50%)
  if (HSLA.test(color)) {
    const RGBA = HSLAToRGBA(color);
    return {
      type: 'HSLA',
      origin: color,
      value: RGBA,
    };
  }

  const getRGB = nameToRGB(color);
  if (getRGB === 'rgb(0, 0, 0)') {
    if (color !== 'black') {
      console.error(`Unable to parse ${color}, please make sure the data format is accurate`);
    } else {
      const RGBA = RGBToRGBA(getRGB);
      return {
        type: 'RGBA',
        origin: color,
        value: RGBA,
      };
    }
  } else {
    const RGBA = RGBToRGBA(getRGB);
    return {
      type: 'RGBA',
      origin: color,
      value: RGBA,
    };
  }

  console.error(`Unable to parse ${color}, please make sure the data format is accurate`);
};

// 处理边界值
function boundValue(value, max) {
  value = Math.min(max, Math.max(0, value));
  const DIFF_ABS = Math.abs(value - max);
  return DIFF_ABS < 0.000001 ? 1 : (value % max) / ~~max;
}

// 输入的h范围为[0,360],s,l为百分比形式的数值,范围是[0,100]
export const HSVAToRGB = (h, s, v, a = 1, isParams = false) => {
  h = boundValue(h, 360);
  s = boundValue(s, 100);
  v = boundValue(v, 100);

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0,
    g = 0,
    b = 0;
  const mod = i % 6;
  switch (mod) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  const round = v => Math.round(v * 255);

  if (isParams) {
    return {
      r: round(r),
      g: round(g),
      b: round(b),
      a,
    };
  }
  return a == 1
    ? 'rgb(' + round(r) + ',' + round(g) + ',' + round(b) + ')'
    : 'rgba(' + round(r) + ',' + round(g) + ',' + round(b) + ',' + a + ')';
};

export const RGBToHSV = (r, g, b) => {
  r = boundValue(r, 255);
  g = boundValue(g, 255);
  b = boundValue(b, 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  let v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    // h: h * 360,
    h: Math.round(h * 360),
    s,
    v,
  };
};

export function RGBToRGBA(color) {
  // 选择正确的分隔符
  let sep = color.indexOf(',') > -1 ? ',' : ' ';

  // 如果使用空格分隔语法，则去掉斜杠
  // 把 "rgb(r,g,b)" 转换成数组 [r,g,b]
  color = color.substr(4).split(')')[0].split(sep);

  color.push('1');

  return `rgba(${color.join(sep)})`;
}

export function parseRGBA(rgba) {
  // 选择正确的分隔符
  let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
  rgba = rgba.substr(5).split(')')[0].split(sep);
  return {
    r: rgba[0],
    g: rgba[1],
    b: rgba[2],
    a: rgba[3],
  };
}

export function RGBToHex(color, hasAlpha = false, isParams = false) {
  // 选择正确的分隔符
  let sep = color.indexOf(',') > -1 ? ',' : ' ';

  // 如果使用空格分隔语法，则去掉斜杠
  if (hasAlpha && color.indexOf('/') > -1) color.splice(3, 1);
  // 把 "rgb(r,g,b)" 转换成数组 [r,g,b]
  color = color
    .substr(hasAlpha ? 5 : 4)
    .split(')')[0]
    .split(sep);

  // 把 % 转换成 0-255
  /* Example:
   * 75% -> 191
   * 75 /100 = 0.75, * 255 = 191.25 -> 191
   */
  for (let R in color) {
    let r = color[R];
    if (r.indexOf('%') > -1) {
      if (hasAlpha) {
        let p = r.substr(0, r.length - 1) / 100;

        if (R < 3) {
          color[R] = Math.round(p * 255);
        } else {
          color[R] = p;
        }
      } else {
        color[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
      }
    }
  }

  let r = (+color[0]).toString(16);
  let g = (+color[1]).toString(16);
  let b = (+color[2]).toString(16);
  let a = hasAlpha ? Math.round(+color[3] * 255).toString(16) : 1;

  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;
  if (a.length == 1) a = '0' + a;

  if (isParams) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return '#' + r + g + b;
}

export function RGBAToHex(color, isParams = false) {
  const alpha = parseRGBA(color)['a'];
  const { r, g, b, a } = RGBToHex(color, true, true);

  if (isParams) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return alpha == 1 ? '#' + r + g + b : '#' + r + g + b + a;
}

export function HexToRGB(hex, hasAlpha = false, isParams = false) {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

  if (hasAlpha) {
    if (hex.length == 5) {
      r = '0x' + hex[1] + hex[1];
      g = '0x' + hex[2] + hex[2];
      b = '0x' + hex[3] + hex[3];
      a = '0x' + hex[4] + hex[4];
    } else if (hex.length == 9) {
      r = '0x' + hex[1] + hex[2];
      g = '0x' + hex[3] + hex[4];
      b = '0x' + hex[5] + hex[6];
      a = '0x' + hex[7] + hex[8];
    }
    a = +(a / 255).toFixed(2);
  } else {
    if (hex.length === 4) {
      r = '0x' + hex[1] + hex[1];
      g = '0x' + hex[2] + hex[2];
      b = '0x' + hex[3] + hex[3];
    } else if (hex.length === 7) {
      r = '0x' + hex[1] + hex[2];
      g = '0x' + hex[3] + hex[4];
      b = '0x' + hex[5] + hex[6];
    }
  }

  if (isParams) {
    return {
      r: +r,
      g: +g,
      b: +b,
      a,
    };
  }
  return 'rgb(' + +r + ',' + +g + ',' + +b + ')';
}

export function HexAToRGBA(color, isParams = false) {
  const { r, g, b, a } = HexToRGB(color, true, true);

  if (isParams) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return 'rgba(' + +r + ',' + +g + ',' + +b + ',' + a + ')';
}

export function RGBToHSL(color, hasAlpha = false, isParams = false) {
  let sep = color.indexOf(',') > -1 ? ',' : ' ';
  color = color
    .substr(hasAlpha ? 5 : 4)
    .split(')')[0]
    .split(sep);
  // convert %s to 0–255

  if (hasAlpha && color.indexOf('/') > -1) {
    color.splice(3, 1);
  }

  for (let R in color) {
    let r = color[R];
    if (r.indexOf('%') > -1) {
      if (hasAlpha) {
        let p = r.substr(0, r.length - 1) / 100;

        if (R < 3) {
          color[R] = Math.round(p * 255);
        }
      } else {
        color[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
      }
    }
  }
  let r = color[0] / 255;
  let g = color[1] / 255;
  let b = color[2] / 255;
  let a = hasAlpha ? color[3] : '1';

  // find greatest and smallest channel values
  let cmin = Math.min(r, g, b);
  let cmax = Math.max(r, g, b);
  let delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  // calculate hue
  // no difference
  if (delta == 0) h = 0;
  // red is max
  else if (cmax == r) h = ((g - b) / delta) % 6;
  // green is max
  else if (cmax == g) h = (b - r) / delta + 2;
  // blue is max
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // make negative hues positive behind 360°
  if (h < 0) h += 360;

  // calculate lightness
  l = (cmax + cmin) / 2;

  // calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  s = Math.round(s);
  l = Math.round(l);

  if (isParams) {
    return {
      h,
      s,
      l,
      a,
    };
  }
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

export function RGBAToHSLA(color, isParams = false) {
  const { h, s, l, a } = RGBToHSL(color, true, true);
  if (isParams) {
    return {
      h,
      s,
      l,
      a,
    };
  }
  return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
}

export function HSLToRGB(color, hasAlpha = false, isReturn = false) {
  let sep = color.indexOf(',') > -1 ? ',' : ' ';
  color = color
    .substr(hasAlpha ? 5 : 4)
    .split(')')[0]
    .split(sep);

  if (hasAlpha && color.indexOf('/') > -1) {
    color.splice(3, 1);
  }

  let h = color[0];
  let s = color[1].substr(0, color[1].length - 1) / 100;
  let l = color[2].substr(0, color[2].length - 1) / 100;
  let a = hasAlpha ? color[3] : '1';

  // strip label and convert to degrees (if necessary)
  if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
  else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
  else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
  // keep hue fraction of 360 if ending up over
  if (h >= 360) h %= 360;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  if (hasAlpha) {
    let pctFound = a.indexOf('%') > -1;
    if (pctFound) {
      a = a.substr(0, a.length - 1) / 100;
    }
  }
  if (isReturn) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return 'rgb(' + +r + ',' + +g + ',' + +b + ')';
}

export function HSLAToRGBA(color, isParams = false) {
  const { r, g, b, a } = HSLToRGB(color, true, true);
  if (isParams) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return 'rgba(' + +r + ',' + +g + ',' + +b + ',' + +a + ')';
}

export function HexToHSL(H, hasAlpha = false, isParams = false) {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

  if (hasAlpha) {
    if (H.length == 5) {
      r = '0x' + H[1] + H[1];
      g = '0x' + H[2] + H[2];
      b = '0x' + H[3] + H[3];
      a = '0x' + H[4] + H[4];
      // 8 digits
    } else if (H.length == 9) {
      r = '0x' + H[1] + H[2];
      g = '0x' + H[3] + H[4];
      b = '0x' + H[5] + H[6];
      a = '0x' + H[7] + H[8];
    }
    a = (a / 255).toFixed(2);
  } else {
    if (H.length == 4) {
      r = '0x' + H[1] + H[1];
      g = '0x' + H[2] + H[2];
      b = '0x' + H[3] + H[3];
    } else if (H.length == 7) {
      r = '0x' + H[1] + H[2];
      g = '0x' + H[3] + H[4];
      b = '0x' + H[5] + H[6];
    }
  }
  // then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b);
  let cmax = Math.max(r, g, b);
  let delta = cmax - cmin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  s = Math.round(s);
  l = Math.round(l);

  if (isParams) {
    return {
      h,
      s,
      l,
      a,
    };
  }

  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

export function HexAToHSLA(color, isParams = false) {
  const { h, s, l, a } = HexToHSL(color, true, true);
  if (isParams) {
    return {
      h,
      s,
      l,
      a,
    };
  }
  return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
}
export function HSLToHex(color, hasAlpha = false, isParams = false) {
  let sep = color.indexOf(',') > -1 ? ',' : ' ';
  color = color
    .substr(hasAlpha ? 5 : 4)
    .split(')')[0]
    .split(sep);

  if (hasAlpha && color.indexOf('/') > -1) {
    color.splice(3, 1);
  }

  let h = color[0];
  let s = color[1].substr(0, color[1].length - 1) / 100;
  let l = color[2].substr(0, color[2].length - 1) / 100;
  let a = hasAlpha ? color[3] : '1';

  // strip label and convert to degrees (if necessary)
  if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
  else if (h.indexOf('rad') > -1) h = Math.round(h.substr(0, h.length - 3) * (180 / Math.PI));
  else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
  if (h >= 360) h %= 360;

  if (hasAlpha) {
    if (a.indexOf('%') > -1) {
      a = a.substr(0, a.length - 1) / 100;
    }
  }

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);
  a = hasAlpha ? Math.round(a * 255).toString(16) : 1;
  // Prepend 0s, if necessary
  if (r.length === 1) r = '0' + r;
  if (g.length === 1) g = '0' + g;
  if (b.length === 1) b = '0' + b;
  if (a.length === 1) a = '0' + a;
  if (isParams) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return '#' + r + g + b;
}

export function HSLAToHexA(color, isParams = false) {
  const { r, g, b, a } = HSLToHex(color, true, true);
  if (isParams) {
    return {
      r,
      g,
      b,
      a,
    };
  }
  return '#' + r + g + b + a;
}

export function nameToRGB(name) {
  // create fake div
  let fakeDiv = document.createElement('div');
  fakeDiv.style.color = name;
  document.body.appendChild(fakeDiv);

  // get color of div
  let cs = window.getComputedStyle(fakeDiv);
  let pv = cs.getPropertyValue('color');

  // remove div after obtaining desired color value
  document.body.removeChild(fakeDiv);

  return pv;
}
