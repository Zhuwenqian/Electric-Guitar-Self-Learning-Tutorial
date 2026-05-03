# 🎸 Electric Guitar Self-Learning Tutorial - Release Notes

[![Version](https://img.shields.io/badge/Version-v1.8.3-blue)](https://github.com/your-repo/guitar-tutorial)
[![AlphaTab](https://img.shields.io/badge/AlphaTab-v1.8.2-orange)](https://github.com/CoderLine/alphaTab)
[![License](https://img.shields.io/badge/License-GPL%20v3-blue)](./LICENSE)

---

## 📢 Latest Release

### **v1.8.3** (2026-05-02)

**🎯 Major Update**: Fixed Twinkle (Little Star) AlphaTex Format Error

#### 🐛 Bug Fix

##### Twinkle Twinkle Little Star - AlphaTex Format Correction

**Error Message**:
```
Error AT208(4,10)->(4,10): Note string is out of range. Available range: 1-6
```

**Root Cause**: The score data was written in `string.fret` format, but AlphaTex requires `fret.string` format.

**AlphaTex Format Specification** (from app.js line 100):
```
Note format: fret.string (fret first, string number second)
  Example: 0.6 = 6th string open, 3.1 = 1st string 3rd fret
```

**Standard TAB Reference** (user-provided):

| Bar | Notes (TAB) | AlphaTex | Lyrics |
|-----|-------------|----------|--------|
| Bar 1 | 5th string 3rd fret ×2, 3rd string open ×2, 3rd string 2nd fret ×2, 3rd string open (quarter) | `:8 3.5 3.5 0.3 0.3 2.3 2.3 :4 0.3` | Twinkle twinkle |
| Bar 2 | 4th string 3rd fret ×2, 4th string 2nd fret ×2, 4th string open ×2, 5th string 3rd fret (quarter) | `:8 3.4 3.4 2.4 2.4 0.4 0.4 :4 3.5` | little star |
| Bar 3 | 3rd string open ×2, 4th string 3rd fret ×2, 4th string 2nd fret ×2, 4th string open (quarter) | `:8 0.3 0.3 3.4 3.4 2.4 2.4 :4 0.4` | How I wonder |
| Bar 4 | 3rd string open ×2, 4th string 3rd fret ×2, 4th string 2nd fret ×2, 4th string open (quarter) | `:8 0.3 0.3 3.4 3.4 2.4 2.4 :4 0.4` | what you are |
| Bar 5 | 5th string 3rd fret ×2, 3rd string open ×2, 3rd string 2nd fret ×2, 3rd string open (quarter) | `:8 3.5 3.5 0.3 0.3 2.3 2.3 :4 0.3` | Up above the |
| Bar 6 | 4th string 3rd fret ×2, 4th string 2nd fret ×2, 4th string open ×2, 5th string 3rd fret (quarter) | `:8 3.4 3.4 2.4 2.4 0.4 0.4 :4 3.5` | world so high |

**Note Conversion Table**:

| TAB Description | Fret | String | AlphaTex | Note |
|-----------------|------|--------|----------|------|
| 5th string 3rd fret | 3 | 5 | `3.5` | A string 3rd fret |
| 3rd string open | 0 | 3 | `0.3` | G string open |
| 3rd string 2nd fret | 2 | 3 | `2.3` | G string 2nd fret |
| 4th string 3rd fret | 3 | 4 | `3.4` | D string 3rd fret |
| 4th string 2nd fret | 2 | 4 | `2.4` | D string 2nd fret |
| 4th string open | 0 | 4 | `0.4` | D string open |

**Bar Structure** (each bar = 4 beats = 8 eighth notes):

| Bar | Note Sequence | Beat Calculation |
|-----|--------------|------------------|
| Bar 1 | 3.5 3.5 0.3 0.3 2.3 2.3 0.3 | 6×eighth + 1×quarter = 3+1 = 4 beats |
| Bar 2 | 3.4 3.4 2.4 2.4 0.4 0.4 3.5 | 6×eighth + 1×quarter = 3+1 = 4 beats |
| Bar 3 | 0.3 0.3 3.4 3.4 2.4 2.4 0.4 | 6×eighth + 1×quarter = 3+1 = 4 beats |
| Bar 4 | 0.3 0.3 3.4 3.4 2.4 2.4 0.4 | 6×eighth + 1×quarter = 3+1 = 4 beats |
| Bar 5 | 3.5 3.5 0.3 0.3 2.3 2.3 0.3 | 6×eighth + 1×quarter = 3+1 = 4 beats |
| Bar 6 | 3.4 3.4 2.4 2.4 0.4 0.4 3.5 | 6×eighth + 1×quarter = 3+1 = 4 beats |

**Key Insight**: In AlphaTex, each line = 1 bar. Bar lines are automatically inserted between lines. No manual `|` symbols needed (v1.8.x handles this automatically).

**Affected Files**:
| File | Action | Description |
|------|--------|-------------|
| [js/app.js](js/app.js) | Modified | Rewrote twinkle AlphaTex data based on standard TAB score |

---

## 📜 Version History

### **v1.8.2** (2026-05-02)

**🎯 Major Update**: Fixed Twinkle (Little Star) Score Data

#### 🎵 Score Correction

##### Twinkle Twinkle Little Star TAB Correction

**Modified File**: [js/app.js](js/app.js)

**Correction**: Updated the AlphaTex data for Twinkle to match standard guitar tablature

**Before (Incorrect)**:
```javascript
'twinkle': [
    '\\instrument "Distortion Guitar"',
    '\\tempo 80',
    '.',
    '0.1 0.1 0.2 0.2 | 0.3 0.3 0.2.2',     // ❌ Wrong notes
    '0.1 0.1 0.3 0.3 0.2 0.2 0.1.2',        // ❌ Wrong notes
    '0.1 0.1 0.2 0.2 | 0.3 0.3 0.2.2',     // ❌ Wrong notes
    '0.1 0.1 0.3 0.3 0.2 0.2 0.1.2'         // ❌ Wrong notes
].join('\n')
```

**After (Correct - Standard Score)**:
```javascript
'twinkle': [
    '\\instrument "Distortion Guitar"',
    '\\tempo 80',
    '.',
    '3.1 3.1 | 0.1 0.1 2.1 2.1 0.1',        // ✅ Twinkle twinkle little star
    '3.1 3.1 2.1 2.1 0.1 0.1 3.1',          // ✅ How I wonder what you are
    '0.1 0.1 3.1 3.1 2.1 2.1 0.1',          // ✅ Up above the world so high
    '3.1 3.1 0.1 0.1 2.1 2.1 0.1',          // ✅ Like a diamond in the sky
    '3.1 3.1 2.1 2.1 0.1 0.1 3.1'            // ✅ Ending phrase
].join('\n')
```

**Standard TAB Reference**:

| Bar | Notes | Lyrics |
|-----|-------|--------|
| Bar 1 | `3 3 \|` | Twinkle twinkle |
| Bar 2 | `0 0 2 2 0` | little star |
| Bar 3 | `3 3 2 2 0 0 3` | How I wonder what you are |
| Bar 4 | `0 0 3 3 2 2 0` | Up above the world so high |
| Bar 5 | `3 3 0 0 2 2 0` | Like a diamond in the sky |
| Bar 6 | `3 3 2 2 0 0 3` | (Ending) |

---

### **v1.8.1** (2026-05-02)

**🎯 Major Update**: Added Release Notes Documentation

#### 📝 Documentation Added

##### RELEASE_NOTES.md Release Notes Document

**New File**: [RELEASE_NOTES.md](RELEASE_NOTES.md)

**Document Contents**:
- ✨ **Latest Version Notes**: Detailed release notes for v1.8.0
- 📜 **Version History**: Complete update history from v1.3.0 to v1.8.0
- 🚀 **Installation & Upgrade Guide**: Fresh install, version upgrade, Docker deployment
- ⚠️ **Known Issues**: Current version issue list
- 🗺️ **Roadmap**: Feature planning for v1.9.0 and v2.0.0
- 🤝 **Contributors**: Project contributor list

---

### **v1.8.0** (2026-05-02)

**🎯 Major Update**: Added Mutex Playback System + AlphaTab v1.8.2 Upgrade

#### ✨ New Features

##### 🎵 Score Mutex Playback System

**Description**: When playing a score, automatically stops all other playing scores.

**Technical Implementation**:
- Added mutex logic in `togglePlay()` function
- Iterates through `AppState.players` before playback to stop other playing scores
- Console logs marked with `[互斥]` tag for debugging

**User Experience Improvement**:

| Scenario | Before | After |
|----------|--------|-------|
| Play Twinkle then Birthday | ❌ Both play simultaneously (chaos) | ✅ Twinkle auto-stops, only Birthday plays |
| Switch songs in songs.html | ❌ Must manually stop previous | ✅ Auto-stop, seamless switch |
| Multiple tutorial scores | ❌ Multiple background audio overlap | ✅ Always only one playing |

---

#### 🚀 Dependency Upgrade

##### AlphaTab v1.8.1 → v1.8.2

**File Information**:
- Version: v1.8.2 (Latest Stable)
- Build Date: 2026-04-10
- File Size: ~1,127 KB

**v1.8.2 Major Improvements**:
- Diatonic spelling instead of chromatic spelling
- Enhanced cursor animation with custom cursor handler
- Fixed Guitar Pro 5 bass clef detection
- Worker pattern refactoring (unified across platforms)
- GP5 percussion compatibility fix
- Multi-instance SMuFL font family fix
- Fast playback termination on loop and song end
- Android platform improvements

---

#### 🐛 Bug Fixes

##### AlphaTex Parsing Error Fix

**Issue**: `Error AT202(3,33)->(3,34): Unexpected 'Pipe' token`

**Affected Scores**:
- ❌ 5.1 Twinkle Twinkle Little Star
- ❌ 5.3 Happy Birthday

**Fix Solution**: Use Beat Duration format (`.duration`) instead of Duration Change (`:duration`)

| Score ID | Name | Before | After | Bars |
|----------|------|--------|-------|------|
| `twinkle` | Twinkle | `0.2:2 \|` (❌) | `0.2.2` (✅) | 4 bars |
| `birthday` | Birthday | `0.2:2 \|` (❌) | `0.2.2` (✅) | 4 bars |

---

### **v1.7.1** (2026-05-02)

**🎯 Update**: License Correction

#### 📄 License Fix

**Issue**: README.md incorrectly labeled as MIT license

**Fix**: Corrected project license from **MIT** to **GPL v3**

**Changes**:
| Location | Before | After |
|----------|--------|-------|
| Badge (line 8) | `MIT-green` | `GPL v3-blue` |
| Text (line 331) | `MIT License` | `GPL v3 License` |

**Affected Files**:
| File | Action | Description |
|------|--------|-------------|
| [README.md](README.md) | Modified | License info (2 locations) |

---

### **v1.7.0** (2026-05-02)

**🎯 Major Update**: Added README.md Project Documentation

#### � Documentation Added

##### README.md Main Project Document

**New File**: [README.md](README.md)

**Document Contents**:
- ✨ **Project Overview**: Complete introduction to the electric guitar self-learning tutorial
- 📚 **Tutorial Chapters**: 8-chapter systematic tutorial content overview
- 🎵 **Song List**: 150+ classic songs by difficulty level
- � **Quick Start**: 3 deployment methods (Node.js/Python/Docker)
- 📂 **Project Structure**: Complete directory tree and file descriptions
- 🛠️ **Tech Stack**: Core technology dependencies and versions
- 📖 **Usage Guide**: Detailed operation instructions and feature descriptions
- ⚙️ **Customization**: How to add new scores, modify themes, extend features
- 🔧 **Troubleshooting**: Common issues and solutions
- 📋 **Changelog**: Version history and latest improvements
- 🤝 **Contributing Guide**: How to participate in project development

**Document Features**:
- Markdown format with GitHub rendering support
- Emoji icons for enhanced readability
- Table-based display for clear information
- Code examples and use cases
- Complete link navigation (local access support)

---

### **v1.6.3** (2026-05-02)

**🎯 Major Update**: Fixed AlphaTex Parsing Errors + Bar Line Display Optimization

#### 🐛 Bug Fixes
- Fixed `:duration` syntax conflict for twinkle, birthday
- Ensured all Scores display bar lines correctly

---

### **v1.6.2** (2026-05-02)

**🎯 Major Update**: AlphaTab v1.8.1 | Syntax Fix (Line-end `|` Error)

#### 🐛 Bug Fixes
- Removed all `|` separators at line ends in Scores

---

### **v1.6.1** (2026-05-02)

**🎯 Major Update**: Enhanced Playback Cursor + Bar Line Fix

#### 🎨 UI Enhancements
- Playback cursor: 4px width, gradient color + pulse glow animation
- Bar highlight: Blue background + left 3px border
- Note highlight: Theme blue color

---

### **v1.6.0** (2026-05-02)

**🎯 Major Update**: Complete UI/UX Beautification + Navigation Fix

#### 🎨 Design System Upgrade
- Adopted Vibrant & Block-based design style
- Added 20+ CSS variables for unified management
- Integrated Google Fonts (Poppins)
- Enhanced sidebar with gradient backgrounds and glow effects
- Redesigned button system with gradient colors and animations
- Improved progress bar with 3-color gradient
- Custom scrollbar styling
- Mobile menu button enhancements

#### 🐛 Navigation Fix
- Fixed songs.html directory link issues
- Added unique song IDs for accurate navigation

---

### **v1.5.0** (2026-05-02)

**🎯 Major Update**: Upgraded AlphaTab to v1.8.1 + Fixed Button Click Issue

#### 🚀 Dependency Upgrade
- AlphaTab v1.3.1 → v1.8.1

#### 🐛 Bug Fixes
- Fixed button click unresponsiveness (CSS `pointer-events` issue)

---

### **v1.4.0** - **v1.3.0** (2026-05-01 ~ 2026-05-02)

Early versions with basic functionality including:
- Tutorial page structure with 8 chapters
- GTP file support for classic songs
- Basic playback controls (play/stop/loop/tempo)
- Sidebar navigation with chapter folding
- Practice checklists with localStorage persistence
- Mobile responsive design
- Scroll-based progress tracking

---

## 📂 Project Structure

```
Electric Guitar Tutorial/
├── index.html              # 📄 Main page (8-chapter tutorial content)
├── songs.html              # 🎵 Classic songs practice page (standalone)
├── server.js               # 🖥️ Node.js local server (port 9999)
├── README.md               # 📖 Project documentation (Chinese)
├── RELEASE_NOTES.md        # 📋 Release notes (this file)
│
├── css/
│   └── style.css           # 🎨 Stylesheet (dark theme + responsive)
│
├── js/
│   ├── alphaTab.min.js     # 🎸 AlphaTab engine v1.8.2 (~1.1MB)
│   ├── app.js              # ⚙️ Application logic (render, playback, navigation)
│   ├── sonivox.sf2         # 🔊 SoundFont library (1.3MB, required for audio)
│   └── font/
│       └── Bravura.*       # 🎼 Music notation font (4 files)
│
├── gtp格式电吉他谱/        # 📁 GTP format score files (150+ songs)
│   ├── 喜欢你.gp3
│   ├── 海阔天空.gp5
│   ├── 摇滚卡农.gp4
│   └── ...                 (more songs)
│
└── readme/
    ├── 开发文档.md          # 📝 Development documentation
    ├── 实施文档.md          # 🚀 Deployment guide
    └── 功能更新.md          # 📋 Feature update log (Chinese)
```

---

## 🚀 Installation & Upgrade

### Fresh Installation

```bash
git clone https://github.com/your-repo/guitar-tutorial.git
cd guitar-tutorial
node server.js
# Access http://localhost:9999
```

### Docker Deployment

```bash
docker build -t guitar-tutorial:v1.8.3 .
docker run -d -p 9999:80 guitar-tutorial:v1.8.3
```

### Python Alternative

```bash
python -m http.server 8888
# Access http://localhost:8888
```

> ⚠️ **Important**: Due to AlphaTab's use of WebAudio and Web Workers APIs, the project **must be accessed via HTTP server**, not directly via `file://` protocol.

---

## ⚠️ Known Issues

| Issue | Status | Solution |
|-------|--------|----------|
| None currently | - | - |

---

## 🗺️ Roadmap

### v1.9.0 (Planned)
- Add more classic songs (10+)
- Support user-uploaded custom GTP files
- Add metronome functionality
- Support variable speed playback with finer granularity
- Add chord diagram display

### v2.0.0 (Future)
- User system (save progress to cloud)
- Mobile App (React Native / PWA)
- AI-assisted practice (real-time pitch/rhythm feedback)
- Video tutorial integration
- Community features (share scores, discuss techniques)

---

## 🤝 Contributors

- **Core Development**: [Your Name](https://github.com/your-username)
- **AlphaTab Engine**: [CoderLine](https://github.com/CoderLine/alphaTab)

---

## 📄 License

This project is licensed under **GPL v3**. See [LICENSE](LICENSE) file.

### Third-Party Library Licenses

| Library | License |
|---------|---------|
| [AlphaTab](https://github.com/CoderLine/alphaTab) | MPL-2.0 |
| [Bravura Font](https://github.com/w3c/smufl) | SIL Open Font License 1.1 |
| [Sonivox SoundFont](https://github.com/nick-thompson/sonivox) | Free (non-commercial use only) |

---

**🎸 Happy Learning! Keep Rocking! 🤘**
