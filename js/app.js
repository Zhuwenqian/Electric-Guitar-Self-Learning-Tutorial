/*
  文件名称: app.js
  文件用途: 电吉他自学教程 - 交互逻辑脚本
  包含所有页面的交互功能，使用 AlphaTab 库渲染吉他六线谱。
  
  版本: v1.8.0 (2026-05-02)
  更新内容:
    - **新增** 谱例互斥播放功能（播放一个自动停止其他）
    - 升级 AlphaTab 从 v1.8.1 到 **v1.8.2**（最新稳定版）
    - 修复 twinkle（小星星）和 birthday（生日歌）的 AlphaTex 解析错误
    - 使用 Beat Duration 格式（.duration）替代 Duration Change（:duration）
    - 解决 | 小节线前的 :duration 语法冲突问题
    - 确保所有 Score 正确显示小节线
    - 优化播放控制逻辑，增强错误处理
    - 修复按钮点击无响应问题（CSS pointer-events）
  
  主要功能:
    1. 使用 AlphaTab 库渲染吉他六线谱（支持播放/停止/循环/调速）
    2. 支持 AlphaTex 文本格式和 GTP（Guitar Pro）文件格式
    3. 侧边栏导航与章节折叠展开
    4. 阅读进度跟踪（localStorage 持久化）
    5. 练习检查清单（localStorage 持久化）
    6. 移动端响应式适配（侧边栏切换）
    7. 滚动监听，自动高亮当前章节
    8. 播放光标系统（进度条/小节高亮/音符高亮）
    9. **互斥播放系统**（多个谱例不会同时发声）⭐ 新增
  
  教程内容:
    第一章：认识电吉他（构造、定音、姿势、调音）
    第二章：基础乐理与六线谱（音符、TAB读法、空弦练习）
    第三章：右手拨弦基础（拨片、交替拨弦、跨弦练习）
    第四章：左手按弦基础（姿势、半音阶爬格子）
    第五章：简单单音旋律（小星星、欢乐颂、生日快乐歌）
    第六章：强力和弦 Power Chord（原理、两种指型、转换练习）
    第七章：节奏吉他入门（闷音Palm Mute、摇滚节奏型、Riff练习）
    第八章：进阶技巧入门（滑音、推弦、击弦、勾弦）
  
  经典曲目（独立页面 songs.html）:
    - 入门级：喜欢你、真的爱你（Beyond）
    - 初级：大声说喜欢你（灌篮高手）、海阔天空（Beyond）
    - 中级：灰色轨迹、谁伴我闯荡（Beyond）
    - 高级：摇滚卡农（JerryC）、野蜂飞舞（古典改编）
  
  依赖库:
    - **AlphaTab v1.8.2** (js/alphaTab.min.js) ⭐ 最新版本
      项目地址: https://github.com/CoderLine/alphaTab
      许可证: MPL-2.0
      用于渲染交互式吉他六线谱，支持播放、循环、调速等功能
      支持 AlphaTex 文本格式和 Guitar Pro 文件格式（.gp3/.gp4/.gp5/.gpx/.gp）
      
      v1.8.2 新增功能 (2026-04-10):
      - 🎵 使用自然音阶拼写代替半音阶拼写
      - 🎯 光标动画改进：播放范围结束时的自定义光标处理器
      - 🔧 GP5 低音谱号检测修复
      - 🔧 GP5 打击乐器兼容性修复
      - 🎼 多实例 SMuFL 字体族配置修复
      - 🎹 循环和歌曲结束时快速结束播放
      - 📱 Android 平台改进
      - ⚡ Worker 模式重构（所有平台统一）
      
      常用 API:
      - isReadyForPlayback: 检查播放器是否完全就绪
      - playPause(): 切换播放/暂停
      - playerState: 获取当前状态 (Playing/Paused/Stopped)
      - customCursorHandler: 自定义光标处理器 (v1.8.2 新增)
      
  互斥播放系统说明:
    - 功能：当播放一个谱例时，自动停止所有其他正在播放的谱例
    - 实现：在 togglePlay() 函数中，播放前遍历 AppState.players 停止其他
    - 效果：避免多个音频同时播放，提升用户体验
    - 日志：控制台输出 [互斥] 标记的详细日志，便于调试
*/

// ========== 全局状态管理 ==========
var AppState = {
    /* 每个谱例的播放状态: { id: { api, playing, looping, tempo } } */
    players: {},
    /* 侧边栏是否打开 */
    sidebarOpen: true,
    /* 已完成的章节ID集合 */
    completedSections: {},
    /* 练习检查清单状态 */
    checklists: {}
};

// ========== AlphaTex 乐谱数据定义 ==========
/*
 * AlphaTex 是 AlphaTab 的文本乐谱格式（v1.8.1）
 * 
 * 元数据命令:
 *   \tempo 数字      - 设置速度（BPM，每分钟节拍数）
 *   \title "文字"    - 设置标题（可选）
 * 
 * 乐谱结构:
 *   .                - 乐谱内容开始标记
 *   品格.弦编号      - 音符格式（注意：品格在前，弦编号在后！）
 *   |                - 小节线
 *   (音符 音符)      - 同时发声（如和弦）
 * 
 * AlphaTab v1.8.1 AlphaTex 格式说明:
 * 
 * 弦编号规则（1-based）:
 *   1 = 第1弦（高音E，最细）- 显示在最上面
 *   2 = 第2弦（B）
 *   3 = 第3弦（G）
 *   4 = 第4弦（D）
 *   5 = 第5弦（A）
 *   6 = 第6弦（低音E，最粗）- 显示在最下面
 * 
 * 音符格式: fret.string（品格.弦编号）
 *   例如: 0.6 = 6弦空弦, 3.1 = 1弦3品
 * 
 * 时值标记:
 *   :4  = 四分音符（默认）
 *   :8  = 八分音符
 *   :16 = 十六分音符
 *   .8  = 单个音符为八分音符
 * 
 * 技巧标记（花括号格式）:
 *   {h}  - 击弦/勾弦 (Hammer-on/Pull-off)
 *   {sl} - 连音滑音 (Legato Slide)
 *   {ss} - 移位滑音 (Shift Slide)
 *   {pm} - 闷音 (Palm Mute)
 *   {v}  - 颤音 (Vibrato)
 */
