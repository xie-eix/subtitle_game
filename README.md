# Before the Subtitle

一个以“语境优先”为核心的英语语感练习小游戏。

玩家不会直接看到英文答案，而是先阅读一段电影情节提示、空白前的英文对白、对应的中文字幕，以及空白后的对白。之后由玩家自己写出最符合人物关系、语气和上下文的一句英文。提交后，页面会展示玩家的答案与电影原句，方便比较两种表达。

这个项目不是单词拼写测试，也不以自动评分为目标。它更关注：

- 同一个中文意思，在真实对话中应该怎样说
- 哪些表达不能按照中文逐字翻译
- 人物关系、情绪和上下文如何改变一句英文
- 主动输出与参考字幕之间的差异

## 当前内容

- 50 道电影对白题
- 4 部电影
- 每道题包含 3 句前文和 2 句后文
- 简体中文提示
- 电影名称与上映年份
- 人物说话标签
- 中英文字幕来源和时间码
- 随机题序
- 自由文本输入，不评分、不上传答案
- 可关闭的简单音效

当前收录的电影：

- *When Harry Met Sally...*（1989）
- *Groundhog Day*（1993）
- *Before Sunrise*（1995）
- *Good Will Hunting*（1997）

## 在线访问

在 GitHub 仓库中开启 GitHub Pages 后，访问地址为：

<https://xie-eix.github.io/subtitle_game/>

开启方式：

1. 打开仓库的 **Settings**。
2. 进入 **Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 分支选择 `main`，目录选择 `/ (root)`。
5. 点击 **Save** 并等待约 1–2 分钟。

仓库中的 `.nojekyll` 文件用于跳过 Jekyll 处理，避免普通静态文件被 GitHub Pages 额外转换。

## 项目类型

这是一个纯静态网站，只使用：

- HTML
- CSS
- 原生 JavaScript
- 浏览器 Web Audio API
- 浏览器 `localStorage`

项目不需要后端、数据库、账号系统或 npm 依赖。网站不会保存玩家输入的答案。

## 文件结构

```text
.
├── index.html              # 页面结构
├── src/
│   ├── app.js              # 游戏逻辑、随机顺序、揭晓和音效
│   └── styles.css          # 页面样式与响应式布局
├── data/
│   └── questions.v1.js     # 所有题库数据和字幕来源
├── .nojekyll               # GitHub Pages 静态部署配置
└── README.md               # 项目说明与维护指南
```

## 本地运行

不需要安装依赖。

### 方法一：直接打开

双击 `index.html` 即可运行。当前版本已经支持 Edge 通过 `file://` 直接加载题库。

### 方法二：启动本地服务器

推荐使用本地服务器测试，因为其行为更接近 GitHub Pages。

在项目根目录运行：

```bash
python -m http.server 8000
```

然后访问：

```text
http://127.0.0.1:8000/
```

如果页面仍显示旧内容，请使用 `Ctrl + F5` 强制刷新。

## 游戏流程

1. 页面读取 `data/questions.v1.js`。
2. 题库被随机打乱。
3. 玩家先看到情节提示、电影名和年份。
4. 玩家可以同时看到空白前后的对白。
5. 玩家根据简体中文字幕和上下文输入英文。
6. 提交后显示玩家答案和电影英文字幕。
7. 点击下一题继续。

玩家的答案不会离开浏览器，也不会被发送到服务器。

## 如何增加题库

当前 GitHub 版本是纯静态发布包，没有单独的题库生成工具。因此新增题目时，需要直接编辑：

```text
data/questions.v1.js
```

### 编辑前准备

1. 先备份 `data/questions.v1.js`。
2. 使用 VS Code 或其他代码编辑器打开该文件。
3. 建议先执行“格式化文档”，让数组和对象按层级展开，便于定位逗号与括号。
4. 不要删除文件开头的这一部分：

```javascript
window.BEFORE_THE_SUBTITLE_QUESTIONS =
```

它告诉浏览器把数组注册为游戏题库。

### 题库文件的基本结构

文件整体应当保持下面的形式：

```javascript
window.BEFORE_THE_SUBTITLE_QUESTIONS = [
  {
    "id": "example-01"
    // 其他字段
  },
  {
    "id": "example-02"
    // 其他字段
  }
];
```

### 一道题包含的字段

