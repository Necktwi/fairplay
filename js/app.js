(function () {
	var app = angular.module("portal", []);
	app.controller('RemoteController', ['$http', '$scope', '$timeout', function ($http, $scope, $timeout) {
			$scope.streamserver = "fairplay.ferryfair.com";
			var datareq = function () {
				$http.get('/model.json').success(function (data) {
					$scope.systems = data;
					$scope.$apply();
					$timeout(function () {
						fairplay.init();
					});
				});
			}
			$scope.$watchCollection('systems.UbuntuVM', function (newVal, oldVal) {
				console.log(newVal);
			});
			datareq();
			setInterval(datareq, 1000000);
			$scope.camStates = ["CAM_OFF", "CAM_RECORD", "CAM_STREAM",
				"CAM_STREAM_N_RECORD"];
			$scope.setCamState = function (sysname, camname) {
				var msg = {}
				msg[sysname] = {};
				msg[sysname]["cameras"] = {};
				msg[sysname]["cameras"][camname] = {};
				msg[sysname]["cameras"][camname]["newState"] =
						$scope.systems[sysname].cameras[camname].newState;
				$http.post('', msg);
			};
		}]);
	app.filter('trusted', ['$sce', function ($sce) {
			return function (url) {
				return $sce.trustAsResourceUrl(url);
			};
		}]);
})();