var Scores = {
    /*
     * 练习2-1: 空弦音练习
     * 说明: 依次弹响6根空弦，从6弦到1弦
     * 时值: 四分音符（默认，每个音符一拍）
     * 音色: Distortion Guitar（失真吉他）
     */
    'open': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        '0.6 0.5 0.4 | 0.3 0.2 0.1'
    ].join('\n'),

    /*
     * 练习3-1: 第6弦交替拨弦
     * 说明: 空弦下上交替拨弦
     * 时值: 八分音符（:8，每个音符半拍）
     * 音色: Distortion Guitar（失真吉他）
     */
    'alt': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        ':8 0.6 0.6 0.6 0.6 | 0.6 0.6 0.6 0.6'
    ].join('\n'),

    /*
     * 练习3-2: 跨弦交替拨弦
     * 说明: 从6弦到1弦再回来
     * 时值: 八分音符（:8）
     * 音色: Distortion Guitar（失真吉他）
     */
    'cross': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        ':8 0.6 0.5 0.4 0.3 | 0.2 0.1 0.2 0.3 | 0.4 0.5 0.6 0.6'
    ].join('\n'),

    /*
     * 练习4-1: 半音阶练习（爬格子）
     * 说明: 第6弦 1-2-3-4品（入门版，只用一根弦）
     * 时值: 八分音符（:8）
     * 注意: 进阶版可在每根弦上练习
     * 音色: Distortion Guitar（失真吉他）
     */
    'chromatic': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        ':8 1.6 2.6 3.6 4.6 | 1.6 2.6 3.6 4.6 | 1.6 2.6 3.6 4.6 | 1.6 2.6 3.6 4.6'
    ].join('\n'),

    /*
     * 曲目5-1: 小星星
     * 说明: 最简单的入门曲目
     * 时值: 四分音符（默认）和二分音符（.2，两拍）
     *       使用 Beat Duration 格式：音符.duration（避免在 | 前使用 :duration）
     * 旋律: 1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 - |
     * 音色: Distortion Guitar（失真吉他）
     *
     * AlphaTab v1.8.1 语法说明:
     *   - 不能在 | 小节线前直接使用 :duration 格式（会导致解析错误）
     *   - 正确做法：使用 .duration 格式（如 0.2.2 表示二分音符）
     *   - 或者将 :duration 放在行末（不在 | 前面）
     */
    'twinkle': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 80',
        '.',
        '0.1 0.1 0.2 0.2 | 0.3 0.3 0.2.2',
        '0.1 0.1 0.3 0.3 0.2 0.2 0.1.2',
        '0.1 0.1 0.2 0.2 | 0.3 0.3 0.2.2',
        '0.1 0.1 0.3 0.3 0.2 0.2 0.1.2'
    ].join('\n'),

    /*
     * 曲目5-2: 欢乐颂
     * 说明: 贝多芬第九交响曲主题
     * 时值: 四分音符（默认）和二分音符（:2）
     * 旋律: 3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3. 2 2 - |
     * 音色: Distortion Guitar（失真吉他）
     */
    'ode': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 80',
        '.',
        '2.2 2.2 3.2 0.1 | 0.1 3.2 2.2 1.2 | 0.1 0.1 1.2 2.2 | 2.2 1.2 1.2:2',
        '2.2 2.2 3.2 0.1 | 0.1 3.2 2.2 1.2 | 0.1 0.1 1.2 2.2 | 1.2 0.1 0.1:2',
        '1.2 2.2 0.1 1.2 | 2.2 3.2 2.2 0.1 | 1.2 2.2 3.2 2.2 | 1.2 0.1 0.1:2'
    ].join('\n'),

    /*
     * 曲目5-3: 生日快乐歌
     * 说明: 经典生日歌
     * 时值: 四分音符（默认）和二分音符（.2，两拍）
     *       使用 Beat Duration 格式：音符.duration（避免在 | 前使用 :duration）
     * 旋律: 5 5 6 5 | 1 7 - | 5 5 6 5 | 2 1 - |
     * 注意: 简化版，使用四分音符和二分音符
     * 音色: Distortion Guitar（失真吉他）
     *
     * AlphaTab v1.8.1 语法说明:
     *   - 不能在 | 小节线前直接使用 :duration 格式（会导致解析错误）
     *   - 正确做法：使用 .duration 格式（如 0.2.2 表示二分音符）
     */
    'birthday': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 80',
        '.',
        '0.1 0.1 0.2 0.1 | 0.3 0.2.2',
        '0.1 0.1 0.6 0.1 | 0.3 0.2.2',
        '0.1 0.1 0.1 0.3 | 0.3 0.2 0.1 0.2',
        '2.1 2.1 0.3 0.3 | 0.3 0.2 0.1.2'
    ].join('\n'),

    /*
     * 练习6-1: 强力和弦进行
     * 说明: E5 - A5 - G5 - D5（每和弦4拍）
     * 时值: 四分音符（默认）
     * 注意: 基础练习，不需要闷音
     * 音色: Distortion Guitar（失真吉他）
     */
    'chord': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        '(0.6 2.5) (0.6 2.5) (0.6 2.5) (0.6 2.5)',
        '(0.5 2.4) (0.5 2.4) (0.5 2.4) (0.5 2.4)',
        '(3.6 5.5) (3.6 5.5) (3.6 5.5) (3.6 5.5)',
        '(5.5 7.4) (5.5 7.4) (5.5 7.4) (5.5 7.4)'
    ].join('\n'),

    /*
     * 曲目7-1: 摇滚节奏练习 E5
     * 说明: 闷音 + 开放交替
     * 时值: 八分音符（:8）
     * 技巧: {pm} 闷音 (Palm Mute)
     *       闷音标记放在每个音符上
     * 音色: Distortion Guitar（失真吉他）
     */
    'song1': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 70',
        '.',
        ':8 (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5)',
        '(0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5)',
        '(0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5)',
        '(0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5)'
    ].join('\n'),

    /*
     * 曲目7-2: 简单摇滚Riff
     * 说明: E5 - G5 - A5
     * 时值: 八分音符（:8）
     * 技巧: {pm} 闷音 (Palm Mute)
     * 音色: Distortion Guitar（失真吉他）
     */
    'riff': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 80',
        '.',
        ':8 (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5)',
        '(3.6{pm} 5.5{pm}) (3.6 5.5) (3.6{pm} 5.5{pm}) (3.6 5.5) (3.6{pm} 5.5{pm}) (3.6 5.5) (3.6{pm} 5.5{pm}) (3.6 5.5)',
        '(0.5{pm} 2.4{pm}) (0.5 2.4) (0.5{pm} 2.4{pm}) (0.5 2.4) (0.5{pm} 2.4{pm}) (0.5 2.4) (0.5{pm} 2.4{pm}) (0.5 2.4)',
        '(0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5) (0.6{pm} 2.5{pm}) (0.6 2.5)'
    ].join('\n'),

    /*
     * 练习8-1: 滑音练习
     * 说明: 在1-3弦上练习滑音（5、6弦几乎不会滑）
     * 时值: 四分音符（默认）
     * 技巧: {sl} 连音滑音 (Legato Slide)
     *       语法: 第一个音符{sl} 第二个音符
     *       AlphaTab会自动识别滑音方向
     * 音色: Distortion Guitar（失真吉他）
     */
    'slide': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        '3.1{sl} 5.1 r r | 3.2{sl} 5.2 r r | 3.3{sl} 5.3 r r | 5.3{sl} 3.3 r r'
    ].join('\n'),

    /*
     * 练习8-2: 推弦练习
     * 说明: 在1-3弦上练习推弦（电吉他核心技巧）
     * 时值: 四分音符（默认）
     * 技巧: {b (值)} 推弦 (Bend)
     *       值表示推弦的音程（单位：四分音）
     *       4 = 全音（2品），2 = 半音（1品），1 = 四分之一音
     *       {b (0 4)} = 从原音推到全音
     *       {b (0 4 0)} = 推弦后释放
     * 音色: Distortion Guitar（失真吉他）
     */
    'bend': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        '5.1{b (0 4)} r r r | 5.2{b (0 4)} r r r | 5.3{b (0 4)} r r r | 7.1{b (0 2)} r r r'
    ].join('\n'),

    /*
     * 练习8-3: 击弦练习
     * 说明: 在1-3弦上练习击弦（5、6弦很少会击勾滑）
     * 时值: 四分音符（默认）
     * 技巧: {h} 击弦 (Hammer-on)
     *       语法: 第一个音符{h} 第二个音符
     *       从低品到高品为击弦
     * 音色: Distortion Guitar（失真吉他）
     */
    'hammer': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        '3.1{h} 5.1 r r | 3.2{h} 5.2 r r | 3.3{h} 5.3 r r | 5.3{h} 7.3 r r'
    ].join('\n'),

    /*
     * 练习8-4: 勾弦练习
     * 说明: 在1-3弦上练习勾弦（5、6弦很少会击勾滑）
     * 时值: 四分音符（默认）
     * 技巧: {h} 勾弦 (Pull-off)
     *       语法: 第一个音符{h} 第二个音符
     *       从高品到低品为勾弦（AlphaTab自动识别）
     * 音色: Distortion Guitar（失真吉他）
     */
    'pulloff': [
        '\\instrument "Distortion Guitar"',
        '\\tempo 60',
        '.',
        '5.1{h} 3.1 r r | 5.2{h} 3.2 r r | 5.3{h} 3.3 r r | 7.3{h} 5.3 r r'
    ].join('\n')
};

