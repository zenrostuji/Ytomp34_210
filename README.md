# Ytomp34[210]

> A modern Windows desktop video downloader based on the original Ytomp34 project.

Ytomp34[210] là phiên bản được phát triển và hoàn thiện lại từ project Ytomp34 gốc, tập trung vào trải nghiệm tải video trên Windows và đặc biệt là khâu xử lý media sau khi tải.

Mục tiêu của project là giữ lại hướng tiếp cận đơn giản của repo gốc, đồng thời giải quyết các vấn đề thực tế phát sinh trong quá trình sử dụng.

---

## 1. Vấn đề của phiên bản gốc

Một vấn đề đáng chú ý khi tải video từ các nguồn sử dụng adaptive streaming là video và âm thanh có thể được cung cấp dưới dạng hai stream riêng biệt.

Kết quả có thể trở thành:

```text
video.mp4
audio.m4a
```

thay vì một file video hoàn chỉnh:

```text
video.mp4
```

Đối với người dùng cuối, điều này gây bất tiện vì phải tự ghép audio và video trước khi sử dụng.

Ytomp34[210] giải quyết vấn đề này bằng cách đưa quá trình download và xử lý media vào cùng một pipeline:

```text
Video URL
    |
    v
   yt-dlp
    |
    +---- Video stream
    |
    +---- Audio stream
    |
    v
  FFmpeg
    |
    v
Final media file
```

Mục tiêu là:

```text
Một URL
    ↓
Một quá trình tải
    ↓
Một file media hoàn chỉnh
```

---

# 2. Những vấn đề Ytomp34[210] tập trung giải quyết

## 2.1. Tách audio và video

Project sử dụng `yt-dlp` để lấy metadata, format và download media.

Trong trường hợp nguồn cung cấp audio/video riêng biệt, FFmpeg được sử dụng để xử lý và ghép chúng thành output cuối cùng.

Thay vì:

```text
video.mp4
audio.m4a
```

mục tiêu là:

```text
video.mp4
```

Người dùng không cần tự chạy FFmpeg hoặc ghép hai file thủ công.

---

## 2.2. FFmpeg trên Windows

FFmpeg là thành phần quan trọng trong quá trình xử lý media.

Ytomp34[210] chuẩn bị Windows runtime cho:

```text
ffmpeg.exe
ffprobe.exe
```

nhằm hạn chế việc yêu cầu người dùng tự cài FFmpeg global và cấu hình PATH.

Project có cơ chế kiểm tra runtime trước khi tải/chuẩn bị lại.

Nếu FFmpeg đã tồn tại, build có thể báo:

```text
[prepare:win-runtime] FFmpeg runtime already present.
```

---

## 2.3. Download engine

Công cụ tải chính của project là:

### yt-dlp

`yt-dlp` chịu trách nhiệm:

- xử lý URL;
- lấy metadata;
- lấy danh sách format;
- lựa chọn chất lượng;
- tải video;
- tải audio;
- hỗ trợ các nguồn mà yt-dlp hỗ trợ;
- báo tiến trình download;
- xử lý retry theo cấu hình của application.

Ytomp34[210] không tự xây dựng một video downloader từ đầu mà sử dụng yt-dlp làm download engine.

---

## 2.4. Media processing

### FFmpeg

FFmpeg không phải download engine chính.

Nó được dùng cho các tác vụ xử lý media, đặc biệt là khi cần ghép:

```text
Video stream
+
Audio stream
```

thành:

```text
Final media
```

### ffprobe

`ffprobe` được sử dụng để đọc và kiểm tra thông tin media.

---

## 2.5. JavaScript runtime cho yt-dlp

Một số extractor hiện đại có thể cần JavaScript runtime.

Project có hỗ trợ Deno để cung cấp runtime cho các trường hợp yt-dlp cần thực thi JavaScript trong quá trình xử lý extractor.

Luồng tổng quát:

```text
Ytomp34[210]
      |
      v
   yt-dlp
      |
      +---- Extractor
      |
      +---- Deno (khi cần)
      |
      v
   Media URL
```

---

# 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Desktop framework | Electron |
| Frontend | React / Vite |
| Language | TypeScript |
| Download engine | yt-dlp |
| Media processing | FFmpeg |
| Media inspection | ffprobe |
| JS runtime hỗ trợ yt-dlp | Deno |
| Packaging | electron-builder |
| Windows installer | NSIS |
| Runtime | Node.js |

---

# 4. Pipeline hoạt động

Pipeline tổng quát:

```text
                         Ytomp34[210]
                              |
                              v
                            yt-dlp
                              |
                 +------------+------------+
                 |                         |
                 v                         v
            Video stream             Audio stream
                 |                         |
                 +------------+------------+
                              |
                              v
                           FFmpeg
                              |
                              v
                       Final media file
                              |
                              v
                           Output
```

