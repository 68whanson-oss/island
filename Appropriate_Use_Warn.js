/**
 * Island RPA: Page Blur with Appropriate Use Warning Gate
 *
 * @version 1.13.0
 * @author Island RPA Automation
 */

(function () {
    var BLUR = '2px';

    function applyBlur() {
        document.body.style.filter        = 'blur(' + BLUR + ')';
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect    = 'none';
    }

    function removeBlur() {
        document.body.style.filter        = '';
        document.body.style.pointerEvents = '';
        document.body.style.userSelect    = '';
    }

    function showWarning() {
        island.notifications.dialog({
            notificationId: 'warned-access-page',
            title: 'Appropriate Use Warning',
            message: 'Accessing this site is discouraged during business hours. If you believe this is in error, please submit a Help Desk Ticket.',
            sentiment: 'negative',
            primaryButton: 'Accept',
            secondaryButton: 'Go Back',
        }).then(function (response) {
            if (response && response.trigger === 'secondary-click') {
                window.history.back();
            } else {
                removeBlur();
            }
        });
    }

    function init() {
        applyBlur();
        showWarning();
    }

    // RPA may fire before document.body exists — wait for it if needed.
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
