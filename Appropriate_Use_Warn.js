/**
 * Island RPA: Page Blur with Appropriate Use Warning Gate
 *
 * Blurs the page and presents the Warned Access Page dialog via
 * sdk.notifications.dialog(). The page stays blurred until the user
 * explicitly clicks an action button (not just dismisses).
 *
 * @version 1.4.0
 * @author Island RPA Automation
 */

export default async function runRpa(rpaSdk, context) {
    const { sdk } = rpaSdk;

    const BLUR_INTENSITY = '10px';
    const LOG_PREFIX = '[Island Page Blur RPA]';

    function log(message, level = 'info') {
        const entry = `${LOG_PREFIX} [${new Date().toISOString()}] ${message}`;
        if (level === 'error') console.error(entry);
        else if (level === 'warn')  console.warn(entry);
        else console.log(entry);
    }

    function applyBlur() {
        document.body.style.filter    = `blur(${BLUR_INTENSITY})`;
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect    = 'none';
        log('Page blur applied.');
    }

    function removeBlur() {
        document.body.style.filter        = '';
        document.body.style.pointerEvents = '';
        document.body.style.userSelect    = '';
        log('Page blur removed.');
    }

    await sdk.dom.waitForDocumentInteractive();

    applyBlur();

    // Build the warning message content, mirroring the "Warned Access Page"
    // template fields configured in the Island admin console.
    const firstName = context.user?.firstName ?? '';
    const lastName  = context.user?.lastName  ?? '';
    const url       = context.url             ?? window.location.href;

    const dialogParams = {
        title: 'Appropriate Use Warning',
        message: `${firstName} ${lastName} — accessing this site is discouraged during business hours.\n\nURL: ${url}\n\nIf you believe this is in error, please submit a Help Desk Ticket.`,
        buttons: [
            { label: 'Accept',  action: 'accept'  },
            { label: 'Go Back', action: 'go_back' }
        ],
        sentiment: 'warning'
    };

    // Loop until the user explicitly clicks a button — dismiss (X) re-shows the dialog.
    let acknowledged = false;
    while (!acknowledged) {
        log('Displaying Appropriate Use Warning dialog.');

        const response = await sdk.notifications.dialog(context, dialogParams);

        if (response?.action) {
            log(`User responded with action: ${response.action}`);

            await sdk.audit(context, context.ruleId, {
                message: `User acknowledged Appropriate Use Warning with action: ${response.action}`,
                verdict: 'allow',
                options: { source: 'rpa-appropriate-use-warn', action: response.action }
            });

            acknowledged = true;
        } else {
            log('Dialog dismissed without action — re-displaying.', 'warn');
        }
    }

    removeBlur();
}
