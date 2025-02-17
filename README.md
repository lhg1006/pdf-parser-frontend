# PDF Parser Frontend

PDF 문서에서 특정 영역의 텍스트를 추출하는 웹 애플리케이션입니다.

## 주요 기능

- PDF 파일 업로드 및 뷰어
- 메인 박스와 서브 박스를 통한 계층적 영역 선택
- 선택한 영역의 텍스트 추출
- 추출된 텍스트의 구조화된 표시
- 복사 기능

## 기술 스택

- Next.js
- TypeScript
- React-PDF
- React-Rnd
- Axios

## 시작하기

1. 저장소 클론
```bash
git clone https://github.com/lhg1006/pdf-parser-frontend.git
cd pdf-parser-frontend
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 사용 방법

1. PDF 파일 업로드
2. "메인 박스 추가" 버튼으로 주요 영역 선택
3. 메인 박스의 "+" 버튼으로 서브 영역 추가
4. 박스들의 위치와 크기 조정
5. "선택 영역 파싱" 버튼으로 텍스트 추출
