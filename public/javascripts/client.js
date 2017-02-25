(function() {

	var app = angular.module("MyApp", []);

	app.controller("MyController", function($scope, $http) {

		// public
		$scope.unlockMessage = _unlockMessage;
		$scope.isValid = _isValid;
		$scope.inputs = [];

		// private
		function _unlockMessage() {

			var input = $scope.inputs.join("");
			$http.get("/unlock/" + input + "?groupId=" + $scope.group)
				.then(function(response) {
					$scope.result = response.data
				}, function(err) {
					console.log(err);
				});
		}

		function _isValid() {
			return $scope.inputs.length === 4 && $scope.group;
		}

	});
})();