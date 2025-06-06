# 이미지 변환 기능 Squoosh로 교체 작업 트러블슈팅 기록

## 1차 목표

`browser-image-compression` 라이브러리를 Squoosh의 WebAssembly(WASM) 기반 엔진으로 교체하여, 브라우저 단에서 고성능 이미지 변환 기능을 구현한다.

---

## 시도 1: `@squoosh/lib` 공식 라이브러리 설치

### 과정

- Squoosh의 공식 라이브러리인 `@squoosh/lib`를 설치하여 문제를 해결하고자 했다.
- `yarn add @squoosh/lib` 명령어 실행.

### 결과

- **실패**

### 원인

- `@squoosh/lib`는 오래전에 개발이 중단된 라이브러리로, 현재 사용 중인 최신 Node.js 버전과 호환되지 않는 엔진(engine) 요구사항을 가지고 있었다. 이로 인해 설치 단계에서 호환성 오류가 발생했다.

---

## 시도 2: WASM 파일을 직접 로드하여 사용

### 과정

- 라이브러리 설치가 불가능하므로, Squoosh의 핵심인 WASM 파일을 직접 가져와 사용하기로 결정했다.
- `unpkg.com` CDN에 있는 Squoosh의 WASM 파일을 `curl`을 통해 다운로드했다.
- WASM 모듈을 fetch하고, 컴파일 및 인스턴스화하는 로직을 `imageProcessor.ts`에 구현했다.

### 결과

- **실패**

### 원인

- 런타임에서 `expected magic word 00 61 73 6d` 오류가 발생했다.
- 이 오류는 다운로드한 파일이 유효한 WASM 바이너리가 아님을 의미한다.
- 확인 결과, `unpkg.com`의 URL은 실제 `.wasm` 파일이 아닌, WASM을 로드하는 역할을 하는 작은 크기의 HTML/JavaScript 파일을 반환했다.

---

## 시도 3: Squoosh GitHub 저장소의 WASM 파일 직접 사용

### 과정

- 올바른 WASM 바이너리를 얻기 위해, Squoosh의 공식 GitHub 저장소에 있는 raw 파일 URL을 통해 다시 다운로드했다.
- 파일 크기(수백 KB 이상)를 통해 이번에는 올바른 바이너리 파일이 다운로드되었음을 확인했다.

### 결과

- **실패**

### 원인

- "magic word" 오류는 해결되었으나, 런타임에서 `TypeError: WebAssembly.instantiate(): Import #0 "a": module is not an object or function` 라는 새로운 오류가 발생했다.
- Squoosh의 WASM 모듈은 Emscripten으로 컴파일되어, 실행 시 메모리 관리, 시스템 콜 등 복잡한 기능을 제공하는 JavaScript "glue" 코드를 필요로 한다. 이 "glue" 코드 없이 WASM 파일을 직접 인스턴스화하려고 시도했기 때문에, WASM이 필요로 하는 외부 모듈('a')을 찾지 못해 오류가 발생했다.

---

## 시도 4: `@squoosh/lib` 강제 설치 및 Webpack 설정 변경 (`craco`)

### 과정

- WASM 실행 환경을 직접 구현하는 것이 매우 복잡함을 인지하고, 다시 `@squoosh/lib` 라이브러리를 사용하는 방향으로 전환했다.
- `yarn add @squoosh/lib --ignore-engines` 명령어로 엔진 호환성 검사를 무시하고 강제 설치에 성공했다.
- 라이브러리 사용 시, `fs`, `path`, `os` 등 Node.js 전용 모듈을 찾지 못하는 컴파일 오류가 발생했다.
- Create React App의 Webpack 설정을 `eject` 없이 수정하기 위해 `craco`를 도입하고, `craco.config.js`에 Node.js 모듈에 대한 폴리필(polyfill) 설정을 추가했다.

### 결과

- **실패**

### 원인

- 컴파일 오류는 해결되었으나, 런타임에서 `TypeError: Cannot set property navigator of #<Window>` 오류가 발생했다.
- `@squoosh/lib` 내부에 포함된 오래된 브라우저(Safari 12)를 위한 호환성 코드가, 최신 브라우저에서는 보안상 수정이 불가능한 `window.navigator` 객체를 덮어쓰려고 시도하면서 충돌이 발생했다.

---

## 시도 5: `patch-package`를 이용한 라이브러리 코드 직접 수정

### 과정

- 라이브러리 내부 코드의 런타임 오류를 해결하기 위해 `patch-package`를 도입했다.
- `node_modules`에 있는 라이브러리 파일을 직접 수정하고, 변경 사항을 `.patch` 파일로 만들어 영구적으로 적용하고자 했다.

### 결과

- **실패**

### 원인

- `node_modules` 내부 파일을 직접 수정하는 것이 불안정했고, 수동으로 생성한 `.patch` 파일의 형식이 계속 `patch-package`의 요구사항과 맞지 않아 적용에 실패했다.

---

## 최종 결론 및 해결책: `jSquash` 도입

### 원인 분석

- `@squoosh/lib`는 더 이상 유지보수되지 않아 최신 개발 환경과의 호환성 문제가 누적되어 있다. 이를 해결하기 위해 폴리필, 설정 확장, 코드 패치 등 여러 방법을 시도했지만, 이는 매우 불안정하고 근본적인 해결책이 될 수 없다고 판단했다.

### 해결

- **`jSquash`** 라는 최신 라이브러리를 도입하기로 결정했다.
- `jSquash`는 Squoosh의 WASM 엔진을 가져와 **현대의 브라우저 및 웹 워커 환경에 맞게 재패키징**한 라이브러리로, 우리가 겪었던 모든 호환성 문제와 복잡한 설정 없이 Squoosh의 성능을 그대로 사용할 수 있게 해준다.
- 기존의 `@squoosh/lib`, `craco`, `patch-package` 및 관련 폴리필들을 모두 프로젝트에서 제거하고, `jSquash` 관련 패키지를 설치하여 코드를 재작성했다.

### 최종 구현

- **동적 디코더**: `file.type`을 확인하여 입력 파일의 포맷(JPEG, PNG, WebP, AVIF)에 맞는 디코더를 동적으로 선택하도록 구현했다.
- **안정성 확보**: `jSquash`의 인코더가 품질(`quality`) 옵션을 일관되게 지원하지 않는 문제를 인지하고, 해당 기능을 제외하여 안정적인 변환 로직을 우선적으로 완성했다.
- **UI/UX 개선**: 변환 가능한 모든 포맷을 UI에 노출하고, 현재 미적용된 품질 설정은 비활성화하여 사용자에게 명확한 정보를 전달하도록 했다.
- **결과**: 모든 호환성 문제를 해결하고, 원래 목표였던 Squoosh 기반의 안정적인 **다중 포맷 이미지 변환 기능**을 성공적으로 구현했다.