Trong trường hợp media đã có đầy đủ audio/video trong cùng một stream, quá trình xử lý có thể đơn giản hơn.

Trong trường hợp audio và video được phân phối riêng biệt, FFmpeg đảm nhiệm phần xử lý/ghép phù hợp.

---

# 5. Kiến trúc tổng quát

```text
Electron
│
├── Renderer
│   └── UI
│
├── Main Process
│   ├── Download management
│   ├── yt-dlp executor
│   ├── FFmpeg management
│   └── Runtime management
│
├── yt-dlp
│   └── Download / extraction
│
├── FFmpeg
│   └── Media processing / merge
│
└── ffprobe
    └── Media information
```

---

# 6. Yêu cầu hệ thống

## Development

Khuyến nghị:

- Windows 10 hoặc Windows 11
- Node.js LTS
- npm
- Git

FFmpeg không nhất thiết phải được cài global nếu sử dụng runtime được project chuẩn bị.

---

# 7. Cài đặt

Clone project:

```bash
git clone <ORIGINAL_OR_DERIVED_REPOSITORY_URL>
cd Ytomp34_210
```

Cài dependency:

```bash
npm install
```

---

# 8. Development

Chạy development:

```bash
npm run dev
```

Các script cụ thể có thể được kiểm tra trong:

```text
package.json
```

---

# 9. Build Windows để test nhanh

Để tạo bản Windows unpacked:

```powershell
npm run build:win
```

Bản này phù hợp để kiểm tra:

- UI;
- Electron;
- yt-dlp;
- FFmpeg;
- download pipeline;
- merge audio/video;
- output file.

Đây là bản test nhanh, không phải installer dành cho người dùng cuối.

---

# 10. Build Windows Installer

Để tạo Windows Setup:

```powershell
npm run build:installer
```

Pipeline:

```text
npm run build
      |
      v
prepare:win-runtime
      |
      v
electron-builder
      |
      v
NSIS
      |
      v
Windows Installer
```

Installer được tạo bởi `electron-builder` với target NSIS.

Tên file có thể có dạng:

```text
Ytomp34_210 Setup 1.2.1.exe
```

Vị trí output phụ thuộc cấu hình trong:

```text
electron-builder.json
```

---

# 11. FFmpeg runtime

Windows runtime của project sử dụng:

```text
assets/bin/ffmpeg.exe
assets/bin/ffprobe.exe
```

Script chuẩn bị runtime:

```text
scripts/prepare-windows-runtime.cjs
```

Khi runtime đã tồn tại, script không cần tải lại.

Điều này giúp:

- giảm thời gian build;
- tránh download lại FFmpeg;
- tạo build có runtime cần thiết;
- giảm phụ thuộc vào FFmpeg global của hệ thống.

---

# 12. Cấu trúc project

Cấu trúc tổng quát:

```text
Ytomp34_210/
│
├── electron/
│   ├── main/
│   │   └── infrastructure/
│   │       ├── YtDlpExecutor.ts
│   │       ├── YtDlpInstaller.ts
│   │       └── FfmpegInstaller.ts
│   └── tsconfig.json
│
├── src/
│   └── ...
│
├── scripts/
│   └── prepare-windows-runtime.cjs
│
├── assets/
│   └── bin/
│       ├── ffmpeg.exe
│       └── ffprobe.exe
│
├── dist/
│   └── ...
│
├── build/
│   └── ...
│
├── electron-builder.json
├── package.json
├── package-lock.json
└── README.md
```

Các thư mục `dist/` và `build/` là output/generated data và không nên chỉnh sửa thủ công.

---

# 13. Troubleshooting

## 13.1. Download hoàn tất nhưng không có file output

Một lỗi điển hình:

```text
Download finished, but the final output file was not created.
```

Nguyên nhân cần kiểm tra đầu tiên:

1. FFmpeg runtime;
2. đường dẫn `ffmpeg.exe`;
3. quyền ghi thư mục output;
4. format được yt-dlp lựa chọn;
5. log của FFmpeg;
6. tên/đường dẫn file output.

Kiểm tra:

```text
assets/bin/ffmpeg.exe
assets/bin/ffprobe.exe
```

---

## 13.2. FFmpeg runtime không tồn tại

Chạy:

```powershell
npm run prepare:win-runtime
```

Sau đó kiểm tra lại:

```text
assets/bin/
```

---

## 13.3. Build báo EBUSY

Nếu gặp:

```text
EBUSY: resource busy or locked, rmdir
```

đặc biệt với:

```text
build\installer\win-unpacked
```

