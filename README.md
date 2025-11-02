# RS3 Ultimate Helper v2.0.0 - MEGA UPDATE! 🚀

## 🎉 What's New in Version 2.0.0

### ✨ REAL RS3 Stats Fetching
- **Pulls your ACTUAL stats** from RuneScape servers!
- Uses official RuneMetrics API
- Shows your **total level**, **quests complete**, and **quest points**
- Auto-updates when you enter your username
- No more manual tracking!

### 📝 Quest Database Editor
- **Separate web page** to manage ALL quests
- Add/edit/delete quests easily
- No need to re-upload the plugin constantly
- Export quests.js file with one click
- Import/export quest databases
- Professional quest management system

### 🎮 Full Feature Set
- RS3-themed dark interface
- Username validation (follows RS3 rules)
- Real-time stat fetching
- Local quest tracking
- Progress bars and visualizations
- Export/import progress data

---

## 📥 Download

This package includes TWO tools:

1. **Main Plugin** (index.html) - The quest helper with stats
2. **Quest Editor** (quest-editor.html) - Manage your quest database

---

## 🚀 Installation

### Step 1: Upload Main Plugin

1. Go to: https://github.com/deadlyhour123/rs3-ultimate-helper

2. Upload these files:
   ```
   ✅ index.html
   ✅ styles.css
   ✅ appconfig.json
   ✅ js/
      ├── app.js
      ├── quests.js
      └── stats.js
   ```

3. Wait 2-3 minutes for GitHub Pages

4. Test: https://deadlyhour123.github.io/rs3-ultimate-helper/

### Step 2: Upload Quest Editor (Optional but Recommended)

1. In the same GitHub repo, upload:
   ```
   ✅ quest-editor.html
   ✅ quest-editor.js
   ```

2. Access it at: https://deadlyhour123.github.io/rs3-ultimate-helper/quest-editor.html

---

## 🎯 How to Use

### First Time Setup

1. **Open the main app**
   - You'll be prompted for your RuneScape username

2. **Enter your username** (e.g., "Zezima", "smart person")
   - Must be a valid RS3 username (1-12 characters)
   - Can include spaces, hyphens, underscores

3. **Stats auto-fetch!**
   - App fetches your real RS3 stats
   - Shows total level, quests complete, quest points
   - Displays in the Progress tab

4. **Start tracking quests**
   - Click quests to mark them complete locally
   - Track your progress alongside real stats

---

## 📊 Real Stats Fetching

### How It Works

The app fetches your stats from:

1. **RuneMetrics API** (primary method)
   - Official Jagex API
   - Most reliable
   - No CORS issues

2. **Adventurer's Log** (fallback)
   - Backup method if API fails
   - Uses CORS proxy

### What It Fetches

- ✅ **Total Level** - Your combined skill levels
- ✅ **Quests Complete** - Number of quests you've finished
- ✅ **Quest Points** - Total QP earned

### Username Validation

The app validates usernames using RS3 rules:
- 1-12 characters
- Letters, numbers, spaces, hyphens, underscores
- Cannot start/end with special characters
- Spaces are converted to "+" for URLs

**Examples:**
- ✅ Valid: "Zezima", "smart person", "Loot-from-100", "Player_123"
- ❌ Invalid: "toolongusername123", "-StartsWithDash", "special!chars"

---

## 📝 Quest Editor Usage

### Access the Editor

Go to: `https://deadlyhour123.github.io/rs3-ultimate-helper/quest-editor.html`

### Add a Quest

1. Click "➕ Add New Quest"
2. Fill in the form:
   - **Name:** Quest name (required)
   - **Difficulty:** Novice/Intermediate/Experienced/Master/Grandmaster
   - **Quest Points:** How many QP it gives
   - **Length:** Very Short / Short / Medium / Long / Very Long
   - **Description:** What the quest is about
   - **Requirements:** Comma-separated quest names (e.g., "Dragon Slayer, Demon Slayer")
   - **Skill Requirements:** Format: "Attack:40, Defence:30"
   - **Rewards:** Comma-separated (e.g., "2000 XP, Dragon equipment")
   - **Series:** Quest series name (e.g., "Mahjarrat", "Myreque")

