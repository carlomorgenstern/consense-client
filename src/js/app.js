var angular = require('angular');
(function(angular) {
	angular.module('app', [require('angular-material')])
		.directive('myDiv', function() {
			return {
				template: "TESTEST123"
			};
		});
})(angular);