// ========== GTP 格式乐谱文件路径 ==========
/*
 * GTP 文件是 Guitar Pro 软件的乐谱格式
 * AlphaTab 支持 .gp3, .gp4, .gp5, .gpx, .gp 格式
 * 
 * 文件路径使用相对路径，相对于 index.html 所在目录
 * 
 * 难度分级:
 *   入门级 - 适合初学者，旋律简单，速度较慢
 *   初级   - 基础技巧应用，节奏相对简单
 *   中级   - 需要一定技巧基础，节奏变化较多
 *   高级   - 技巧复杂，速度快，需要较高演奏水平
 */
var GtpFiles = {
    /*
     * 入门级谱例
     * 特点：旋律简单，速度适中，适合初学者
     */
    'gtp-xihuan': {
        file: 'gtp格式电吉他谱/喜欢你.gp3',
        title: '喜欢你',
        artist: 'Beyond',
        difficulty: '入门级',
        description: 'Beyond经典曲目，旋律优美，适合入门练习'
    },
    'gtp-zhenai': {
        file: 'gtp格式电吉他谱/真的爱你.gp5',
        title: '真的爱你',
        artist: 'Beyond',
        difficulty: '入门级',
        description: 'Beyond代表作，节奏稳定，适合练习基础技巧'
    },
    
    /*
     * 初级谱例
     * 特点：基础技巧应用，节奏相对简单
     */
    'gtp-guanlan': {
        file: 'gtp格式电吉他谱/灌篮高手[大声说喜欢你].gp4',
        title: '大声说喜欢你',
        artist: 'BAAD',
        difficulty: '初级',
        description: '灌篮高手片头曲，经典动漫歌曲，节奏明快'
    },
    'gtp-haikuo': {
        file: 'gtp格式电吉他谱/海阔天空.gp5',
        title: '海阔天空',
        artist: 'Beyond',
        difficulty: '初级',
        description: 'Beyond最经典曲目之一，适合练习情感表达'
    },
    
    /*
     * 中级谱例
     * 特点：技巧变化较多，需要一定基础
     */
    'gtp-huise': {
        file: 'gtp格式电吉他谱/灰色轨迹MTV版 .gp5',
        title: '灰色轨迹',
        artist: 'Beyond',
        difficulty: '中级',
        description: 'Beyond经典，技巧运用丰富，适合进阶练习'
    },
    'gtp-shuibw': {
        file: 'gtp格式电吉他谱/谁伴我闯荡.gtp',
        title: '谁伴我闯荡',
        artist: 'Beyond',
        difficulty: '中级',
        description: 'Beyond经典曲目，情感表达丰富'
    },
    
    /*
     * 高级谱例
     * 特点：技巧复杂，速度快，需要较高水平
     */
    'gtp-kanon': {
        file: 'gtp格式电吉他谱/[摇滚卡农（精修版）].gp4',
        title: '摇滚卡农',
        artist: 'JerryC',
        difficulty: '高级',
        description: '经典摇滚改编，技巧全面，速度较快'
    },
    'gtp-yefeng': {
        file: 'gtp格式电吉他谱/野蜂飞舞.gp4',
        title: '野蜂飞舞',
        artist: 'Rimsky-Korsakov',
        difficulty: '高级',
        description: '古典名曲改编，速度极快，技巧要求高'
    }
};