3. Click "💾 Save Quest"

### Edit a Quest

1. Find the quest in the list
2. Click "✏️ Edit"
3. Make your changes
4. Click "💾 Save Quest"

### Delete a Quest

1. Find the quest
2. Click "🗑️ Delete"
3. Confirm deletion

### Export quests.js

1. Click "📥 Export quests.js File"
2. A text box appears with the generated code
3. Click "📋 Copy to Clipboard" OR "💾 Download File"
4. Upload the quests.js file to your GitHub repo in the `js/` folder
5. Your main app now uses the updated quest list!

### Import Quests

1. Click "📤 Import quests.json"
2. Select a JSON file with quest data
3. Quests are loaded into the editor

### Features

- ✅ Add unlimited quests
- ✅ Edit existing quests
- ✅ Delete quests
- ✅ View statistics (total quests, total QP)
- ✅ Export to quests.js file
- ✅ Import from JSON
- ✅ Auto-saves to browser
- ✅ Professional RS3-themed interface

---

## 🎨 Interface

### Main App Sections

**Header:**
- App title and version
- Your username display
- Refresh button to re-fetch stats

**Tabs:**
1. **⚔ Quests** - Browse and mark quests complete
2. **📊 Progress** - View real stats + local tracking
3. **🗺 Pathfinder** - Quest recommendations (coming soon)
4. **⚙ Settings** - Configure app, export/import data

**Quest Tab:**
- Search bar to find quests
- Filters: All / Available / Completed
- Quest list with click-to-complete
- Professional difficulty badges

**Progress Tab:**
- **Real RS3 Stats** (from API)
  - Total Level
  - Quests Complete
  - Quest Points
  - Last updated timestamp
- **Local Tracking** (what you marked)
  - Quests marked complete
  - Quest points tracked
  - Completion percentage
  - Visual progress bar

---

## 🔧 File Structure

```
rs3-ultimate-helper/
│
├── Main Plugin Files:
│   ├── index.html          (Main app)
│   ├── styles.css          (RS3 theme)
│   ├── appconfig.json      (Alt1 config)
│   └── js/
│       ├── app.js          (Main logic)
│       ├── quests.js       (Quest database)
│       └── stats.js        (Stats fetcher)
│
└── Quest Editor Files:
    ├── quest-editor.html   (Editor interface)
    └── quest-editor.js     (Editor logic)
```

---

## 🌐 API Information

### RuneMetrics API

**Endpoint:**
```
https://apps.runescape.com/runemetrics/profile/profile?user={username}&activities=0
```

**Returns:**
- totalskill (total level)
- questscomplete (quests finished)
- And much more!

**Advantages:**
- Official Jagex API
- No CORS issues
- Very reliable
- Fast response

**Limitations:**
- Some profiles are private
- Requires profile to be public

### Adventurer's Log (Fallback)

**Endpoint:**
```
https://secure.runescape.com/m=adventurers-log/profile?searchName={username}
```

**Used when:**
- RuneMetrics API fails
- Profile is private on RuneMetrics
- As a backup method

**Method:**
- Parses HTML from page
- Extracts stats using DOM parsing
- Uses CORS proxy (allorigins.win)

---

## ⚙️ Settings & Features

### Username Management

- **Auto-prompt** on first load
- **Refresh button** (↻) to change username
- **Validates** against RS3 rules
- **Saves** to localStorage
- **Shows** in header and settings

### Data Management

**Export Progress:**
- Includes your username
- Includes all completed quests
- Includes settings
- Filename: `rs3helper-YourName-2025-11-02.json`

**Import Progress:**
- Restore from exported file
- Validates format
- Updates username
- Restores all progress

**Reset Progress:**
- Clears all completed quests
- Keeps username
- Requires double confirmation

### Auto-Save

