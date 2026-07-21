/**
 * 행태 체크리스트 데이터 (Figma "행태 체크리스트 카드" — 계약 전/중/후).
 *
 * The 행태 체크리스트 was redesigned from a severity-signal list into a
 * category-tabbed list of positive confirmation actions ("~했어요"). Each
 * contract stage has its own set of category tabs and items:
 *
 *  - before (계약 전)  — Figma 179:2014  → wired into `pre-contract/behaviors.tsx`
 *  - during (계약 중)  — Figma 179:2730  → data ready; 계약 중 flow not built yet
 *  - after  (계약 후)  — Figma 179:3211  → data ready; 계약 후 flow not built yet
 */

export type ContractStage = 'before' | 'during' | 'after';

export type BehaviorCategory = {
  /** Segmented-tab label. */
  key: string;
  /** Section heading shown above the items (usually equals `key`). */
  heading: string;
  items: string[];
};

export const BEHAVIOR_CHECKLISTS: Record<ContractStage, BehaviorCategory[]> = {
  before: [
    {
      key: '계약 준비',
      heading: '계약 준비',
      items: [
        '집을 직접 방문했어요.',
        '집 내부 상태를 확인했어요.',
        '관리비 조건을 확인했어요.',
        '계약서를 충분히 읽었어요.',
        '특약 내용을 확인했어요.',
        '계약금 입금 전 등기부를 다시 확인해요.',
      ],
    },
    {
      key: '집주인',
      heading: '집주인 확인',
      items: ['계약 상대방이 등기부 소유자와 동일해요.', '대리 계약이라면 위임장을 확인했어요.'],
    },
    {
      key: '보증',
      heading: '보증',
      items: ['HUG 보증보험 가입 여부를 확인했어요.', '전세금 반환 보증 가입 계획이 있어요.'],
    },
    {
      key: '권리관계',
      heading: '권리관계',
      items: ['근저당 여부를 확인했어요.', '선순위 권리 여부를 확인했어요.', '공공담보 여부를 확인했어요.'],
    },
  ],
  during: [
    {
      key: '계약 진행',
      heading: '계약 진행',
      items: [
        '계약 당일 등기부를 다시 확인했어요.',
        '계약금은 계약 확인 후 지급했어요.',
        '계약서를 직접 보관해요.',
        '계약서 작성자가 집주인 또는 적법한 대리인이에요.',
      ],
    },
    {
      key: '계약 내용',
      heading: '계약 내용',
      items: ['특약이 포함되어 있어요.', '계약 기간을 확인했어요.', '보증금 금액을 다시 확인했어요.'],
    },
    {
      key: '보증',
      heading: '보증',
      items: ['HUG 보증보험 가입 여부를 확인했어요.', '전세금 반환 보증 가입 계획이 있어요.'],
    },
  ],
  after: [
    {
      key: '입주',
      heading: '입주',
      items: ['전입신고를 완료했어요.', '확정일자를 받았어요.', '실거주를 시작했어요.'],
    },
    {
      key: '보증',
      heading: '보증',
      items: ['보증보험 가입이 완료되었어요.', '보험증서를 보관중이에요.'],
    },
    {
      key: '계약 관리',
      heading: '계약 관리',
      items: ['계약 만료일을 알고있어요.', '만료 전 집주인과 연락할 계획이에요.'],
    },
    {
      key: '위험 모니터링',
      heading: '위험 모니터링',
      items: ['최근 등기부를 확인했어요.', '집주인의 반환 계획을 확인했어요.', '보증금 반환 절차를 알고 있어요.'],
    },
  ],
};