thì Windows đang giữ một file/thư mục.

Các nguyên nhân thường gặp:

- Ytomp34 đang chạy;
- Electron còn chạy nền;
- Explorer đang mở thư mục build;
- antivirus đang quét file;
- một process build trước đó chưa thoát.

Có thể đóng process Electron/Ytomp34:

```powershell
taskkill /F /IM Ytomp34.exe
taskkill /F /IM electron.exe
```

Sau đó chạy lại build.

Nếu cần xóa output cũ:

```powershell
Remove-Item -Recurse -Force .\build\installer
```

rồi:

```powershell
npm run build:installer
```

---

## 13.4. Vite CJS warning

Có thể xuất hiện:

```text
The CJS build of Vite's Node API is deprecated.
```

Đây là warning của Vite.

Nếu build vẫn kết thúc bằng:

```text
✓ built
```

thì warning này không phải nguyên nhân trực tiếp khiến build thất bại.

---

# 14. Định hướng thiết kế

Ytomp34[210] giữ định hướng đơn giản của project gốc.

Project không cố gắng biến thành một media management suite lớn.

Các ưu tiên chính:

- URL input rõ ràng;
- download đơn giản;
- audio/video được xử lý thành output phù hợp;
- FFmpeg được chuẩn bị tự động;
- UI gọn;
- Windows desktop experience;
- build dễ dàng;
- error handling rõ ràng.

Mục tiêu cốt lõi:

```text
Một URL
   ↓
yt-dlp
   ↓
Audio + Video
   ↓
FFmpeg
   ↓
Một file media hoàn chỉnh
```

Đơn giản nhưng thực dụng :3

---

# 15. Những gì project không tập trung vào

Ytomp34[210] không hướng tới việc trở thành:

- Video editor;
- Audio editor;
- Streaming server;
- Cloud storage;
- Media library phức tạp;
- Media transcoding suite.

Project tập trung vào:

```text
Download
+
Process
+
Merge
+
Output
```

---

# 16. Attribution

Ytomp34[210] được phát triển dựa trên project Ytomp34 gốc.

### Original project

**Repository:**  
`<ORIGINAL_REPOSITORY_URL>`

**Original author:**  
Tác giả của repository Ytomp34 gốc.

### Derivative project

**Project:** Ytomp34[210]

**Development / Maintainer nickname:**  
**Giao Hợp Chân Nhân**

Ytomp34[210] được phát triển nhằm cải thiện trải nghiệm sử dụng và xử lý các vấn đề thực tế của phiên bản gốc, đặc biệt là:

- audio/video bị tách thành hai file;
- xử lý FFmpeg trên Windows;
- chuẩn bị FFmpeg runtime;
- Windows build pipeline;
- packaging và installer;
- trải nghiệm sử dụng desktop.

Các phần kế thừa từ project gốc vẫn cần tuân thủ license và yêu cầu attribution của repository gốc.

---

# 17. License

Vui lòng kiểm tra license của repository Ytomp34 gốc trước khi phân phối lại project.

Nếu license gốc yêu cầu giữ copyright notice, license hoặc attribution, các yêu cầu đó phải được giữ nguyên trong các bản phân phối phù hợp.

---

# 18. Project status

Các mục tiêu chính:

```text
[✓] Windows desktop application
[✓] yt-dlp download engine
[✓] Audio/video stream handling
[✓] FFmpeg media processing
[✓] ffprobe media inspection
[✓] FFmpeg Windows runtime
[✓] Windows build pipeline
[✓] NSIS installer
[✓] Giao diện desktop
[ ] Further download reliability improvements
[ ] Further UI/UX improvements
```

---

# 19. Tóm tắt

Ytomp34[210] được xây dựng quanh một mục tiêu đơn giản:

```text
Cho URL vào.
Tải media.
Xử lý audio + video.
Nhận một file hoàn chỉnh.
```

Project sử dụng:

```text
Electron
   +
yt-dlp
   +
FFmpeg
   +
ffprobe
   +
Deno
```

Trong đó:

- **yt-dlp** là download/extraction engine;
- **FFmpeg** là media processing và merge engine;
- **ffprobe** dùng để kiểm tra thông tin media;
- **Deno** hỗ trợ JavaScript runtime cho các extractor cần thiết;
- **Electron** cung cấp desktop application;
- **electron-builder + NSIS** tạo Windows installer.

Điểm cải thiện quan trọng của Ytomp34[210] so với workflow của repo gốc là hướng tới việc biến:

```text
1 video download
    ↓
video + audio riêng
```

thành:

```text
1 video download
    ↓
1 file media hoàn chỉnh
```

Ytomp34[210] — download một video, nhận một file hoàn chỉnh. :3
