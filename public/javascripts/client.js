(function() {

	var app = angular.module("MyApp", []);

	app.controller("MyController", function($scope, $http) {

		// public
		$scope.unlockMessage = _unlockMessage;
		$scope.isValid = _isValid;
		$scope.setSecretIndex = _setSecretIndex;
		$scope.getHint = _getHint;
		$scope.inputs = [];

		// private
		function _unlockMessage() {

			var input = $scope.inputs.join("");
			$http.get("/unlock/" + input + "?groupId=" + $scope.group)
				.then(function(response) {
					$scope.result = response.data
					if(response.data.success) {
						$scope.secretNumber = response.data.secretIndex + 1;
					}
				}, function(err) {
					console.log(err);
				});
		}

		function _isValid() {
			return $scope.inputs.length === 4 && $scope.group;
		}

		function _setSecretIndex() {
			$http.get("/groups/" + $scope.group)
				.then(function(response) {
					if(response.data.secretIndex) {
						$scope.secretNumber = response.data.secretIndex + 1;
					}
					else {
						$scope.secretNumber = 1;						
					}
				}, function(err) {
					$scope.secretNumber = 1;
				});
		}

		function _getHint() {
			$http.get("/secrets/" + ($scope.secretNumber -1) + "/hint" )
				.then(function(response) {
					if(response.data.hint) {
						$scope.hint = response.data.hint;
					}
				}, function(err) {
					console.log(err);
				});
		}
		
	});
})();