import { Browser, chromium, Page } from 'playwright';
import { config } from 'dotenv';
import fs from "fs"
import { spawn } from 'child_process';
config()

async function joinMeeting() {
    const meetingUrl = "https://meet.google.com/bvo-khok-gec"
    console.log("MEETING_URL =", process.env.MEETING_URL);
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
    // context.grantPermissions(["microphone"])
    page.goto(meetingUrl) 
    await page.waitForTimeout(5000)
    await page.waitForTimeout(5000)
    if (await page.getByText('Join now').count()) {
        await page.getByText('Join now').click()
    }
    else if (await page.getByText('Ask to join').count()) {
        await page.getByText('Ask to join').click()
    }
    await page.waitForTimeout(5000)
    await page.waitForTimeout(5000)
    await page.press("body", "c")
    page.on('console', msg => {
        console.log('BROWSER:', msg.text());
      });
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
function startAudioCapture() {
    const ffmpeg = spawn("ffmpeg", [
        "-f", "pulse",
        "-i", "alsa_output....monitor",
        "-ar", "16000",
        "-ac", "1",
        "-f", "s16le",
        "pipe:1",
    ]);

    return ffmpeg.stdout;
}

async function waitUntilMeetingEnds({ page, browser }: { page: Page, browser: Browser }) {
    await page.waitForEvent("close");
    await browser.close();
}

async function main() {
    const meeting = await joinMeeting();
    const audioStream = startAudioCapture()
    audioStream.on('data', (data) => {
        console.log("AUDIO DATA =", data)
    })
    await waitUntilMeetingEnds(meeting)
}
main().then(console.log).catch(console.error)