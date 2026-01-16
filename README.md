# Claude_code_test

n8n 워크플로우 생성기 - Claude AI를 활용하여 자연어로 n8n 워크플로우를 만드는 웹 애플리케이션

## 기능

- 채팅 인터페이스를 통한 자연어 워크플로우 생성
- Claude AI가 자연어를 n8n 워크플로우 JSON으로 자동 변환
- 생성된 워크플로우를 n8n 인스턴스에 직접 저장
- 워크플로우 미리보기 및 JSON 복사 기능

## 기술 스택

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Claude API (Anthropic SDK)
- **워크플로우**: n8n API
- **배포**: Railway

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# n8n Configuration
N8N_API_KEY=your_n8n_api_key_here
N8N_URL=https://your-n8n-instance.railway.app

# Optional: App Configuration
NEXT_PUBLIC_APP_NAME=n8n Workflow Generator
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 사용 방법

1. 채팅 인터페이스에서 원하는 워크플로우를 자연어로 설명합니다
   - 예: "매일 오전 9시에 이메일을 보내는 워크플로우 만들어줘"

2. Claude AI가 자동으로 n8n 워크플로우 JSON을 생성합니다

3. 생성된 워크플로우를 미리보기로 확인합니다
   - 노드 개수, 연결 정보 확인
   - JSON 보기 및 복사 가능

4. "n8n에 생성하기" 버튼을 클릭하여 n8n 인스턴스에 워크플로우를 저장합니다

5. 생성된 워크플로우 링크를 통해 n8n에서 직접 확인하고 활성화할 수 있습니다

## 예제 프롬프트

- "매일 날씨 업데이트를 보내는 워크플로우 만들어줘"
- "웹훅으로 데이터를 받아서 Google Sheets에 저장하는 워크플로우"
- "RSS 피드를 매시간 확인하고 새 글이 있으면 Slack에 알림 보내기"
- "HTTP API에서 데이터를 가져와서 처리한 후 이메일로 전송"

## Railway 배포

### 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 추가하세요:

- `ANTHROPIC_API_KEY`
- `N8N_API_KEY`
- `N8N_URL`

### 배포

```bash
git add .
git commit -m "Add n8n workflow generator"
git push
```

Railway가 자동으로 빌드하고 배포합니다.

## API 키 발급

### Anthropic API 키

1. [Anthropic Console](https://console.anthropic.com/)에 가입/로그인
2. API Keys 섹션에서 새 API 키 생성
3. `.env.local`의 `ANTHROPIC_API_KEY`에 추가

### n8n API 키

1. n8n 인스턴스에 로그인
2. Settings > API 섹션으로 이동
3. API Key 생성
4. `.env.local`의 `N8N_API_KEY`와 `N8N_URL`에 추가

## 문제 해결

### "ANTHROPIC_API_KEY is not set" 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- API 키가 올바르게 입력되었는지 확인
- 개발 서버를 재시작

### "Cannot connect to n8n" 오류
- `N8N_URL`이 올바른지 확인 (https:// 포함)
- n8n 인스턴스가 실행 중인지 확인
- `N8N_API_KEY`가 유효한지 확인

### 워크플로우 생성 실패
- 생성된 JSON 구조를 확인
- n8n 로그에서 상세한 오류 메시지 확인
- 다른 프롬프트로 재시도
