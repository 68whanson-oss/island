/**
 * Island RPA: Page Blur with Appropriate Use Warning Gate
 *
 * Blurs the page and presents the Warned Access Page notification via
 * island.notifications.alert(). The page stays blurred until the user
 * clicks the primary action button.
 *
 * @version 1.5.0
 * @author Island RPA Automation
 */

$(document).ready(function () {
    const BLUR_INTENSITY = '10px';

    function applyBlur() {
        document.body.style.filter        = `blur(${BLUR_INTENSITY})`;
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
            onPrimaryAction: function () {
                removeBlur();
            },
            onSecondaryAction: function () {
                showWarning();
            },
            onDismiss: function () {
                showWarning();
            }
        });
    }

    applyBlur();
    showWarning();
});
