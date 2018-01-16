"use strict";
if ('function' != typeof jQuery)
  throw Error('jQuery not found');
jQuery(function($) {
  test('The OomHub class', function() {
    is('object' === (typeof OOM === 'undefined' ? 'undefined' : $traceurRuntime.typeof(OOM)), 'The OOM namespace object exists');
    is('undefined' === typeof OomHub, 'OomHub is not global');
    var Class = OOM.OomHub;
    is('function' === typeof Class, 'OomHub is a function');
    is('OomHub' === Class.NAME, 'NAME as expected');
    is('1.0.0' === Class.VERSION, 'VERSION as expected');
    is('http://oom-hub.loop.coop/' === Class.HOMEPAGE, 'HOMEPAGE as expected');
  });
});
//# sourceURL=<compile-source>




//\\//\\ built by Oomtility Make 1.0.6 //\\//\\ http://oomtility.loop.coop //\\//\\
