angular.module('image')

.directive('imageUpload', [ '$parse', function($parse) {

    'use strict';

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var fileReader = new FileReader();
            var fileFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

            var imageObject = { valid: false };

            var imageModel = null;

            if(attrs.imageUpload) {
                imageModel = $parse(attrs.imageUpload);
            }

            if(imageModel) {
                imageObject = angular.extend( imageModel(scope), imageObject);

//                imageModel.assign(scope, imageObject);

                fileReader.onload = function (fileReaderEvent) {
                    scope.$apply(function () {
                        imageObject.data = fileReaderEvent.target.result;
                    });
                };

                var loadImage = function() {
                    if (element[0].files.length === 0) {
                        return;
                    }

                    var file = element[0].files[0];

                    imageObject.filename = file.name;

                    if (!fileFilter.test(file.type)) {
                        imageObject.error = 'You must select a valid image!';
                        imageObject.valid = false;
                        return;
                    }else{
                        imageObject.error = '';
                        imageObject.valid = true;
                    }

                    fileReader.readAsDataURL(file);
                };

                element.on('change', loadImage);
            }
        }
    };
}]);