// ========== 侧边栏导航数据 ==========
/*
 * 定义侧边栏的章节结构
 * 每个章节包含标题、ID和子节列表
 */
var NavData = [
    {
        title: '第一章：认识电吉他',
        id: 'ch1',
        sections: [
            { title: '1.1 电吉他的构造', id: 's1-1' },
            { title: '1.2 六根弦的标准定音', id: 's1-2' },
            { title: '1.3 正确的持琴姿势', id: 's1-3' },
            { title: '1.4 如何调音', id: 's1-4' }
        ]
    },
    {
        title: '第二章：基础乐理与六线谱',
        id: 'ch2',
        sections: [
            { title: '2.1 音符与半音', id: 's2-1' },
            { title: '2.2 六线谱的读法', id: 's2-2' },
            { title: '2.3 空弦音练习', id: 's2-3' }
        ]
    },
    {
        title: '第三章：右手拨弦基础',
        id: 'ch3',
        sections: [
            { title: '3.1 拨片的正确使用', id: 's3-1' },
            { title: '3.2 交替拨弦', id: 's3-2' },
            { title: '3.3 跨弦拨弦练习', id: 's3-3' }
        ]
    },
    {
        title: '第四章：左手按弦基础',
        id: 'ch4',
        sections: [
            { title: '4.1 左手按弦姿势', id: 's4-1' },
            { title: '4.2 半音阶练习', id: 's4-2' }
        ]
    },
    {
        title: '第五章：简单单音旋律',
        id: 'ch5',
        sections: [
            { title: '5.1 小星星', id: 's5-1' },
            { title: '5.2 欢乐颂', id: 's5-2' },
            { title: '5.3 生日快乐歌', id: 's5-3' }
        ]
    },
    {
        title: '第六章：强力和弦',
        id: 'ch6',
        sections: [
            { title: '6.1 什么是强力和弦', id: 's6-1' },
            { title: '6.2 两种基本指型', id: 's6-2' },
            { title: '6.3 强力和弦转换练习', id: 's6-3' }
        ]
    },
    {
        title: '第七章：节奏吉他入门',
        id: 'ch7',
        sections: [
            { title: '7.1 闷音技巧', id: 's7-1' },
            { title: '7.2 摇滚节奏型', id: 's7-2' },
            { title: '7.3 经典Riff练习', id: 's7-3' }
        ]
    },
    {
        title: '第八章：进阶技巧入门',
        id: 'ch8',
        sections: [
            { title: '8.1 滑音 Slide', id: 's8-1' },
            { title: '8.2 推弦 Bend', id: 's8-2' },
            { title: '8.3 击弦 Hammer-on', id: 's8-3' },
            { title: '8.4 勾弦 Pull-off', id: 's8-4' }
        ]
    }
];

// ========== 初始化函数 ==========
/**
 * 页面加载完成后执行初始化
 * 1. 构建侧边栏导航（如果存在）
 * 2. 恢复本地存储的状态
 * 3. 初始化所有吉他谱渲染
 * 4. 绑定滚动监听（如果存在主内容区）
 */
function init() {
    /* 
     * 检查是否为主页面（有侧边栏）
     * songs.html 等独立页面没有侧边栏
     */
    var sidebar = document.getElementById('sidebarNav');
    if (sidebar) {
        buildSidebar();
        bindScrollListener();
    }
    loadState();
    initAllTabs();
}

/**
 * 构建侧边栏导航HTML
 * 根据NavData动态生成导航菜单
 * 仅在侧边栏元素存在时执行
 */
function buildSidebar() {
    var nav = document.getElementById('sidebarNav');
    if (!nav) return; /* 侧边栏不存在则跳过 */
    var html = '';
    for (var i = 0; i < NavData.length; i++) {
        var chapter = NavData[i];
        html += '<div class="chapter-group">';
        html += '<div class="chapter-title open" onclick="toggleChapter(this)" data-chapter="' + chapter.id + '">';
        html += chapter.title;
        html += '<span class="arrow">▶</span>';
        html += '</div>';
        html += '<ul class="section-list open" id="list-' + chapter.id + '">';
        for (var j = 0; j < chapter.sections.length; j++) {
            var sec = chapter.sections[j];
            html += '<li><a href="#' + sec.id + '" onclick="navigateTo(\'' + sec.id + '\')" id="nav-' + sec.id + '">' + sec.title + '</a></li>';
        }
        html += '</ul>';
        html += '</div>';
    }
    nav.innerHTML = html;
}

/**
 * 切换章节折叠/展开
 * @param {HTMLElement} el - 被点击的章节标题元素
 */
function toggleChapter(el) {
    var listId = 'list-' + el.getAttribute('data-chapter');
    var list = document.getElementById(listId);
    if (list.classList.contains('open')) {
        list.classList.remove('open');
        el.classList.remove('open');
    } else {
        list.classList.add('open');
        el.classList.add('open');
    }
}

/**
 * 导航到指定章节
 * @param {string} sectionId - 目标章节的ID
 */
