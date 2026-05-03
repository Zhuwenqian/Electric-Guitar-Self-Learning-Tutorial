# 🎸 Electric Guitar Self-Learning Tutorial - Release Notes

[![Version](https://img.shields.io/badge/Version-v1.8.2-blue)](https://github.com/your-repo/guitar-tutorial)
[![AlphaTab](https://img.shields.io/badge/AlphaTab-v1.8.2-orange)](https://github.com/CoderLine/alphaTab)
[![License](https://img.shields.io/badge/License-GPL%20v3-blue)](./LICENSE)

---

## 📢 Latest Release

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

## 📜 Version History

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

---

#### 🐛 Bug Fixes

##### AlphaTex Parsing Error Fix

**Issue**: `Error AT202(3,33)->(3,34): Unexpected 'Pipe' token`

**Affected Scores**:
- ❌ 5.1 Twinkle Twinkle Little Star
- ❌ 5.3 Happy Birthday

**Fix Solution**: Use Beat Duration format (`.duration`) instead of Duration Change (`:duration`)

---

### **v1.7.0** (2026-05-02)

**🎯 Major Update**: Upgraded AlphaTab to v1.8.2 + Fixed Parsing Errors

#### 🚀 Dependency Upgrade
- AlphaTab v1.8.1 → v1.8.2

#### 🐛 Bug Fixes
- Fixed AlphaTex parsing errors for twinkle, birthday

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

---

### **v1.6.0** (2026-05-02)

**🎯 Major Update**: Complete UI/UX Beautification + Navigation Fix

#### 🎨 Design System Upgrade
- Adopted Vibrant & Block-based design style
- Added 20+ CSS variables for unified management
- Integrated Google Fonts (Poppins)

---

### **v1.5.0** (2026-05-02)

**🎯 Major Update**: Upgraded AlphaTab to v1.8.1 + Fixed Button Click Issue

#### 🚀 Dependency Upgrade
- AlphaTab v1.3.1 → v1.8.1

---

### **v1.4.0** - **v1.3.0** (2026-05-01 ~ 2026-05-02)

Early versions with basic functionality including:
- Tutorial page structure
- GTP file support
- Basic playback controls

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
docker build -t guitar-tutorial:v1.8.2 .
docker run -d -p 9999:80 guitar-tutorial:v1.8.2
```

---

## ⚠️ Known Issues

| Issue | Status | Solution |
|-------|--------|----------|
| None | - | - |

---

## 🗺️ Roadmap

### v1.9.0 (Planned)
- Add more classic songs (10+)
- Support user-uploaded custom GTP files
- Add metronome functionality
- Support variable speed playback

### v2.0.0 (Future)
- User system (save progress to cloud)
- Mobile App (React Native)
- AI-assisted practice (real-time feedback)

---

## 🤝 Contributors

- **Core Development**: [Your Name](https://github.com/your-username)
- **AlphaTab Engine**: [CoderLine](https://github.com/CoderLine/alphaTab)

---

## 📄 License

This project is licensed under **GPL v3**. See [LICENSE](LICENSE) file.

---

**🎸 Happy Learning! Keep Rocking! 🤘**
