import { chromium } from "playwright";
import * as readline from "readline";
(async () => {
    const browser = await chromium.launchPersistentContext(
        "/tmp/meet-bot-profile", // a fresh profile folder
        {
            headless: false,
            channel: "chrome",
            args: [
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
        }
    );

    const page = await browser.newPage();


    await page.goto("https://accounts.google.com");

    console.log("\n👉 A browser window has opened.");
    console.log("   Log in to your Google account manually.");
    console.log("   Once logged in, come back here and press Enter.\n");

    await new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin });
        rl.question("Press Enter once you're logged in...", () => {
            rl.close();
            resolve(void 0);
        });
    });

    // Save cookies + localStorage to file
    await browser.storageState({ path: "google_session.json" });
    console.log("\n✅ Session saved to google_session.json");
    console.log("   Keep this file safe — it contains your login session.\n");

    await browser.close();
})();

