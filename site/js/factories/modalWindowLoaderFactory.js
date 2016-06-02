app.factory('modalWindowLoader', function modalWindowLoader(ngDialog) {
    'use strict';
    return {
        modalWindowLoaderOpen: modalWindowLoaderOpen,
        modalWindowLoaderClose: modalWindowLoaderClose
    };
    
    function modalWindowLoaderOpen() {
        return ngDialog.open({ 
            template: '<div>' + '<img src="images/icon_download_data.gif" style="margin-left: 35%"' + '</div>', 
            className: 'ngdialog-theme-default',
            plain: true,
        });
    };
    
    function modalWindowLoaderClose() {
       return ngDialog.closeAll();
    };
});
