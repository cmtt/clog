/*!
 * Clog - Colorful console output for your applications in NodeJS
 *
 * Copyright(c) 2012 Firejune <to@firejune.com>
 * MIT Licensed
 */

/**
 * Object to array
 */

function toArray(enu) {
  var arr = [];

  for (var i = 0, l = enu.length; i < l; i++)
    arr.push(enu[i]);

  return arr;
}

/**
 * Extends the destination object with the source object.
 */

function extendObject(destination, source) {
  for (var property in source)
    source.hasOwnProperty(property) === true && (destination[property] = source[property]);

  return destination;
}

/**
 * @function
 * Formats a text with the provided attributes.
 *
 * Adapted from https://github.com/loopj/commonjs-ansi-color
 * Copyright (c) 2010 James Smith <james@loopj.com>
 *
 */

var format = function (text, color) {
  var color_attrs = color.split(/\+/)
    , str = [];

  for (var i=0, attr; attr = color_attrs[i]; i++) {
    str.push ('\033[', ANSI_CODES[attr], 'm');
  }
  str.push(text,'\033[', ANSI_CODES['off'], 'm');
  return str.join('');  
};


/**
 * Clog environments.
 */
var version = '0.1.6-proposal'
  , TYPE_STRING = 'string'
  , TYPE_NUMBER = 'number'
  , TYPE_OBJECT = 'object'
  , TYPE_FUNCTION = 'function'
  , TYPE_BOOLEAN = 'boolean'
  , TYPE_UNDEFINED = 'undefined'
  , ANSI_CODES = {
    'off': 0,
    'bold': 1,
    'italic': 3,
    'underline': 4,
    'blink': 5,
    'inverse': 7,
    'hidden': 8,
    'black': 30,
    'red': 31,
    'green': 32,
    'yellow': 33,
    'blue': 34,
    'magenta': 35,
    'cyan': 36,
    'white': 37,
    'black_bg': 40,
    'red_bg': 41,
    'green_bg': 42,
    'yellow_bg': 43,
    'blue_bg': 44,
    'magenta_bg': 45,
    'cyan_bg': 46,
    'white_bg': 47,
    'grey' : 90
  }
  , styles = {
    'log'   : {
      color : 'off'
    },
    'error' : {
      color : 'white+red_bg+bold',
      text : [' ', String.fromCharCode(0x00d7), ' '].join('')
    },
    'success' : {
      color : 'white+green_bg+bold',
      text : [' ', String.fromCharCode(0x2713), ' '].join('') 
    },
    'warn'  : {
      color : 'yellow_bg+white+bold',
      text : [' ', String.fromCharCode(0x203C), ' '].join('')
    },
    'info'  : {
      color : 'white+blue_bg+bold',
      text : ' i '
    },
    'debug' : {
      // color : 'grey'
      color : 'black+white_bg+bold',
      text : [' ', String.fromCharCode(0x2691), ' '].join('')
    }
  }
  , levels = {
    'log': true,
    'info': true,
    'warn': true,
    'error': true,
    'success' : true,
    'debug': true,
  }
  , showDate = false /** Make sure that the module chrono is installed */
  , showModule = false
  , dateFormat = 'Y/m/d h:i a'
  , defaultStyle = 'off'
  , dateStyle = 'grey'
  , moduleStyle = 'white+underline';

/**
 * @constructs
 * Clog class.
 */

var Clog = function () {

  /**
   * Generate methods.
   */

  var self = this;
  for (var name in styles) {
    this.log[name] = (function (name) {
      return function() {
        self.log.apply(self, [name].concat(toArray(arguments)));
      }
    })(name);
  }

  this.log.configure = function (config) {
    return self.configure.call(self, config);
  };

  return this.log;
};


/**
 * @function
 * Configure method.
 */

Clog.prototype.configure = function (config) {
  var level = config['log level'] || levels
    , index = 0;

  if (!config) {
    throw new Error('No configuration was provided.');
  }

  showModule = config['module'] === true;
  showDate = config['date'] === true;

  if (showDate) {
    require('chrono');
    showDate = true;
    dateFormat = config['dateFormat'] || dateFormat;
  }

  if (config['global'] === true) {
    for (var name in styles) {
      global[name] = this.log[name];
    }
  }

  if (typeof level === TYPE_OBJECT)
    extendObject(levels, level);

  if (typeof level === TYPE_NUMBER)
    for (var property in levels) {
      levels[property] = index < level;
      index++;
    }

  return levels;
};

/**
 * @function
 * Log method.
 */

Clog.prototype.log = function (type, msg) {
  var args = toArray(arguments)
    , typeIdx = showModule ? 1 : 0
    , msgIdx = typeIdx+1;

  if (type === 'error') {
    if (args[msgIdx] === null) {
      (type = 'success') && args.splice(msgIdx,1) && (showModule && args.shift());
    } else if (args[msgIdx] instanceof Error) {
      (args[msgIdx] = format(args[msgIdx].message,'red')) && (showModule && args.shift());
    }
  }

  if (levels[type] === false) {
    return;
  }
  
  var style = styles[type]
    , label = type
    , pre;

  if (typeof style === TYPE_OBJECT) {
    if (typeof style.text === TYPE_STRING) {
      label = style.text;
    }
    if (typeof style.color === TYPE_STRING) {
      pre = format(label, style.color);
    }
  } else {
    pre = format(label,defaultStyle);
  }

  pre = [pre];

  if (showModule === true) {
    pre.unshift(format(args[1],moduleStyle)); 
  }

  if (showDate === true) {
    pre.unshift(format(new Date().format(dateFormat),dateStyle));
  }

  console.log.apply(console, pre.concat(args.slice(1)));

  return levels[type];
};


/**
 * @exports
 * Export intance of Clog as the module.
 */

module.exports = new Clog;