function navigateTo(sectionId) {
    var el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        /* 移动端自动关闭侧边栏 */
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    }
}

/**
 * 切换移动端侧边栏显示
 */
function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    AppState.sidebarOpen = !AppState.sidebarOpen;
    if (AppState.sidebarOpen) {
        sidebar.classList.add('open');
    } else {
        sidebar.classList.remove('open');
    }
}

// ========== AlphaTab 吉他谱渲染 ==========
/**
 * 初始化所有吉他谱
 * 遍历Scores中的所有谱例，为每个创建AlphaTab实例并渲染
 */
function initAllTabs() {
    /* 初始化 AlphaTex 格式的谱例 */
    var ids = Object.keys(Scores);
    for (var i = 0; i < ids.length; i++) {
        initTab(ids[i]);
    }
    /* 初始化 GTP 格式的谱例 */
    var gtpIds = Object.keys(GtpFiles);
    for (var j = 0; j < gtpIds.length; j++) {
        initGtpTab(gtpIds[j]);
    }
}

/**
 * 初始化单个吉他谱（AlphaTex格式）
 * 使用AlphaTab API渲染六线谱到指定容器
 * 
 * @param {string} id - 谱例ID，对应Scores中的键名和页面中的render-{id}容器
 * 
 * AlphaTab v1.3.1 配置说明（嵌套结构）:
 *   - core: 核心设置（引擎、文件等）
 *   - display.staveProfile: 'Tab' 表示只显示六线谱（不显示五线谱）
 *     可选值: 'Default'(默认), 'ScoreTab'(五线谱+六线谱), 'Score'(五线谱), 'Tab'(六线谱)
 *   - player.enablePlayer: true 启用音频播放
 *   - player.scrollElement: 滚动容器（自动跟随播放位置）
 *   - player.soundFont: 音色库路径（可选，不设置则使用默认合成音色）
 */
function initTab(id) {
    var container = document.getElementById('render-' + id);
    if (!container) return;

    /* 
     * 创建AlphaTab API实例
     * AlphaTab v1.8.1 使用嵌套设置结构（core/display/player）
     * 同时也兼容旧的扁平格式
     */
    var settings = {
        core: {
            /* 
             * 引擎设置
             * 不设置engine，使用默认引擎
             */
        },
        display: {
            /*
             * staveProfile: 乐谱显示模式
             * 'Tab' - 只显示六线谱（适合吉他手）
             * 'Score' - 只显示五线谱
             * 'ScoreTab' - 同时显示五线谱和六线谱
             * 'Default' - 默认模式
             */
            staveProfile: 'Tab'
        },
        notation: {
            /*
             * rhythmMode: 节奏符号显示模式
             * 'Hidden' - 隐藏节奏符号（默认）
             * 'ShowWithBeams' - 显示节奏符号，使用 beams（符杠）
             * 'ShowWithBars' - 显示节奏符号，使用 bars（符干）
             * 'Automatic' - 自动检测（当隐藏五线谱时自动显示）
             * 
             * 由于我们只显示六线谱（staveProfile: 'Tab'），
             * 需要设置 rhythmMode 来显示音符时值
             */
            rhythmMode: 'ShowWithBeams'
        },
        player: {
            /* 启用播放器 */
            enablePlayer: true,
            /*
             * enableCursor: 显示播放光标/进度条
             * true - 显示蓝色竖线进度条和小节高亮
             * false - 不显示（默认）
             */
            enableCursor: true,
            /*
             * enableElementHighlighting: 显示当前播放音符高亮
             * true - 当前播放的音符变色
             * false - 不高亮（默认）
             */
            enableElementHighlighting: true,
            /*
             * enableAnimatedBeatCursor: 进度条动画模式
             * true - 平滑移动动画
             * false - 逐拍跳动
             */
            enableAnimatedBeatCursor: true,
            scrollElement: container,
            soundFont: 'js/sonivox.sf2'
        }
    };

    try {
        var api = new alphaTab.AlphaTabApi(container, settings);

        /* 
         * 加载并渲染AlphaTex乐谱
         * AlphaTab v1.8.1 使用 api.tex() 方法直接渲染AlphaTex字符串
         * 参数1: AlphaTex格式的乐谱字符串
         * 参数2: 要显示的轨道索引数组（[0]表示显示第一个轨道）
         */
        api.tex(Scores[id], [0]);

        /* 存储API实例到全局状态 */
        AppState.players[id] = {
            api: api,
            playing: false,
            looping: false,
            tempo: parseInt(Scores[id].match(/\\tempo\s+(\d+)/)[1]) || 60
        };

        /* 监听播放结束事件 */
        api.playerReady.on(function () {
            api.soundFontLoad.on(function (e) {
                console.log('音色库加载完成: ' + id);
            });
        });

        api.playerFinished.on(function () {
            var player = AppState.players[id];
            if (player && player.looping) {
                api.play();
            } else if (player) {
                player.playing = false;
                updatePlayButton(id);
            }
        });

    } catch (e) {
        console.error('初始化吉他谱失败 (' + id + '):', e);
        container.innerHTML = '<p style="color:#e94560;padding:20px;">⚠️ 吉他谱加载失败，请刷新页面重试。</p>';
    }
}

/**
 * 初始化单个吉他谱（GTP格式）
 * 使用AlphaTab API加载Guitar Pro文件
 * 
 * @param {string} id - 谱例ID，对应GtpFiles中的键名和页面中的render-{id}容器
 * 
 * GTP文件加载说明:
 *   - 支持 .gp3, .gp4, .gp5, .gpx, .gp 格式
 *   - 使用 api.load() 方法加载文件
 *   - 文件通过 fetch 从服务器获取
 *   
 * 播放特性（需显式启用）:
 *   - 播放进度条：蓝色竖线显示当前播放位置 (enableCursor)
 *   - 小节高亮：当前播放的小节会高亮显示 (enableCursor)
 *   - 音符高亮：当前播放的音符会高亮显示 (enableElementHighlighting)
 * 
 * AlphaTab v1.8.1 新增:
 *   - isReadyForPlayback: 检查播放器是否完全就绪
 *   - playPause(): 切换播放/暂停的便捷方法
 *   - playerState: 获取当前播放状态 (Playing/Paused/Stopped)
 */
