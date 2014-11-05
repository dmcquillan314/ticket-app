angular.module('signature', [])

.directive('signaturePad', [ '$parse', function($parse) {

    'use strict';

    return {
        restrict: 'C',
        replace: true,
        templateUrl: 'templates/signature.html',
        link: function(scope, element, attrs) {
            var clearButton = element[0].querySelector('[data-action=clear]'),
                canvas = element[0].querySelector('canvas'),
                signaturePad,
                model = null,
                formController = null;

            if(attrs.model) {
                model = $parse(attrs.model);
                model.assign(scope, '' );
            }

            if(attrs.formController) {
                formController = $parse(attrs.formController)(scope);
            }

            // Adjust canvas coordinate space taking into account pixel ratio,
            // to make it look crisp on mobile devices.
            // This also causes canvas to be cleared.
            function resizeCanvas() {
                var ratio =  window.devicePixelRatio || 1;
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext('2d').scale(ratio, ratio);
            }

            window.onresize = resizeCanvas;
            resizeCanvas();

            var options = {
                onEnd: function(event) {
                    void(event);

                    if(model) {
                        model.assign(scope, signaturePad.isEmpty() === false ? signaturePad.toDataURL() : undefined);
                    }

                    if(formController) {
                        formController.$setViewValue(signaturePad.isEmpty() === false ? signaturePad.toDataURL() : undefined);
                    }
                }
            };

            signaturePad = new window.SignaturePad(canvas, options);

            if( clearButton !== null ) {
                clearButton.addEventListener('click', function (event) {
                    void(event);
                    signaturePad.clear();
                });
            }
        }
    };
}]);