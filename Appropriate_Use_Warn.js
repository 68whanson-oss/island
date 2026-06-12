/**
 * Island RPA: Page Blur with Toast Message Gate
 *
 * Purpose: Blur page content and require user acknowledgment via Island Toast
 * before allowing access to the page content.
 *
 * Toast Message: "Warned Access Page"
 *
 * @version 1.3.0
 * @author Island RPA Automation
 */

export default async function runRpa(rpaSdk, context) {
    const { sdk } = rpaSdk;

    const BLUR_INTENSITY = '10px';
    const TOAST_TEMPLATE = 'Warned Access Page';
    const LOG_PREFIX = '[Island Page Blur RPA]';

    function log(message, level = 'info') {
        const entry = `${LOG_PREFIX} [${new Date().toISOString()}] ${message}`;
        if (level === 'error') console.error(entry);
        else if (level === 'warn') console.warn(entry);
        else console.log(entry);
    }

    function applyBlur() {
        document.body.style.filter = `blur(${BLUR_INTENSITY})`;
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        log('Page blur applied.');
    }

    function removeBlur() {
        document.body.style.filter = '';
        document.body.style.pointerEvents = '';
        document.body.style.userSelect = '';
        log('Page blur removed.');
    }

    // Wait for the page to be ready before acting
    await sdk.dom.waitForDocumentInteractive();

    applyBlur();

    // Loop until the user explicitly clicks an action button in the toast.
    // Dismissing the toast (X) re-displays it — the page stays blurred.
    let acknowledged = false;
    while (!acknowledged) {
        log(`Displaying Island toast: "${TOAST_TEMPLATE}"`);

        const response = await sdk.notifications.dialog(context, {
            messageTemplate: TOAST_TEMPLATE
        });

        if (response && response.action) {
            log(`User acknowledged with action: ${JSON.stringify(response.action)}`);

            await sdk.audit(context, context.ruleId, {
                message: `User acknowledged "${TOAST_TEMPLATE}" with action: ${JSON.stringify(response.action)}`,
                verdict: 'allow',
                options: { source: 'rpa-page-blur' }
            });

            acknowledged = true;
        } else {
            log('Toast dismissed without action — re-displaying.', 'warn');
        }
    }

    removeBlur();
}
