import { Browser, chromium, Page } from "playwright";

async function dismissMediaDialog(page: Page) {
    const button = page.getByRole("button", {
        name: "Continue without microphone and camera",
    });

    try {
        await button.waitFor({
            state: "visible",
            timeout: 3000,
        });

        console.log("Media dialog detected");
        await button.click();
        console.log("Media dialog dismissed");

        return true;
    } catch {
        return false;
    }
}

export async function joinMeeting(meetingUrl: string) {
    console.log("MEETING_URL =", meetingUrl);
    const browser = await chromium.launch({
        channel: "chrome",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--use-fake-ui-for-media-stream", // Auto-grant mic/camera permissions
            "--use-fake-device-for-media-stream", // Use fake media devices (no real cam/mic needed)
            "--disable-blink-features=AutomationControlled", // Hide automation
        ],

    })
    const context = await browser.newContext({
        // Spoof a real browser fingerprint
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        permissions: [],
        // No stored cookies/session = anonymous
        storageState: "google_session.json",
    });

    const page = await context.newPage()

    await page.goto(meetingUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    await dismissMediaDialog(page);

    const button = page.getByRole("button", {
        name: /^(Join now|Ask to join)$/i,
    });
    
    await button.waitFor({
        state: "visible",
        timeout: 15000,
    });
    
    console.log(`Found ${await button.innerText()}`);

    try {
        await button.click({ timeout: 10_000 });
        console.log("JOIN BUTTON CLICK COMPLETED");
    } catch (error) {
        console.error("JOIN BUTTON CLICK FAILED:", error);
        throw error;
    }
    await dismissMediaDialog(page);

    console.log("Checking Meet state after click...");

    await page.waitForTimeout(1000);

    console.log(
        "Join button still visible:",
        await button.isVisible().catch(() => false)
    );

    console.log(
        "Body after click:",
        (await page.locator("body").innerText().catch(() => "")).slice(0, 2000)
    );
    // await page.evaluate(()=>{
    //     const seen = new Set()
    //     const observer = new MutationObserver(()=>{
    //         const captionNodes = document.querySelector('[aria-label="Captions"]')?.children
    //         Array.from(captionNodes ?? []).forEach(node=>{
    //             const caption = node.children[1].textContent
    //             const name = node.children[0].children[1].textContent
    //             console.log(name,caption)
    //         })
    //     })
    //     observer.observe(document.querySelector('[aria-label="Captions"]')!, {
    //         childList: true,
    //         subtree: true,
    //     })
    // })
    return {
        browser,
        context,
        page,
    };
}
// After clicking "Join now"/"Ask to join", Google Meet may hold the bot in a
// waiting room until the host lets it in. Poll for the waiting-room copy to
// disappear before treating the bot as actually in the call - for "Join now"
// (no approval needed) this resolves on the very first check.
export async function waitForMeetingEntry(page: Page, timeoutMs = 5 * 60 * 1000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        if (page.isClosed()) return;

        const bodyText = await page.locator("body").innerText().catch(() => "");
        const stillWaiting =
            bodyText.includes("Asking to be let in") ||
            bodyText.includes("You'll join the call when someone lets you in") ||
            bodyText.includes("Waiting for the host to let you in") ||
            bodyText.includes("Waiting for someone to let you in");
            bodyText.includes("Please wait until a meeting host brings you into the call");

        if (!stillWaiting) return;

        await page.waitForTimeout(2000);
    }

    throw new Error("Timed out waiting to be admitted to the meeting");
}

export async function waitUntilMeetingEnds({
    page,
    browser,
}: {
    page: Page;
    browser: Browser;
}) {
    console.log("Waiting for meeting to end...");

    while (true) {
        if (page.isClosed()) {
            console.log("Page closed");
            break;
        }

        const bodyText = await page.locator("body").innerText().catch(() => "");

        const removedMessage = await page
            .locator("h1")
            .filter({ hasText: "You've been removed from the meeting" })
            .isVisible()
            .catch(() => false);

        if (
            bodyText.includes("You left the meeting") ||
            bodyText.includes("The meeting has ended") ||
            removedMessage
        ) {
            console.log("Meeting ended/removed");
            break;
        }

        await page.waitForTimeout(5000);
    }

    await browser.close();
}