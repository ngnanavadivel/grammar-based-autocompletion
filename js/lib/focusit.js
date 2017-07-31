(function(){
	angular.module('REApp')
	.directive('focusIt',function($timeout){
		return{
			scope:{trigger:'=focusIt'},
			link:function(scope,element){
				scope.$watch('trigger',function(value){
					if(value===true){
						$timeout(function(){
							element[0].focus();
						},500)
					}
				});
			}
		}
	})
})();