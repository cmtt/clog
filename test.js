var clog = require('./lib/clog');

// display level configration:
clog.configure({'log level': 3});
//=> {'log': true, 'info': true, 'warn': true, 'error': false, 'success' : false, 'debug': false}

// custom display configration:
clog.configure({
  'log level': {
    'log': false,
    'info': true,
    'warn': true,
    'error': true,
    'success' : true,
    'debug': false
  },
  'date' : false, // requires the chrono module
  'global' : false
});

//=> {'log': false, 'info': true, 'warn': true, 'error': true, 'success' : true, 'debug': false}

// clog usage:
clog('server', 'start listening on port 3000');  // custom head

clog.log('hello', 'world');                      // console.log
clog.log('hello1', 'world2');                    // console.log
clog.info(['foo', 'bar']);                       // console.info
clog.warn('baz is deprecated.');                 // console.warn
clog.error('HTTP/1.1 400 Bad Request');          // console.error

clog.error(new Error('Falls apart at first touch'));
clog.error(null,'Database updated');

clog.debug('headers', {                          // console.debug
  'Content-Type': 'text/javascript'
});

clog.configure({
  'module' : true
});

clog.error('Database',null,'Images have been resized.');
var err = new Error('Database is corrupted.');

clog.error('Database',err);