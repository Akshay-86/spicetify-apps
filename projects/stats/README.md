# Spicetify Stats (Rate-Limit Bypass Version)

This is a modified version of the Spicetify Stats app that includes a built-in rate-limit bypass system. If you are seeing `429: Too Many Requests` or connection errors, this version allows you to use your own Spotify API token to ensure your stats always load.

---

## 🚀 Quick Installation

### **Windows (PowerShell)**
Run this command in your terminal:
```powershell
iwr -useb https://raw.githubusercontent.com/Akshay-86/spicetify-apps/main/projects/stats/install.ps1 | iex
```

### **Linux / macOS**
Run this command in your terminal:
```bash
curl -fsSL https://raw.githubusercontent.com/Akshay-86/spicetify-apps/main/projects/stats/install.sh | bash
```

---

## 🛠️ How to fix "Rate Limited" (429 Errors)

If Spotify blocks the app's requests, a **"Login with Spotify"** button will appear automatically.

1.  Click the **Login with Spotify** button.
2.  A browser window will open. Log in and approve the app.
3.  You will be redirected to a callback page (e.g., `huangdarren1106.github.io/callback`).
4.  **Copy the full URL** from your browser's address bar.
5.  Paste that URL into the box in Spotify and click **Save & Refresh**.

Your stats will now load using a separate API quota! (Note: Tokens expire every 1 hour).

---

## 📜 Credits

This project is a combination of community efforts and AI-assisted stabilization:

1.  **Original App**: [Spicetify Stats](https://github.com/harbassan/spicetify-apps) by **harbassan**.
2.  **Bypass Solution**: The OAuth bypass logic and redirect implementation are based on the work by [huangdarren1106](https://github.com/huangdarren1106/huangdarren1106.github.io).
3.  **AI Development Assistant**: Refactored, stabilized, and cross-platform compatible version created by **Gemini CLI**, acting on user prompts to resolve critical crashes (`React Error #31`) and initialization deadlocks.

### **Modifications in this version:**
- Replaced all unstable Spicetify internal React components with standard HTML/CSS to prevent `React Error #31` crashes.
- Integrated a smooth loading spinner for tab switching.
- Refactored initialization to prevent deadlocks and ensure consistent booting.
- Added a simplified "Instant Login" flow for rate-limited users.
- Universal "one-liner" installation scripts for Windows and Linux.

---

## ⚖️ License
MIT License. See the original repository for more details.
