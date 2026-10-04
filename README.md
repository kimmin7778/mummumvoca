# ClassVoca (mummumvoca) - 클래스카드 스타일 영단어 학습 웹 앱

> 클래스카드(Classcard) 스타일의 UI/UX와 학습 메커니즘을 제공하는 현대적인 반응형 영어 단어 학습 웹 애플리케이션입니다.

---

## ✨ 핵심 기능 (Features)

### 1. 📚 단어장 & 단어 관리 (CRUD & Batch Import)
- **개별 단어 편집**: 영단어, 품사, 한글 뜻, 영어 예문, 예문 해석, 생성 일시(`YYYY-MM-DD HH:mm:ss`) 기록 및 수정.
- **TXT 파일 일괄 가져오기**: Drag & Drop 또는 파일 업로드 지원. 구분자(콜론 `:`, 탭 `\t`, 쉼표 `,`, 이콜 `=`, 하이픈 `-`, 파이프 `|`) 자동 감지 및 실시간 미리보기 테이블 제공.
- **사전 API 자동완성 (Auto-Fill)**: Free Dictionary API 및 한국어 데이터베이스 연동으로 발음 기호, 예문, 한글 뜻 자동 완성.
- **맞춤 단어장 생성**: 선택한 단어들로 새로운 단어장 생성 및 TXT/CSV/JSON 내보내기.

### 2. 🎴 다양한 학습 모드 (Learning Modes)
- **암기 모드 (Flashcard Mode)**:
  - Framer Motion & 3D 카드 뒤집기 애니메이션 (클릭 또는 `Space`).
  - Web Speech API TTS 영단어 발음 재생.
  - 단축키 지원 (`Space`: 뒤집기, `←`: 알아요 / Known, `→`: 몰라요 / Study Again).
  - 3초 자동 재생(Auto-Play) 지원.
- **리콜 모드 (Recall Mode)**:
  - 4지선다형 퀴즈 게임.
  - Web Audio API 합성음 기반 정답 찰칵 Chime / 오답 비프음 소리 피드백.
  - 연속 정답 스트릭(Streak) 카운터.
- **스펠 모드 (Spelling Mode)**:
  - TTS 발음과 한글 뜻을 보고 영단어 타이핑.
  - 글자 수 및 첫 글자 힌트 제공.

### 3. 📝 시험 & 오답 노트 (Test & Review)
- **단어 시험 (Test Mode)**:
  - 10개, 20개, 50개, 전체 문항 선택 및 경과시간 타이머.
  - 80점 이상 합격(Pass) 축하 폭죽(Confetti) 애니메이션.
- **오답노트 & 재시험**:
  - 시험 제출 후 **"틀린 단어만 모아서 재시험 보기"** 1-Click 지원.
- **시험 성적표 히스토리**:
  - 응시 일시(`YYYY-MM-DD HH:mm`), 총 문항 수, 점수, 오답 단어 목록 자동 저장.

---

## 🚀 시작하기 (Getting Started)

### 설치 및 실행
```bash
# 클론하기
git clone https://github.com/kimmin7778/mummumvoca.git
cd mummumvoca

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 🛠️ 기술 스택 (Tech Stack)
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Sound & TTS**: Web Speech API (`window.speechSynthesis`), Web Audio API
- **Storage**: LocalStorage (Offline-First persistence)
- **Effects**: Canvas-Confetti
