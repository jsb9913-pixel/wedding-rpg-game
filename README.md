# Wedding Quest: 김원중 ♥ 조수빈

실제로 이동하고 점프하며 NPC와 대화해 초대장을 여는 3:4 모바일 청첩장 웹게임입니다. 사용자가 제공한 캐릭터 PNG와 통합 웨딩맵 배경을 중심으로 구성했고, 모바일 청첩장 링크로 자연스럽게 연결됩니다.

## 실행 방법

가장 간단한 방법은 이 폴더에서 정적 서버를 실행하는 것입니다.

```bash
python -m http.server 4173
```

그 다음 브라우저에서 `http://localhost:4173`을 엽니다. 파일만 열어도 대부분 동작하지만, 로컬 서버 실행을 권장합니다.

## 조작법

- PC: `←` / `→` 또는 `A` / `D` 이동
- PC: `↑` / `W` / `Space` 점프
- PC: `Enter` 대화/조사/진행
- PC: `Esc` 닫기
- 모바일: 화면 하단의 `←`, `→`, `JUMP`, `A`, `B` 버튼 사용

## 구현된 기능

- 3:4 비율 고정 게임 프레임
- PC 중앙 모바일 게임기형 레이아웃
- 모바일 터치 조작 버튼
- 넓은 웨딩 정원 맵과 카메라 스크롤
- 플레이어 좌우 이동, 방향 전환, 점프, 걷기/점프 애니메이션
- 신랑 김원중 NPC, 신부 조수빈 NPC 대화
- 룩북 캡처에서 추출한 하객 캐릭터 60종 랜덤 등장
- NPC 위 전구 아이콘과 웨딩 아치 위 책 아이콘으로 표시되는 퀘스트 상태 UI
- 제공된 주황버섯 PNG 몬스터 3마리 이동 및 말풍선
- 웨딩 아치 조사와 퀘스트 완료 처리
- 초대장 카드 모달 해금
- 모바일 청첩장 링크: `https://toourguest.com/cards/weddingws`
- 꽃잎 낙하, 초대장 해금 파티클

## 파일 구조

```text
wedding-rpg-game/
  index.html
  style.css
  game.js
  README.md
  assets/
    characters/
      lookbook-bride.png
      lookbook-groom.png
      guests/
        guest-01.png ... guest-60.png
    monsters/
      orange-mushroom.png
    objects/
      wedding-db-arch.png
    backgrounds/
      wedding-map-unified.png
    ui/
      quest-book.png
      quest-bulb.png
      sparkle.svg
```

## 에셋 출처와 라이선스

- SVG 에셋은 이 프로젝트를 위해 직접 제작한 오리지널 벡터입니다.
- 통합 웨딩맵 배경, 신랑/신부/하객 PNG, 주황버섯 PNG는 사용자가 제공한 이미지를 프로젝트 에셋으로 복사하거나 합성해 사용합니다.
- 게임 배경은 `wedding-map-unified.png` 한 장으로 통합해 배경과 오브젝트가 따로 놀지 않게 구성했습니다.
- 디자인 레퍼런스: [메애기 룩북](https://meaegi.com/lookbook).
- 공개 배포 전에는 사용자 제공 PNG의 사용 권한을 최종 확인하세요.

## localStorage 저장 구조

```js
// 하객 이름
localStorage["weddingRpg.profile"] = {
  guestName: "소중한하객"
}

// 퀘스트 진행
localStorage["weddingRpg.progress"] = {
  mission: {
    groom: true,
    bride: true,
    arch: true
  },
  invitationUnlocked: true
}

```

## DB 사용 여부

참석 관련 입력 기능은 모바일 청첩장에 있으므로 이 웹게임에서는 별도 DB를 사용하지 않습니다. 현재 배포는 정적 사이트만으로 충분합니다.

## Render 배포 설정

- 서비스 타입: Static Site
- Build Command: 비워두기
- Publish Directory: `.` 또는 저장소 내 `outputs/wedding-rpg-game`
- SPA Rewrite: 필요 없음
- 별도 서버리스 API는 현재 필요 없습니다.