function initGtpTab(id) {
    var container = document.getElementById('render-' + id);
    if (!container) return;
    
    var gtpInfo = GtpFiles[id];
    if (!gtpInfo) return;

    var settings = {
        core: {},
        display: { staveProfile: 'Tab' },
        notation: { rhythmMode: 'ShowWithBeams' },
        player: {
            /* 启用播放器 */
            enablePlayer: true,
            /*
             * enableCursor: 显示播放光标/进度条
             * true - 显示蓝色竖线进度条和小节高亮
             * false - 不显示（默认）
             */
            enableCursor: true,
            /*
             * enableElementHighlighting: 显示当前播放音符高亮
             * true - 当前播放的音符变色
             * false - 不高亮（默认）
             */
            enableElementHighlighting: true,
            /*
             * enableAnimatedBeatCursor: 进度条动画模式
             * true - 平滑移动动画
             * false - 逐拍跳动
             */
            enableAnimatedBeatCursor: true,
            scrollElement: container,
            soundFont: 'js/sonivox.sf2'
        }
    };

    try {
        var api = new alphaTab.AlphaTabApi(container, settings);

        /*
         * 加载GTP文件
         * AlphaTab v1.8.1 在浏览器环境中支持直接传递文件URL
         * api.load() 会自动处理文件下载、格式识别和渲染
         * 
         * 支持的格式: .gp3, .gp4, .gp5, .gpx, .gp (Guitar Pro)
         */
        console.log('[GTP] 开始加载文件:', id, gtpInfo.file);
        
        try {
            /*
             * 直接传递文件URL给api.load()
             * AlphaTab会自动:
             * 1. 通过fetch下载文件
             * 2. 识别文件格式（.gp3/.gp4/.gp5/.gpx/.gp）
             * 3. 解析乐谱数据
             * 4. 渲染到容器中
             * 
             * 参数说明:
             * - url: 文件路径或URL（相对路径或绝对路径）
             * - options: 可选配置对象，可指定 { tracks: [0] } 只显示第一个轨道
             */
            api.load(gtpInfo.file);
            console.log('[GTP] api.load() 调用成功:', id);
        } catch (loadError) {
            console.error('[GTP] api.load() 调用失败:', loadError);
            container.innerHTML = '<p style="color:#e94560;padding:20px;">⚠️ 乐谱加载失败: ' + gtpInfo.title + '<br><small>' + loadError.message + '</small></p>';
        }

        /* 存储API实例到全局状态 */
        AppState.players[id] = {
            api: api,
            playing: false,
            looping: false,
            tempo: 120, /* GTP文件自带速度信息，默认值会被覆盖 */
            ready: false /* 播放器是否就绪（乐谱渲染完成） */
        };
        
        console.log('[GTP] API实例已创建并存储:', id);

        /*
         * 监听乐谱加载完成事件
         * AlphaTab v1.8.1 支持的事件:
         *   - scoreLoaded: 乐谱数据解析完成，可以开始渲染
         *   - playerReady: 播放器完全就绪（音色库加载完成）
         *   - playerFinished: 播放结束
         * 
         * 使用 scoreLoaded 作为"就绪"标志
         * 当乐谱加载完成后，播放功能应该可以使用
         */
        api.scoreLoaded.on(function(score) {
            console.log('[GTP] 乐谱加载完成:', id, score ? '有数据' : '无数据');
            
            /* 标记播放器为就绪状态 */
            AppState.players[id].ready = true;
            
            if (score && score.tempo) {
                AppState.players[id].tempo = score.tempo;
                console.log('[GTP] 获取到速度信息:', score.tempo, 'BPM');
            }
            
            /*
             * 更新按钮状态为可用
             * 移除 disabled 属性，恢复按钮文本
             */
            var playBtn = document.getElementById('btnPlay-' + id);
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.style.opacity = '1';
                playBtn.textContent = '▶ 播放';
            }
            
            console.log('[GTP] 播放器已就绪，可以播放:', id);
            
            /*
             * AlphaTab v1.8.1 新增：使用 isReadyForPlayback 检查播放器是否完全就绪
             * 这个属性会在以下条件全部满足时变为 true:
             * 1. 后台工作线程启动
             * 2. 音频输出初始化
             * 3. 音色库(SoundFont)加载完成
             * 4. 乐谱MIDI数据生成完毕
             */
            if (api.isReadyForPlayback) {
                console.log('[GTP] ✅ 播放器完全就绪 (isReadyForPlayback=true):', id);
            } else {
                console.log('[GTP] ⏳ 播放器正在初始化音频引擎...');
            }
        });

        /*
         * AlphaTab v1.8.1 新增：监听 playerReady 事件
         * 此事件在音色库加载完成后触发，表示播放器完全可用
         */
        if (api.playerReady) {
            api.playerReady.on(function() {
                console.log('[GTP] ✅ 音频引擎就绪 (playerReady):', id);
                AppState.players[id].ready = true;
            });
        }

        /* 监听播放结束事件 */
        api.playerFinished.on(function () {
            var player = AppState.players[id];
            if (player && player.looping) {
                api.play();
            } else if (player) {
                player.playing = false;
                updatePlayButton(id);
            }
        });

    } catch (e) {
        console.error('初始化GTP吉他谱失败 (' + id + '):', e);
        container.innerHTML = '<p style="color:#e94560;padding:20px;">⚠️ 吉他谱加载失败，请刷新页面重试。</p>';
    }
}

// ========== 播放控制 ==========
/**
 * 切换播放/暂停
 * AlphaTab v1.8.1 支持 playPause() 方法，但这里保留手动控制以支持更多自定义逻辑
 * 
 * @param {string} id - 谱例ID
 */
