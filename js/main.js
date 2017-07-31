function unique(arr, field) {
    var uniqueArr = [];
    for (obj in arr) {
        var model = arr[obj].model;
        if (uniqueArr.indexOf(model[field]) === -1) {
            uniqueArr.push(model[field]);
        }
    }
    return uniqueArr;
};

function separate(arr, field) {
    var separatedList = {};
    for (var index in arr) {
        if (separatedList[arr[index].model[field]] == null) {
            separatedList[arr[index].model[field]] = [];
        }

        separatedList[arr[index].model[field]].push(arr[index]);
    }
    return separatedList;
}

function indexFromId(id) {
    var index = null;
    if (id != null) {
        index = id.match(/option-[0-9]+/);
        if (index != null) {
            index = index[0];
            index = index.split("-");
            index = index[1];
            index = +index;
        }
    }
    return index;
}

(function() {
    var app = angular.module('REApp', ['ui.bootstrap', 'ngSanitize']);
    app.controller('REAppController', function($scope, REService) {
    	$scope.lastWord = 'dummy';
    	$scope.inActionBlock = false;
    	$scope.newLineJustAdded = false;
    	$scope.level = 0;
        $scope.RCFlag = false;
        $scope.rules = [];
        $scope.ruleSaveEnable = false;
        $scope.saveOnUserValue = false;
        $scope.ruleinarr = [true, false];
        $scope.completeWord = [];
        $scope.elements = [];
        $scope.ruleDefs = [];
        $scope.rulename = '';
        //$scope.nextwords = [{"refType":"TransactionType","value":"must be equal to","category":"Value"},{"refType":"TransactionType","value":"must not be equal to","category":"Value"},{"refType":"TransactionType","value":"must be same as","category":"Value"},{"refType":"TransactionType","value":"must not be same as","category":"Value"},{"refType":"TransactionType","value":"is a number","category":"Type"},{"refType":"TransactionType","value":"is a date","category":"Type"},{"refType":"TransactionType","value":"is mandatory","category":"Others"}];
        $scope.nextwords = [];
        $scope.selected = "";
        $scope.dynamicPopover = {
            content: 'Start typing first few letters of the name of element.',
            title: 'Dont show any tips'
        };
        $scope.customstyle = {
            "width": "400px"
        };
        $scope.init = function() {
            REService.getElements().success(function(data) {
            	if(data.length === 1) {
            		console.dir(data);
            		// If the suggestion is just one, select it automatically.
            		$scope.onSelectNextWords({'value': data[0].elementName, 'tokenType': data[0].tokenType}, null, null);
            	}
            	else {
                	$scope.rules = data;
                	$scope.elements = data;
                	console.log('Elements', data);
            	}
            });
        };
        $scope.init();
        $scope.openPP = function() {
            $scope.RCFlag = true;
        };
        $scope.closePP = function() {
            $scope.RCFlag = false;
            $scope.completeWord = [];
            $scope.customstyle = {
                "width": "400px"
            };
            $scope.ruleinarr = [true, false];
            $scope.ruleSaveEnable = false;
            $scope.saveOnUserValue = false;
            $scope.rulename = '';
            $scope.selected = '';
            $scope.dynamicPopover = {
                content: 'Start typing first few letters of the name of element.',
                title: 'Dont show any tips'
            };
        };
        $scope.startsWith = function(state, viewValue) {
            return state.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
        };

        $scope.onSelectElement = function($item, $model, $label) {
            console.log("onSelectElement : $item -> " + $item);
            console.log("onSelectElement : $label -> " + $label);
            console.log("onSelectElement : $model -> " + $model);
            $scope.appendToRule($label, $item.tokenType);
            $scope.ruleinarr = [false, false];
            $scope.nextwords = [];
            $scope.elements = [];
            REService.getNextWord($label, $scope.lastWord).success(function(data) {
        		// If the suggestion is just one, select it automatically.
            	if(data.length === 1) {
            		$scope.lastWord = $label;
            		$scope.onSelectElement(null, null, data[0].value);
            	}
            	else if (data.length > 1) {
                    $scope.nextwords = data;
                    $scope.elements = data;
                    $scope.ruleinarr = [false, true];
                    console.log('Elements', data);
                    $scope.lastWord = $label;
                } else {
                    $scope.ruleSaveEnable = true;
                }
            });
        }
        $scope.onSelectNextWords = function($item, $model, $label) {
            $scope.appendToRule($item.value, $item.tokenType);
            if($item.tokenType === 'CONSTANT') {
            	$item.value = 'CONSTANT';
            }
            if($item.value === ';') {
            	$item.value = 'SEMI_COLON';
            }
            else if($item.value === '%') {
            	$item.value = 'MOD';
            }
            
            if($scope.lastWord === ';') {
            	$scope.lastWord = 'SEMI_COLON';
            }
            else if($scope.lastWord === '%') {
            	$scope.lastWord = 'MOD';
            }
            $scope.ruleinarr = [false, false];
            $scope.nextwords = [];
            $scope.elements = [];
            REService.getNextWord($item.value, $scope.lastWord).success(function(data) {
                if (data.length > 0) {
                	var filteredData = [];
                    data.forEach(function(dataSet, index){
                    	if(dataSet.category === "MDDUserValue" && dataSet.value === "user_entered") {
                    		$scope.saveOnUserValue = true;
                    		$scope.dynamicPopover.content =
                    			'Select an element or press Enter to finish.';
                    	} else {
                    		filteredData.push(dataSet);
                    	}
                    });
                    // Make sure the filtered suggestion is auto-selected
                    // if we have only one..
                    if(filteredData.length === 1) {
                    	$scope.lastWord = $item.value;
                    	$scope.onSelectNextWords(filteredData[0], null, null);                    	
                    }
                    else {
	                    $scope.nextwords = filteredData;
	                    $scope.elements = filteredData;
	                    $scope.ruleinarr = [false, true];
	                    $scope.lastWord = $item.value;
                    }
                } else {
                    $scope.ruleSaveEnable = true;
                }
            });
        };

        $scope.showDropDown = function(event) {
            angular.element(event.target).trigger("change");
        }
        
        $scope.appendToRule = function(value, type) {
        	if(value === '{' ) {
        		$scope.inActionBlock = true;
        		$scope.level += 1;
        	}
        	if(value === '}') {
        		$scope.inActionBlock = false;
        		$scope.level -= 1;
        	}
        	var formatted = null;
        	if(type === 'BRACES') {
        		formatted = ((value == '{') ? '<br/>' : '')  + '<span class="' + type + '">' + value + '</span>' + '<br/>';
        		$scope.newLineJustAdded = true;
        	}
        	else if(value === ';'){
        		formatted = '<span class="' + type + '">' + value + '</span><br/>';
        		$scope.newLineJustAdded = true;
        	}
        	else {
        		formatted = '<span class="' + type + '">' + value + '</span>';
        		if($scope.newLineJustAdded && $scope.level > 0) {
        			formatted = $scope.getNSpaces($scope.level * 4) + formatted;
        			$scope.newLineJustAdded = false;
        		}
        	}
        	
        	$scope.completeWord.push(formatted);
        	
        }
        
        $scope.getNSpaces = function(n) {
        	var spaces = '';
        	for(var i = 0; i < n; ++i) {
        		spaces += '&nbsp;';
        	}
        	return spaces;
        }
        
        $scope.customTextInput = function(e) {
        	if (e.keyCode == 13 && $scope.selected.length > 0) {
        		
        		$scope.onSelectNextWords({"value": $scope.selected, "tokenType": "CONSTANT"}, null, null);
        		$scope.selected = "";
        		//$scope.lastWord = "CONSTANT";
                                 
                //$scope.ruleinarr = [false, false];
                //$scope.saveOnUserValue = false;
                //$scope.ruleSaveEnable = true;
                //$scope.ruleinarr = [false, true]; // by gnanavad - to get suggestions even after user input.

        	}
        }

        $scope.keyup = function(e) {
            if (e.keyCode == 32) {
                var lblObj = angular.element(document.getElementById('lblCompleteWord'));
                $scope.appendToRule($scope.selected, "USER_ENTERED_KEY_UP");
                $scope.selected = "";

                $scope.$watch($scope.completeWord, function() {
                    $scope.customstyle.width = (600 - lblObj[0].offsetWidth) + 'px';
                });
            }
        };
        $scope.saveRule = function(rulename) {
            console.log('$scope.rulename', rulename);
            if($scope.saveOnUserValue){
            	$scope.appendToRule($scope.selected, "USER_ENTERED_SAVE_RULE");
            	$scope.selected = "";
            }
            $scope.ruleDefs.push({
                'def': $scope.completeWord,
                'name': rulename
            });
            $scope.closePP();
        }
    });
    app.filter('sanitize', function ($sce) {
        return function (value) {
            return $sce.trustAsHtml(value);
        };
    });
    app.filter('highlighter', function() {
        return function(input) {
            console.log("getting input " + input);
            return input;
        }
    });
    app.factory('REService', function($http) {
        return {
            getElements: function() {
                return $http.get('/data/elements');
            },
            getNextWord: function(word, lastWord) {
                console.log('API : ', '/data/nextwords/' + word + '/' + lastWord);
                return $http.get('/data/nextwords/' + word + '/' + lastWord);
            }
        }
    });
    app.filter('unique', function() {
        return unique;
    });
    app.filter('fieldMatch', function() {
        return function(arr, matchKey, matchValue) {
            var filtered = [];
            for (var index in arr) {
                if (arr[index].model[matchKey] === matchValue) {
                    filtered.push(arr[index]);
                }
            }
            return filtered;
        };
    });
    app.directive('dropdownList', function($timeout) {
        return {
            restrict: 'E',
            templateUrl: "dropdownList.html",
            transclude: true,
            scope: true,
            link: function(scope, element, attrs) {
                scope.indexFromId = indexFromId;
            }
        }
    });
    app.directive('typeaheadFocus', function($timeout) {
        return {
            require: 'ngModel',
            scope: {
                trigger: '=ngShow'
            },
            link: function(scope, element, attr, ngModel) {
                scope.$watch('trigger', function(value) {
                	//console.log('trigger fired with value : ' + value);
                    if (value === true) {
                        $timeout(function() {
                            element[0].focus();
                        }, 0);
                    }
                });

                //trigger the popup on 'click' because 'focus'
                //is also triggered after the item selection
                element.bind('focus', function() {
                    $timeout(function() {
                    	//console.log('focus is also fired with ngModel.$viewValue : ' + ngModel.$viewValue);
                        if (scope.trigger) {
                            var viewValue = ngModel.$viewValue;
                            ngModel.$setViewValue(null);
                            ngModel.$setViewValue(viewValue || "");
                        }
                    }, 50);
                });
            }
        };
    });
    app.filter('indexFromId', function() {
        return indexFromId;
    });
})();
