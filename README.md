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

## 라이선스

MIT License

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