function togglePlay(id) {
    console.log('[播放] ====== 点击播放按钮 ======');
    console.log('[播放] ID:', id);
    
    var player = AppState.players[id];
    console.log('[播放] player 对象:', player ? '存在' : '❌ 不存在');
    
    if (!player) {
        console.error('[播放] ❌ 错误: player 不存在, id=', id);
        alert('错误: 乐谱未初始化 (ID: ' + id + ')');
        return;
    }
    
    if (!player.api) {
        console.error('[播放] ❌ 错误: API 实例不存在');
        alert('错误: AlphaTab API 未就绪，请刷新页面');
        return;
    }
    
    /*
     * AlphaTab v1.8.x 新增：使用 isReadyForPlayback 检查播放器是否完全就绪
     * 如果未就绪，显示友好提示而不是直接报错
     */
    if (player.api.isReadyForPlayback !== undefined && !player.api.isReadyForPlayback) {
        console.warn('[播放] ⏳ 播放器尚未完全就绪，尝试播放...');
        /* 不再阻止播放，让AlphaTab自己处理 */
    }
    
    console.log('[播放] 当前状态: playing=', player.playing);

    if (player.playing) {
        /* 当前正在播放 → 暂停 */
        try {
            player.api.pause();
            player.playing = false;
            console.log('[播放] ✅ 已暂停');
            
            /* 更新按钮为"播放"状态 */
            var btn = document.getElementById('btnPlay-' + id);
            if (btn) {
                btn.textContent = '▶ 播放';
                btn.classList.remove('playing');
            }
        } catch (e) {
            console.error('[播放] ❌ 暂停失败:', e);
        }
    } else {
        /*
         * ====== 互斥播放：停止所有其他正在播放的谱例 ======
         * 当用户点击播放新谱例时，自动停止所有其他正在播放的谱例
         * 避免多个音频同时播放造成混乱
         * 
         * 实现原理：
         * 1. 遍历 AppState.players 中所有谱例
         * 2. 找到所有正在播放且不是当前谱例的（otherId !== id）
         * 3. 调用 stopPlay(otherId) 停止它们
         * 4. 更新它们的按钮状态为"▶ 播放"
         */
        console.log('[互斥] 🛑 开始检查并停止其他正在播放的谱例...');
        var stoppedCount = 0;
        var allPlayerIds = Object.keys(AppState.players);
        
        for (var i = 0; i < allPlayerIds.length; i++) {
            var otherId = allPlayerIds[i];
            
            /* 跳过当前要播放的谱例 */
            if (otherId === id) continue;
            
            var otherPlayer = AppState.players[otherId];
            
            /* 如果这个谱例正在播放，则停止它 */
            if (otherPlayer && otherPlayer.playing) {
                console.log('[互斥] 🛑 正在停止谱例:', otherId);
                
                try {
                    /* 停止播放 */
                    otherPlayer.api.stop();
                    otherPlayer.playing = false;
                    
                    /* 更新按钮状态 */
                    var otherBtn = document.getElementById('btnPlay-' + otherId);
                    if (otherBtn) {
                        otherBtn.textContent = '▶ 播放';
                        otherBtn.classList.remove('playing');
                    }
                    
                    stoppedCount++;
                    console.log('[互斥] ✅ 已停止谱例:', otherId);
                } catch (stopError) {
                    console.error('[互斥] ❌ 停止谱例失败 (' + otherId + '):', stopError);
                }
            }
        }
        
        if (stoppedCount > 0) {
            console.log('[互斥] ✅ 共停止了', stoppedCount, '个正在播放的谱例');
        } else {
            console.log('[互斥] ℹ️ 没有其他正在播放的谱例');
        }
        
        /* ====== 互斥播放结束 ====== */
        
        /* 当前未播放 → 开始播放 */
        console.log('[播放] 正在调用 api.play()...');
        try {
            /*
             * AlphaTab v1.8.1 播放方法
             * api.play() 从当前位置开始播放
             * 首次调用时从头开始播放
             * 返回值: boolean - true表示成功启动播放
             */
            var result = player.api.play();
            console.log('[播放] api.play() 返回结果:', result);
            
            if (result === false) {
                console.warn('[播放] ⚠️ 播放未能启动（可能正在播放或未就绪）');
                /*
                 * 尝试使用 v1.8.1 新增的 playPause() 方法
                 * 这个方法会自动判断当前状态并切换
                 */
                if (typeof player.api.playPause === 'function') {
                    console.log('[播放] 尝试使用 playPause()...');
                    player.api.playPause();
                    result = true;
                }
            }
            
            if (result !== false) {
                player.playing = true;
                console.log('[播放] ✅ 已开始播放!');
                
                /* 更新按钮为"暂停"状态 */
                var btn = document.getElementById('btnPlay-' + id);
                if (btn) {
                    btn.textContent = '⏸ 暂停';
                    btn.classList.add('playing');
                }
            }
        } catch (playError) {
            console.error('[播放] ❌ 播放失败:', playError);
            alert('播放失败: ' + playError.message + '\n\n请检查:\n1. 浏览器控制台是否有其他错误\n2. 是否已启动本地服务器 (node server.js)');
        }
    }
}

/**
 * 停止播放
 * AlphaTab v1.8.1: api.stop() 会停止播放并回到开头
 * 
 * @param {string} id - 谱例ID
 */
function stopPlay(id) {
    console.log('[播放] 停止播放:', id);
    var player = AppState.players[id];
    if (!player || !player.api) return;

    try {
        /*
         * AlphaTab v1.8.1 停止方法
         * api.stop() 会:
         * 1. 停止当前播放
         * 2. 将播放位置重置到开头（或播放范围的开头）
         */
        player.api.stop();
        player.playing = false;
        
        /* 更新按钮状态 */
        var btn = document.getElementById('btnPlay-' + id);
        if (btn) {
            btn.textContent = '▶ 播放';
            btn.classList.remove('playing');
        }
        
        console.log('[播放] ✅ 已停止并重置到开头');
    } catch (e) {
        console.error('[播放] 停止失败:', e);
    }
}

