angular.module('image', []);

//.factory( 'imageUpload', [ '$q', function($q) {
//    'use strict';
//
//    return {
//        upload: function(ref, image, user, propName) {
//            if (!image.valid) { return; }
//
//            var imagesRef, safename, imageUpload,
//                deferred = $q.defer();
//
//            image.isUploading = true;
//
//            imageUpload = {
//                isUploading: true,
//                data: image.data,
//                thumbnail: image.thumbnail,
//                name: image.filename,
//                author: {
//                    provider: user.provider,
//                    id: user.id
//                }
//            };
//
//            safename = propName || imageUpload.name.replace(/\.|\#|\$|\[|\]|-|\//g, '');
//
//            ref.child(safename).set(imageUpload, function (err) {
//                if (!err) {
//                    imagesRef.child(safename).child('isUploading').remove();
//                    deferred.resolve(angular.copy(imageUpload));
//                    image.isUploading = false;
//                    image.data = undefined;
//                    image.filename = undefined;
//                } else {
//                    deferred.reject({ error: 'There was an error while uploading your image: ' + err});
//                }
//            });
//        }
//    };
//}]);