```javascript
{
  "id": "example-movie-01",
  "film": "Example Movie",
  "year": 2026,
  "plotHint": "用简体中文说明此时发生了什么，以及人物之间的关系或情绪。",
  "dialogueBefore": [
    {
      "speaker": "Alex",
      "line": "First line before the blank."
    },
    {
      "speaker": "Sam",
      "line": "Second line before the blank."
    },
    {
      "speaker": "Alex",
      "line": "Third line before the blank."
    }
  ],
  "dialogueAfter": [
    {
      "speaker": "Sam",
      "line": "First line after the blank."
    },
    {
      "speaker": "Alex",
      "line": "Second line after the blank."
    }
  ],
  "blank": "______",
  "professionalZh": "需要玩家还原的那句台词的中文意思。",
  "professionalZhSource": "字幕文件中的原始中文文本。",
  "englishReference": "The film's reference English line.",
  "focus": "本题训练的表达重点，例如：give it a shot",
  "contextNote": "内部编辑说明，不会显示在游戏页面。",
  "subtitleSource": {
    "provider": "字幕来源平台",
    "chineseSubtitleId": "中文字幕编号",
    "chineseUploader": "中文字幕上传者",
    "chinesePage": "https://example.com/chinese-subtitle",
    "englishSubtitleId": "英文字幕编号",
    "englishUploader": "英文字幕上传者",
    "englishPage": "https://example.com/english-subtitle",
    "chineseTimecode": "00:01:00,000 --> 00:01:03,000",
    "englishTimecode": "00:01:01,000 --> 00:01:04,000",
    "scriptPage": "https://example.com/screenplay"
  }
}
```

### 字段说明

| 字段 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `id` | 字符串 | 是 | 每题唯一。推荐格式：`电影缩写-序号` |
| `film` | 字符串 | 是 | 电影英文名 |
| `year` | 数字 | 是 | 上映年份，不要加引号 |
| `plotHint` | 字符串 | 是 | 简体中文剧情提示 |
| `dialogueBefore` | 数组 | 是 | 空白前的对白，当前版本需要 3 句 |
| `dialogueAfter` | 数组 | 是 | 空白后的对白，当前版本需要 2 句 |
| `blank` | 字符串 | 是 | 固定填写 `"______"` |
| `professionalZh` | 字符串 | 是 | 页面直接显示的简体中文提示 |
| `professionalZhSource` | 字符串 | 建议 | 官方字幕中的原始文本，便于核对 |
| `englishReference` | 字符串 | 是 | 电影英文原句 |
| `focus` | 字符串 | 是 | 本题训练的语言点或语境重点 |
| `contextNote` | 字符串 | 建议 | 编辑备注，不会显示在页面中 |
| `subtitleSource` | 对象 | 是 | 中英文字幕及剧本来源 |

每一句对白都必须包含：

```javascript
{
  "speaker": "人物名称",
  "line": "English dialogue."
}
```

其中：

- `speaker` 写在英文对白上方，不能留空。
- 两人在同一字幕条目里交替说话时，可以使用 `"Alex / Sam"`。
- `line` 应保留电影中的实际英文对白。

### 添加一道新题的步骤

1. 打开 `data/questions.v1.js`。
2. 找到数组末尾最后一个题目对象的右花括号 `}`。
3. 在最后一个对象后添加英文逗号 `,`。
4. 粘贴一份完整题目对象。
5. 修改所有内容，特别是 `id`、电影信息、对白和来源。
6. 确保 `dialogueBefore` 正好包含 3 个对象。
7. 确保 `dialogueAfter` 正好包含 2 个对象。
8. 确保最后一题后面没有多余逗号。
9. 保存文件并在浏览器中测试。

示意结构：

```javascript
window.BEFORE_THE_SUBTITLE_QUESTIONS = [
  {
    "id": "existing-question"
  },
  {
    "id": "your-new-question"
  }
];
```

### 新增题目后同步修改题数

当前页面中仍有三处手动写死的题数。增加或删除题目后，需要同步修改 `index.html`：

1. 顶部初始计数：

```html
<span id="sceneCount">Scene 1 / 50</span>
```

2. 完成页提示：

```text
You completed 50 free-writing prompts.
```

3. 页脚统计：

```html
<span>50 scenes · 4 films</span>
```

例如增加 10 题后，应把 `50` 改成 `60`，并检查电影数量是否也发生变化。

顶部计数在页面加载后会自动读取实际题数，但完成页提示和页脚仍然需要手动修改。

当前 `src/app.js` 还会拒绝加载少于 50 题的题库。如果准备制作少于 50 题的自己的版本，需要同步修改这段数量检查：

```javascript
if (!Array.isArray(data) || data.length < 50) {
  throw new Error("Question data is incomplete.");
}
```

### 检查题库是否生效

修改完成后：

1. 在本地启动服务器，或直接打开 `index.html`。
2. 使用 `Ctrl + F5` 强制刷新。
3. 确认新题能够出现。
4. 确认空白前后分别有 3 句和 2 句。
5. 确认人物名称正确。
6. 填写一句答案并提交。
7. 确认英文原句和字幕来源均正常显示。

如果页面空白，按 `F12` 打开浏览器开发者工具，查看 **Console** 中的错误。题库文件最常见的错误是：