/**
 * 切换循环播放
 * AlphaTab v1.8.1: 可直接使用 api.isLooping 属性控制循环
 * 
 * @param {string} id - 谱例ID
 */
function toggleLoop(id) {
    var player = AppState.players[id];
    if (!player) return;

    player.looping = !player.looping;
    
    /*
     * AlphaTab v1.8.1 新增：使用 api.isLooping 属性
     * 直接设置 AlphaTab 内部的循环状态
     * 这样即使页面刷新或状态丢失，AlphaTab 也会保持循环设置
     */
    if (player.api.isLooping !== undefined) {
        player.api.isLooping = player.looping;
        console.log('[循环] 设置 api.isLooping =', player.looping);
    }
    
    var btn = document.getElementById('btnLoop-' + id);
    if (btn) {
        if (player.looping) {
            btn.classList.add('active');
            console.log('[循环] ✅ 已开启循环播放:', id);
        } else {
            btn.classList.remove('active');
            console.log('[循环] 已关闭循环播放:', id);
        }
    }
}

/**
 * 调整播放速度
 * AlphaTab v1.8.1: 使用 playbackSpeed 属性（0.5 = 50%, 1.0 = 100%, 2.0 = 200%）
 * 
 * @param {string} id - 谱例ID
 * @param {number} delta - 速度变化量（正数为加速，负数为减速）
 * 
 * 速度范围: 30-200 BPM
 * 调整步长: 10 BPM
 */
function changeTempo(id, delta) {
    var player = AppState.players[id];
    if (!player || !player.api) return;

    player.tempo = Math.max(30, Math.min(200, player.tempo + delta));
    
    /*
     * AlphaTab v1.8.1: playbackSpeed 是百分比（0.5 = 50%速度）
     * 计算公式: playbackSpeed = 当前BPM / 原始BPM
     * 这里假设原始速度是 60 BPM（需要从乐谱数据获取准确值）
     */
    player.api.playbackSpeed = player.tempo / 60;

    var display = document.getElementById('tempo-' + id);
    if (display) {
        display.textContent = '♩=' + player.tempo;
    }
    
    console.log('[调速] 速度调整为:', player.tempo, 'BPM (playbackSpeed:', player.api.playbackSpeed.toFixed(2), ')');
}

/**
 * 更新播放按钮的显示状态
 * @param {string} id - 谱例ID
 */
function updatePlayButton(id) {
    var btn = document.getElementById('btnPlay-' + id);
    var player = AppState.players[id];
    if (!btn || !player) return;

    if (player.playing) {
        btn.textContent = '⏸ 暂停';
        btn.classList.add('playing');
    } else {
        btn.textContent = '▶ 播放';
        btn.classList.remove('playing');
    }
}

// ========== 滚动监听 ==========
/**
 * 绑定滚动监听事件
 * 监听主内容区域的滚动，自动更新：
 *   1. 阅读进度条
 *   2. 当前高亮的导航项
 *   3. 已完成的章节标记
 */
function bindScrollListener() {
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateProgressBar();
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * 更新阅读进度条
 * 计算当前滚动位置占整个文档的比例
 */
function updateProgressBar() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    document.getElementById('progressBar').style.width = progress + '%';
}

/**
 * 更新当前高亮的导航项
 * 检测当前视口中最接近顶部的章节，高亮对应的导航链接
 */
function updateActiveNav() {
    var sections = document.querySelectorAll('.section');
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var currentId = null;

    for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        /* 章节顶部在视口上方100px以内视为当前章节 */
        if (rect.top <= 100) {
            currentId = sections[i].id;
        }
    }

    /* 移除所有active状态 */
    var allLinks = document.querySelectorAll('.section-list li a');
    for (var j = 0; j < allLinks.length; j++) {
        allLinks[j].classList.remove('active');
    }

    /* 设置当前章节为active */
    if (currentId) {
        var link = document.getElementById('nav-' + currentId);
        if (link) {
            link.classList.add('active');
            /* 标记为已完成 */
            AppState.completedSections[currentId] = true;
            link.classList.add('completed');
            saveState();
        }
    }
}

// ========== 状态持久化 ==========
/**
 * 保存状态到localStorage
 * 保存内容:
 *   - 已完成的章节列表
 *   - 练习检查清单勾选状态
 */
function saveState() {
    try {
        localStorage.setItem('guitar_tutorial_completed', JSON.stringify(AppState.completedSections));
        localStorage.setItem('guitar_tutorial_checklists', JSON.stringify(AppState.checklists));
    } catch (e) {
        /* localStorage不可用时静默失败 */
    }
}

/**
 * 从localStorage恢复状态
 */
function loadState() {
    try {
        var completed = localStorage.getItem('guitar_tutorial_completed');
        if (completed) {
            AppState.completedSections = JSON.parse(completed);
            /* 恢复已完成标记 */
            var ids = Object.keys(AppState.completedSections);
            for (var i = 0; i < ids.length; i++) {
                var link = document.getElementById('nav-' + ids[i]);
                if (link) {
                    link.classList.add('completed');
                }
            }
        }

        var checklists = localStorage.getItem('guitar_tutorial_checklists');
        if (checklists) {
            AppState.checklists = JSON.parse(checklists);
            /* 恢复检查清单勾选状态 */
            restoreChecklists();
        }
    } catch (e) {
        /* 数据损坏时静默失败 */
    }
}

/**
 * 保存练习检查清单状态
 * 遍历所有checkbox，将勾选状态存入AppState.checklists
 */
function saveChecklist() {
    var checkboxes = document.querySelectorAll('.practice-checklist input[type="checkbox"]');
    var checklistData = [];
    for (var i = 0; i < checkboxes.length; i++) {
        checklistData.push(checkboxes[i].checked);
    }
    AppState.checklists = checklistData;
    saveState();
}

/**
 * 恢复练习检查清单的勾选状态
 */
function restoreChecklists() {
    var checkboxes = document.querySelectorAll('.practice-checklist input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
        if (i < AppState.checklists.length) {
            checkboxes[i].checked = AppState.checklists[i];
        }
    }
}

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', init);
