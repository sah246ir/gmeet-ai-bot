import { Browser, chromium, Page } from "playwright";

export async function joinMeeting(meetingUrl: string) {
    console.log("MEETING_URL =", meetingUrl);
    const browser = await chromium.launch({
        channel: "chrome",
        headless: false,
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

    const joinNow = page.getByText('Join now', { exact: true });
    const askToJoin = page.getByText('Ask to join', { exact: true });

    try {
        await Promise.race([
            joinNow.waitFor({ state: "visible", timeout: 15000 }),
            askToJoin.waitFor({ state: "visible", timeout: 15000 }),
        ]);
    } catch {
        throw new Error(
            "Neither 'Join now' nor 'Ask to join' appeared within 15 seconds"
        );
    }
    

    const continueWithoutMedia = page.getByRole("button", {
        name: "Continue without microphone and camera",
    });

    if (await continueWithoutMedia.isVisible().catch(() => false)) {
        console.log("Media permission dialog detected");
        await continueWithoutMedia.click();
        console.log("Media dialog dismissed");
    }

    if (await joinNow.isVisible()) {
        console.log("Found Join now");
        await joinNow.click();
    } else if (await askToJoin.isVisible()) {
        console.log("Found Ask to join");
        await askToJoin.click();
    } else {
        throw new Error(
            "Join button disappeared before it could be clicked"
        );
    }
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