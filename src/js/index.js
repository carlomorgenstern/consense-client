'use strict';

(function(angular) {

	angular.module('appConSense', [require('angular-material'), require('angular-ui-calendar')])
		.config(require('./config_main'))
		.controller('AppCtrl', require('./controller_main'))
		.directive('dateField', require('./directive_dateField'));

})(require('angular'));