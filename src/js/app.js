"use strict";
var angular = require('angular');
var moment = require('moment');
(function(angular, moment) {
	angular.module('app', [require('angular-material'), require('./angular-ui-calendar.js')])
		.config(function($mdDateLocaleProvider) {
			// configuration for angular material date controls
			$mdDateLocaleProvider.months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
			$mdDateLocaleProvider.shortMonths = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
			$mdDateLocaleProvider.days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
			$mdDateLocaleProvider.shortDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
			$mdDateLocaleProvider.firstDayOfWeek = 1;
			$mdDateLocaleProvider.monthHeaderFormatter = function(date) {
				return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
			};
			$mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
				return 'Woche ' + weekNumber;
			};
			$mdDateLocaleProvider.msgCalendar = 'Kalender';
			$mdDateLocaleProvider.msgOpenCalendar = 'Kalender öffnen';

			// configuration for date parsing by $mdDateLocale
			$mdDateLocaleProvider.parseDate = function(dateString) {
				var m = moment(dateString, 'DD.MM.YYYY', true);
				return m.isValid() ? m.toDate() : null;
			};
			$mdDateLocaleProvider.formatDate = function(date) {
				return moment(date).format('DD.MM.YYYY');
			};
		})

	.controller('AppCtrl', function($scope, $timeout, $http, $q) {
		var mainCtrl = this;

		mainCtrl.selectedDate = new Date();
		$scope.eventSources = [];

		// handling room changes
		mainCtrl.searchTextRoom = "";
		mainCtrl.rooms = null;
		$http.get("http://localhost:8080/api/rooms", {
				responseType: "json"
			})
			.then(function(response) {
				mainCtrl.rooms = response.data.map(function(room) {
					return {
						value: room.toLowerCase(),
						display: room
					};
				});
			}, function(error) {
				console.log(error);
			});

		this.selectedRoomChange = function(room) {
			if (room === undefined || room.display === "") {
				$scope.eventSources.splice(0, $scope.eventSources.length);
			} else {
				var url = "http://localhost:8080/api/room/" + btoa(room.display);
				$http.get(url, {
						responseType: "json"
					})
					.then(function(response) {
						$scope.eventSources.splice(0, $scope.eventSources.length);
						var events = [];
						response.data.forEach(function(entry) {
							events.push({
								title: entry.EventName,
								start: entry.StartDate,
								end: entry.EndDate,
								description: "Dozent: "+entry.Speaker + " Raum: "+entry.Location
							});
						});
						$scope.eventSources.push({
							events: events,
							editable: false
						});
					}, function(error) {
						console.log(error);
					});
			}
		};

		var self = this;
		this.queryRoomSearch = function(searchTextRoom) {
			if (searchTextRoom === "") {
				return $q.resolve(self.rooms);
			} else {
				var searchTextLower = searchTextRoom.toLowerCase();
				return $q.resolve(self.rooms.filter(function(room) {
					return (room.value.indexOf(searchTextLower) !== -1);
				}));
			}
		};
	})

	.directive('dateField', function($mdDateLocale) {
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
	});

}(angular, moment));