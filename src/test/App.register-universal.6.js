//// OomHub //// 1.0.2 //// January 2018 //// http://oom-hub.loop.coop/ ////////




if ('function' != typeof jQuery) throw Error('jQuery not found')
jQuery( function($) {




test('OomHub.register()', () => {
    const Class = OOM.OomHub
    is('function' === typeof Class.prototype.register,
       'OomHub.prototype.register() is a function')
    const method = Class.prototype.register
    is('123 ok!' === method('123x'),
       'Returns value as expected')

    is('register' === method.NAME, 'NAME as expected')
})




})