- Saves after every quest marked
- Saves username changes
- Saves settings changes
- Uses browser localStorage

---

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly buttons
- Works on phones and tablets
- Same features as desktop

---

## 🐛 Troubleshooting

### Stats Won't Load

**Problem:** Stats show "?" or "Loading..."

**Solutions:**
1. Check your username spelling
2. Make sure your profile is public:
   - Go to RuneScape website
   - Account settings → Privacy
   - Enable "Allow others to look up my RuneMetrics profile"
3. Try clicking the refresh button (↻)
4. Check browser console (F12) for errors

### Username Validation Failed

**Problem:** "Invalid RuneScape username format"

**Rules:**
- 1-12 characters only
- Can use: letters, numbers, spaces, hyphens, underscores
- Cannot start/end with special characters
- No other special characters allowed

### Quest Editor Won't Save

**Problem:** Changes don't persist

**Solutions:**
1. Check localStorage is enabled
2. Try a different browser
3. Clear browser cache
4. Use export feature to backup

### GitHub Pages Not Updating

**Problem:** Changes don't show on website

**Solutions:**
1. Wait 3-5 minutes after upload
2. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
3. Clear browser cache
4. Try incognito mode
5. Check GitHub Actions tab for build status

---

## 🎯 Usage Tips

### For Multiple Accounts

1. **Account 1:**
   - Enter username
   - Mark quests
   - Export: `rs3helper-Account1-date.json`

2. **Switch to Account 2:**
   - Click ↻ to change username
   - Reset progress OR import Account 2 data
   - Work on Account 2

3. **Switch back:**
   - Import Account 1 data
   - Continue tracking

### Managing Quests

1. Use Quest Editor to add all RS3 quests (268 total)
2. Export quests.js
3. Upload to GitHub
4. Main app auto-uses new quest list
5. No need to modify main app code!

### Keeping Stats Updated

- Stats update when you enter username
- Click ↻ refresh to re-fetch
- Check "Last updated" timestamp
- Stats are cached in browser

---

## 🚧 Coming Soon

### Planned Features

- ✨ Auto-detect quest completion from game (Alt1)
- ✨ Import full quest list from Wiki
- ✨ Smart quest recommendations
- ✨ Skill level tracking
- ✨ Achievement tracker
- ✨ Daily/weekly task system
- ✨ Quest chains visualization
- ✨ Requirements checker
- ✨ Clue scroll helper
- ✨ Boss kill tracker

---

## 📊 Current Limitations

- Quest database has 20 quests (use editor to add more!)
- RuneMetrics requires public profile
- Stats are cached (not real-time)
- No automatic quest completion detection yet
- Alt1 integration is basic

---

## 🎉 Summary

### You Now Have:

✅ **Real stats fetching** from RS3 servers
✅ **Quest database editor** for easy quest management
✅ **Professional RS3 theme** with dark medieval styling
✅ **Username validation** following RS3 rules
✅ **Progress tracking** both real and local
✅ **Export/import system** for data backup
✅ **Mobile-friendly** responsive design
✅ **Auto-save** functionality
✅ **Two separate tools** that work together

### How to Get Started:

1. Upload files to GitHub
2. Enter your username
3. Watch your real stats load!
4. Use Quest Editor to add all quests
5. Export and upload quests.js
6. Start tracking your quest completion!

---

## 🔗 Links

**Your Repository:**
https://github.com/deadlyhour123/rs3-ultimate-helper

**Main App:**
https://deadlyhour123.github.io/rs3-ultimate-helper/

**Quest Editor:**
https://deadlyhour123.github.io/rs3-ultimate-helper/quest-editor.html

**Alt1 Install Link:**
```
alt1://addapp/https://deadlyhour123.github.io/rs3-ultimate-helper/appconfig.json
```

---

## ⚔️ Happy Questing!

You now have the most advanced RS3 Quest Helper with **real stat fetching** and an **integrated quest editor**!

**For Gielinor!** 🏰🗡️🛡️
