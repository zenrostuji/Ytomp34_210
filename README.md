# Ytomp34[210]

Ytomp34[210] là phiên bản Windows desktop được phát triển dựa trên [Ytomp34](https://github.com/NTL0210/Ytomp34), tập trung vào việc cải thiện quá trình tải và xử lý video.

## Điểm cải thiện

Một vấn đề trong workflow của phiên bản gốc là khi tải một video, audio và video có thể được lưu thành **hai file riêng biệt**:

```text
video.mp4
audio.m4a
```

Ytomp34[210] bổ sung quá trình xử lý bằng **FFmpeg**, hướng tới kết quả:

```text
video.mp4
```

Người dùng không cần tự ghép audio và video sau khi tải.

## Công nghệ

- **Electron** — Desktop application
- **yt-dlp** — Download và extraction media
- **FFmpeg** — Xử lý và ghép audio/video
- **ffprobe** — Kiểm tra thông tin media
- **Deno** — JavaScript runtime hỗ trợ yt-dlp khi cần
- **electron-builder / NSIS** — Đóng gói Windows

## Build

Cài dependencies:

```bash
npm install
```

Build bản Windows để test:

```powershell
npm run build:win
```

Build Windows Installer:

```powershell
npm run build:installer
```
Build bản linux Mint để test:

```powershell
npm run build:deb 
```

## Mục tiêu

Ytomp34[210] giữ cách sử dụng đơn giản của project gốc nhưng tập trung cải thiện:

- Audio/video bị tách thành hai file.
- Xử lý FFmpeg trên Windows.
- FFmpeg runtime.
- Windows build và installer.
- Trải nghiệm desktop.

Mục tiêu chính:

```text
URL → yt-dlp → Audio + Video → FFmpeg → Một file hoàn chỉnh
```

## Nguồn

Project này được phát triển dựa trên **Ytomp34** của **NTL0210** [ :3 ].

- **Original repository:** https://github.com/NTL0210/Ytomp34
- **Original author:** [NTL0210](https://github.com/NTL0210)
- **Derivative project:** Ytomp34[210]

Ytomp34[210] giữ attribution của project gốc và các thành phần kế thừa cần tuân thủ license của repository gốc.
