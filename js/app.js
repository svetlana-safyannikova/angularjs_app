(function () {
    "use strict"
    var dressMeApp = angular.module('dressMeApp', ['ngRoute']);

    dressMeApp.config(['$routeProvider', function($routeProvider){
      $routeProvider
          .when('/',{
            templateUrl:'pages/main.html'
          })
          .when('/set',{
            templateUrl:'pages/set.html'
          })
          .otherwise({
            redirectTo: '/'
          });
    }]);

    function ClothesImgs(maxImgs, mode, imgsData, deferred)
    {
         var idx = 0;

         var scope = scope

         var loadImage = function(index)
         {
             var img = new Image();

             img.onload = function () 
                          {
                              if (this.complete === false) 
                              {
						           deferred.reject();
                              }
                              deferred.resolve(img);
                          };
             img.onerror = function () 
                           {
                               deferred.reject();
                           };

                        img.src =  ((mode == 'linear') ? imgsData[index].thumbUrl:imgsData[index].imageUrl);

             return deferred.promise;
         }
         
         var nOfImgs = maxImgs>imgsData.length ? imgsData.length : maxImgs;
         return {

                      shownItems : imgsData.slice(idx,nOfImgs),
                      prev: function(obj)
                            {
                                 if (idx > 0)
                                 {
                                      loadImage(idx).then(function () {
                                           idx--;
						                   obj.shownItems = imgsData.slice(idx,idx + nOfImgs);
					                  });
                                 }                           
                            },
                      next: function(obj)
                            {
                                 if (idx + nOfImgs < imgsData.length)
                                 {
                                      loadImage(idx + nOfImgs).then(function () {
                                           idx++;
						                   obj.shownItems = imgsData.slice(idx,idx + nOfImgs);
					                  });
                                 }                           
                            }
                }
         
    }

    dressMeApp.directive('clothesGallery', ['$http', '$q', function($http, $q) {

           const shownItemsCount = {'regular':9, 'linear':2};

           let specificCategoryFilter = function (items,category) {
	          let clothesItems = []
              if (category)
              {
	              for (let item of items)
	              {
		              if (item.category === category) 
		              {
		                  clothesItems.push(item);
		              }
	              }
              }
              else
              {
                  clothesItems = items;
              }
	          return clothesItems;
	      };
       return {
           restrict: 'E',
           scope:{},
           link: function(scope, element, attrs) {
                 $http.get('data/clothes.json').success(function(data, status, headers, config) {
                      scope.clothesImgs = new ClothesImgs(shownItemsCount[attrs.mode], attrs.mode, specificCategoryFilter(data,attrs.category), $q.defer());
                      scope.shownItems = scope.clothesImgs.shownItems;
                 });
                scope.prevItem = function()
                {
                    scope.clothesImgs.prev(scope);
                }

                scope.nextItem = function()
                {
                    scope.clothesImgs.next(scope);
                }
           },
           templateUrl: function(elem,attrs) {
               return ((attrs.mode == 'linear') ? 'pages/clothes-linear.html':'pages/clothes.html')
           }
       }
    }]);
})();
