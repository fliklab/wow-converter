# <p align="center">WOW Converter</p>

<div align="center" style="margin-bototm: 8px;">
<img src="./public/logo_192.png" alt="WOW Converter Logo" width="128" style="border-radius: 16px;" />
</div>

---

[WOW Converter](https://wow-converter.com)는 빠르고 간편한 이미지 포맷 변환 및 최적화를 제공하는 웹 기반 도구입니다.

WOW는 **Web Optimization Wizard**의 약자로, 간편하지만 강력한 웹 최적화 도구를 지향합니다.

WebP, AVIF, MozJPEG 등 웹 친화적 포맷을 지원하며, 최적의 압축률과 리사이징을 통해 웹사이트의 성능을 극대화할 수 있습니다.

이미지를 서버로 전송하지 않고, 브라우저 내에서 모든 작업이 이루어지므로 안전하며, 다량의 이미지를 빠르게 한 번에 변환할 수 있습니다.

### 주요 특징

- 간편한 이미지 최적화 및 압축(리사이징, 포맷 변환)
- 다양한 이미지 포맷 지원: AVIF, WebP, MozJPEG 등
- 서버로 이미지를 보내지 않고 브라우저에서 이미지 처리를 수행합니다.

---

## Development

### How it works

브라우저 기반 이미지 처리를 위해 Squoosh의 핵심 코덱들을 WebAssembly로 포팅한 @jsquash 라이브러리를 사용합니다.

WebAssembly(WASM)를 통해 C/C++로 작성된 이미지 코덱을 브라우저에서 네이티브에 가까운 성능으로 실행할 수 있습니다.

주요 기술 스택:

- WebAssembly: Squoosh 코덱을 브라우저에서 실행하여 이미지 인코딩/디코딩 수행.
- Squoosh 코덱: WebP(libwebp), AVIF(libaom), MozJPEG 코덱을 WASM으로 컴파일하여 사용.
- React: 드래그 앤 드롭, 이미지 프리뷰, 설정 UI 등 컴포넌트 구현.
- TypeScript: 이미지 처리 및 상태 관리에 타입 안정성 제공.
- TailwindCSS: 반응형 레이아웃, 다크모드 지원.
- File API: 로컬 파일 읽기/쓰기 및 다운로드에 사용됨.

### Quick Start

이 프로젝트는 Node.js 환경에서 실행됩니다. 다음은 설치 방법입니다.

1. **Clone Project**:

   ```bash
   git clone https://github.com/yourusername/image-converter.git
   cd image-converter
   ```

2. **Install Dependency**:

   ```bash
   yarn install
   ```

## License

이 프로젝트는 Apache License 2.0을 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.
