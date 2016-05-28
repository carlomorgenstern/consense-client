'use strict';

module.exports = ['$http', '$q', function($http, $q) {
	var ctrl = this;

	// variables
	ctrl.selectedTab = 0;
	ctrl.selectedDate = new Date();
	ctrl.eventSources = [];

	// handlers for courses, speakers, rooms
	ctrl.courses = createItemHandler('course', 'http://localhost:8080/api/courses');
	ctrl.speakers = createItemHandler('speaker', 'http://localhost:8080/api/speakers');
	ctrl.rooms = createItemHandler('room', 'http://localhost:8080/api/rooms', "http://localhost:8080/api/room/");

	ctrl.calendarConfig = {
		lang: 'de'
	};

	function createItemHandler(type, apiCall, apiEventCall) {
		var allItems = [];
		var eventsForItem = [];
		var updateItemsDeferred;

		var updateItems = function() {
			if (updateItemsDeferred) {
				return updateItemsDeferred.promise;
			}

			updateItemsDeferred = $q.defer();
			$http.get(apiCall, {
					responseType: "json"
				})
				.then(function(response) {
					allItems = response.data.map(function(item) {
						return {
							value: item.toLowerCase(),
							display: item
						};
					});
					$q.resolve();
					updateItemsDeferred = null;
				}, function(error) {
					$q.reject(error);
					updateItemsDeferred = null;
				});
			return updateItemsDeferred.promise;
		};

		var querySearch = function(searchText) {
			if (searchText === "") {
				return $q.resolve(allItems);
			} else {
				var searchTextLower = searchText.toLowerCase();
				if (allItems.length === 0) {
					return updateItems().then(function() {
						return $q.resolve(allItems.filter(function(item) {
							return (item.value.indexOf(searchTextLower) !== -1);
						}));
					});
				} else {
					return $q.resolve(allItems.filter(function(item) {
						return (item.value.indexOf(searchTextLower) !== -1);
					}));
				}
			}
		};

		var selectedChange = function(newItem) {
			if (newItem === undefined || newItem.display === "") {
				eventsForItem.splice(0, eventsForItem.length);
				return $q.resolve();
			} else {
				var deferred = $q.defer();
				var url = apiEventCall + btoa(newItem);
				$http.get(url, {
						responseType: "json"
					})
					.then(function(response) {
						eventsForItem.splice(0, eventsForItem.length);
						response.data.forEach(function(entry) {
							eventsForItem.push({
								title: entry.EventName,
								start: entry.StartDate,
								end: entry.EndDate,
								description: "Dozent: " + entry.Speaker + " Raum: " + entry.Location
							});
						});
						deferred.resolve();
						console.log(eventsForItem);
					}, function(error) {
						deferred.reject(error);
					});
				return deferred.promise;
			}
		};

		updateItems();

		return {
			selected: null,
			searchText: '',
			updateItems: updateItems,
			querySearch: querySearch,
			selectedChange: selectedChange
		};
	}
}];