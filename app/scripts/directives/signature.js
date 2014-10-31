angular.module('signature', [])

.directive('signaturePad', [ function() {

    'use strict';

    return {
        restrict: 'C',
        replace: true,
        templateUrl: 'templates/signature.html',
        link: function(scope, element) {
            var clearButton = element[0].querySelector('[data-action=clear]'),
                saveButton = element[0].querySelector('[data-action=save]'),
                canvas = element[0].querySelector('canvas'),
                signaturePad;

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

            signaturePad = new window.SignaturePad(canvas);

            clearButton.addEventListener('click', function (event) {
                void(event);
                signaturePad.clear();
            });

            saveButton.addEventListener('click', function (event) {
                void(event);
                if (signaturePad.isEmpty()) {
                    console.log('Please provide signature first.');
                } else {
                    window.open(signaturePad.toDataURL());
                }
            });
        }
    };
}]);