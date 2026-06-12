/**
 * Island RPA: Page Blur with Appropriate Use Warning Gate
 *
 * @version 1.7.0
 * @author Island RPA Automation
 */

$('document').ready(function () {
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
        island.notifications.alert({
            notificationId: 'warned-access-page',
            title: 'Appropriate Use Warning',
            message: 'Accessing this site is discouraged during business hours. If you believe this is in error, please submit a Help Desk Ticket.',
            sentiment: 'warning',
            primaryButton: 'Accept',
            secondaryButton: 'Go Back',
        });
    }

    applyBlur();
    showWarning();
});
