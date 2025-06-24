
<div align="center">
  <img src="https://github.com/Karthik-HR0/JavaScript-URL-Scanner/blob/main/images/icon128.png" alt="JavaScript URL Scanner" /> 
</div>  

<div align="center">  

<p>  
  
  **_A Chrome extension that scans and collects JavaScript (`.js`) URLs from webpages with real-time updates and customizable settings!_**  


</p>  

<div>
    
  <a href="#features">`features`</a>
  <a href="#installation">`installation`</a>
  <a href="#setup">`setup`</a>
  <a href="#usage">`usage`</a>
  <a href="#license">`license`</a>
  
</div>
</div>  

---

## **`Features`**  

- [x] Automatically scans webpages for JavaScript (`.js`) URLs  
- [x] Displays URL count on the extension badge  
- [x] Provides transparent blue, borderless copy buttons for individual URLs  
- [x] Includes a "Copy All URLs" button for quick copying  
- [x] Supports auto-refresh scanning with customizable intervals (1–60 seconds)  
- [x] Allows URL filtering using regex patterns (e.g., `^https:\/\/cdn\.`)  
- [x] Offers customizable badge colors (blue, green, red)  
- [x] Sends notifications for new URLs (optional)  
- [x] Clears cached URLs with a single click  
- [x] Lightweight, privacy-focused, with no data collection or tracking  

---

## **`Installation`**  

#### ⇨ **From Chrome Web Store**  
  **_`(Coming soon)`_**  

#### ⇨ **Manual Installation**  

1. **Download the Extension**  
   ```bash
   # Clone the repository  
   git clone https://github.com/Karthik-HR0/JavaScript-URL-Scanner.git
   ```

---

## **`Setup`**  

#### ⇨ **Loading in Chrome**  

1. Open Chrome and navigate to `chrome://extensions/`  
2. Enable "Developer mode" in the top-right corner  
3. Click "Load unpacked"  
4. Select the `JavaScript-URL-Scanner` directory containing the extension files  
5. Pin the extension to the Chrome toolbar (optional)  

#### ⇨ **Verify Installation**  
- Look for the JavaScript URL Scanner icon in your Chrome toolbar  
- Click the icon to open the popup and see the settings button  
- Open the settings page to configure auto-refresh, scan intervals, and more  

---

## **`Usage`**  

#### ⇨ **Collecting JavaScript URLs**  
- Click the JavaScript URL Scanner extension icon in the toolbar to open the popup  
- The extension automatically scans the current webpage for `.js` URLs and displays them  
- Use the transparent blue copy buttons to copy individual URLs or click "Copy All URLs" to copy all links  
- The badge on the extension icon shows the number of detected URLs  

#### ⇨ **Configuring Settings**  
- Click the settings button in the popup to open the settings page  
- Enable **Auto-Refresh** to periodically rescan the page (set interval via the slider, e.g., 5 seconds)  
- Use **Custom URL Filter (Regex)** to filter URLs (e.g., `^https:\/\/cdn\.` for CDN scripts)  
- Customize the **Badge Color** or enable **Notifications** for new URLs  
- Click **Clear URL Cache** to reset stored URLs and badge counts  

#### ⇨ **Example**  
- Visit a webpage with `<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js">`  
- Open the popup to see the URL listed with a copy button  
- Enable auto-refresh (5-second interval) and add a regex filter (`^https:\/\/cdn\.`)  
- The popup and badge update every 5 seconds, showing only CDN URLs  

---

<img src="https://github.com/Karthik-HR0/JavaScript-URL-Scanner/blob/main/images/num-of-urls.png" alt="shows number of urls in the icon bar" width="30%">
Badge showing URL count

---

<img src="https://github.com/Karthik-HR0/JavaScript-URL-Scanner/blob/main/images/setting.png" alt="settings" width="30%">
Settings page

---

  <img src="https://github.com/Karthik-HR0/JavaScript-URL-Scanner/blob/main/images/auto-refresh.png" alt="auto scan " width="30%">
Auto-refresh in action

---

## **`License`**  

This project is licensed under the Mozilla Public License Version 2.0 - see the [`LICENSE`](https://github.com/Karthik-HR0/JavaScript-URL-Scanner/blob/main/LICENSE) file for details.