- 少了逗号
- 多了逗号
- 少了 `}` 或 `]`
- 英文引号没有成对
- 文本中存在没有转义的英文双引号
- 文件开头丢失 `window.BEFORE_THE_SUBTITLE_QUESTIONS =`

## 出题标准

为了让题目真正训练语感，而不是变成普通中译英，建议遵守以下标准：

1. 中文提示应来自可靠的电影字幕，而不是机器翻译。
2. 把中文逐字翻译后，应该与电影原句形成明显差异。
3. 原句应当是真实、自然、符合人物关系的英语口语。
4. 前文和后文必须足以判断语气，不能只靠一句中文猜答案。
5. 题目不应依赖画面才能理解，不然只靠文字页会无解。
6. 情节提示应说明场景和情绪，但不要直接写出英文答案。
7. 同一电影不宜连续使用过多相似表达。
8. 优先选择固定搭配、短语动词、习语、语气词和语境化表达。

适合出题的典型例子包括：

- `get over yourself`
- `get in the way`
- `give it a shot`
- `this one is on me`
- `drop someone off`
- `fall for someone`
- `be in the mood for something`
- `take something back`

如果一个题目只需要把中文逐字替换成英文，通常不适合放进这个游戏。

## 字幕和引用说明

本项目使用短篇电影对白片段进行英语教学演示，并在数据中保留字幕来源、上传者、时间码和剧本页面。

上传或再次分发时请注意：

- 不要上传完整电影、完整字幕文件或完整剧本。
- 只保留教学所需的最短对白片段。
- 保留来源和署名信息。
- 如果要商用，需要重新确认字幕与电影片段的授权。
- 当前项目没有额外附加开源许可证；第三方字幕和电影台词的权利仍归各自权利人。

## 随机顺序与本地记录

题库会在浏览器中随机打乱，并把当前顺序保存到 `localStorage`。

使用的键包括：

```text
before-the-subtitle:index
before-the-subtitle:order
before-the-subtitle:sound
```

它们分别保存：

- 当前做到第几题
- 当前随机题目顺序
- 音效开关状态

重置当前进度：

- 在网址后添加 `?start=1`

重新生成随机顺序：

- 完成全部题目后点击 **Start again**
- 或按 `F12`，在 Console 中运行：

```javascript
localStorage.removeItem("before-the-subtitle:order");
location.reload();
```

彻底清除进度与音效设置：

```javascript
localStorage.clear();
location.reload();
```

## 部署到 GitHub Pages

1. 将修改提交到 `main` 分支：

```bash
git add .
git commit -m "Update question bank"
git push
```

2. 等待 GitHub Pages 自动更新。
3. 打开正式网址并强制刷新。

如果页面没有更新，可以在仓库的 **Actions** 或 **Settings → Pages** 页面查看最新部署状态。

## 部署到其他静态平台

也可以把下面这些文件作为网站根目录上传：

```text
index.html
src/
data/questions.v1.js
.nojekyll
```

兼容 Netlify、Cloudflare Pages 等静态托管平台。

注意：

- `index.html` 必须位于网站根目录。
- 目录名和文件名需要保持原样。
- GitHub Pages 的文件名区分大小写，`src/App.js` 与 `src/app.js` 不视为同一个文件。
- 如果平台显示项目为 `Private`，未登录用户可能无法访问；需要在平台设置中把生产部署改为 `Public`。

## 常见问题

### 页面提示题库无法加载

先检查 `data/questions.v1.js` 是否是有效 JavaScript，并确认文件开头仍为：

```javascript
window.BEFORE_THE_SUBTITLE_QUESTIONS =
```

### 新题没有出现

尝试：

1. `Ctrl + F5`
2. 清除当前网站的 `localStorage`
3. 检查是否把新题对象放进了数组内部

### 顶部题数和实际题数不一致

刷新页面。顶部计数会自动更新，但 `index.html` 中的完成页提示和页脚统计仍需手动修改。

### 人物名称不对

检查该题 `dialogueBefore` 和 `dialogueAfter` 中每一行的 `speaker`。同一条字幕中包含两人对话时，可写成 `"Alex / Sam"`。

### 中文字幕出现繁体

页面会直接显示 `professionalZh`。如果目标是简体中文，需要在新增题目时手动填写简体版本，并保留原始文本到 `professionalZhSource`。

### 同学打不开部署网址

依次检查：

1. 托管平台是否把项目设为 `Private`
2. 是否分享的是正式生产网址，而不是部署预览网址
3. 是否需要登录平台账号
4. 所在网络是否可以访问 GitHub Pages 或其他托管平台

## 贡献新题

新增题目时，建议在提交说明中写清楚：

- 电影名称
- 新增题目数量
- 题目训练的表达重点
- 使用的字幕来源

提交前至少完整试玩新题，并检查桌面与手机布局。
