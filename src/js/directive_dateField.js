'use strict';

module.exports = ['$mdDateLocale', function($mdDateLocale) {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, ngModelController) {
			ngModelController.$parsers.push(function(data) {
				// View to Model
				var date = $mdDateLocale.parseDate(data);

				// if the date field is not a valid date 
				// then set a 'date' error flag by calling $setValidity
				ngModelController.$setValidity('date', date !== null);
				return date !== null ? date : undefined;
			});
			ngModelController.$formatters.push(function(data) {
				// Model to View
				return $mdDateLocale.formatDate(data);
			});
		}
	};
}];