# A11y Element 직렬화 출력

## 1. 목적

본 문서는 A11y Element(접근성 노드) 를 사람이 읽기 쉬운 형태로 직렬화(serialize) 출력할 때, 속성의 그룹핑(grouping)과 표시 순서(ordering) 를 일관되게 정의하기 위한 규격이다.

본 스펙의 목표는 다음과 같다.
1. 동일한 A11y Element는 언제 출력해도 항상 동일한 구조/순서로 표시된다.
2. 사용자는 출력만 보고도 무엇(role) / 무엇의 이름(name) / 현재 상태(state) / 값(value) / 관계(relationship) 를 빠르게 파악할 수 있다.
3. 간편한 디버깅을 위해 간결하게 표현하나, 명시적으로 표현할 수 있는 출력모드도 제공한다.

## 2. 의도

전반적인 순서는 Firefox의 [Accessibility Inspector](https://firefox-source-docs.mozilla.org/devtools-user/accessibility_inspector/index.html)로부터 영향을 받았습니다.

### 2.1 1차 의도: 사람 기준의 "즉시 이해"

사용자는 한 줄만 보고도 해당 노드의 핵심을 파악해야 한다.
따라서 핵심 식별 정보인 role + name을 최우선 배치하고, name/description/value 같은 [Core 정보](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)를 헤더 1줄에 농축한다.

### 2.2 2차 의도: 디버깅 친화(문제의 원인에 가까운 순서)

A11y 결함은 대체로 다음 순서에서 발견된다.

1. 역할(role)이 맞는가
2. 이름(name)이 맞는가
3. 현재 상태(state)가 맞는가(disabled/expanded/checked 등)
4. 관계(relation)가 끊겼는가(labelledby/controls 등)
5. 라이브 리전 정책이 의도대로인가(aria-live 등)

따라서 출력 순서는 "정적 설명"보다 "현상/상태 → 연결 관계 → 알림 정책"을 우선으로 둔다.

### 2.3 3차 의도: 비교(diff) 안정성 및 결정적 출력

동일한 입력은 언제나 동일한 텍스트를 생성해야 한다.
속성 출력은 반드시 결정적 정렬(deterministic ordering) 을 보장한다.

### 2.4 4차 의도: 노이즈 억제

순수 텍스트 노드는 사람이 읽을 때 가장 큰 노이즈 원인이므로, 최소 표현 "name"만 허용한다.
레거시/디프리케이트 속성은 "정보는 남기되" 기본 가독성을 해치지 않도록 후순위로 밀어낸다.

compact mode를 기본으로 하여 불필요한 depth 노드나 null 값을 가진 aria 정보들은 표시하지 않는다.

## 3. 범위

본 스펙은 다음을 다룬다.
1. A11y Element 헤더 1줄 표현 규칙(ROLE/NAME 및 Core 정보 통합)
2. 속성 그룹 정의 및 그룹 간 출력 순서
3. 그룹 내부 정렬 규칙(결정적 정렬)
4. 관계(relationship) 속성의 참조 표현
5. 라이브 리전(live region), 드래그 앤 드롭(drag-and-drop) 속성의 별도 취급
6. 텍스트 기반 직렬화 포맷 정의
7. compact/verbose 출력 모드 정의

본 스펙은 다음을 다루지 않는다.
1. Accessible Name/Description 계산 알고리즘의 구현 상세
2. 브라우저/플랫폼 접근성 API와의 완전한 매핑 표준
3. UI 렌더링(색상/아이콘/접기-펼치기) 상세 가이드

## 4. 규범 용어(준수 수준)

- MUST: 반드시 구현해야 함
- SHOULD: 권장(합리적 이유로 예외 가능)
- MAY: 선택 구현


## 5. 출력 타입 및 모드

본 스펙은 텍스트 기반 직렬화를 규정한다.

- Compact 모드: 값이 비어있는 항목/그룹은 생략한다. (MUST)
- Verbose 모드: 디버깅을 위해 일부 비어있는 항목도 명시할 수 있다. (SHOULD)

단, 순수 텍스트 노드는 모드와 무관하게 "name"만 출력한다. (MUST)

## 6. 최상단 표현 규칙(헤더)

### 6.1 비-텍스트 노드 헤더 포맷 (MUST)

비-텍스트 A11y Element는 반드시 다음 1줄을 출력한다.

형식:

```
<role>: "<name>" [ <core-suffix>...]
```

의도:

사람이 접근성 노드를 판단할 때 가장 먼저 보는 것은 role과 name이며,
Core 정보(description/value)는 "있으면 중요"하나 별도 섹션으로 분리하면 스캔 비용이 커지므로 헤더에 통합한다.

### 6.2 Core Suffix(헤더 내 Core 확장) (MUST/SHOULD)

헤더에는 name 외에 다음 Core 정보를 “한 줄 안에서” 추가할 수 있다.

`[value=<value>]` (value가 있을 때 SHOULD 출력)
`[desciption="<description>"]` (description이 있을 때 SHOULD 출력)

권장 표기(가독성/파싱 용이)
suffix들은 공백으로 구분하고, `[키=값]` 형태를 유지한다.


예:

```
button: "저장" [desciption="설정을 저장합니다"]
slider: "볼륨" [value=75]
textbox: "검색" [value="aria spec"]
```

Compact 규칙
- value/desciption이 없으면 suffix는 생략한다. (MUST)

Verbose 규칙
- 구현체가 필요하다고 판단하면 desc/value가 비어있을 때도 desc=null, value=null로 표기할 수 있다. (MAY)
- 단, 헤더는 반드시 1줄이어야 한다. (MUST)

### 6.3 문자열 이스케이프 (MUST)

name/description/value가 문자열인 경우 `"`를 포함할 수 있으므로 다음을 MUST 적용한다.
출력이 로그/콘솔/스냅샷 테스트에서 파싱 가능하고 안정적으로 유지되도록 하기 위함이다.

- `"` → `\"`
- `\` → `\\`
- 줄바꿈 → `\n`

## 7. 순수 텍스트 노드 규칙
### 7.1 표현 (MUST)

순수 텍스트 노드는 반드시 다음 형태로만 출력한다.

```
"<name>"
```

예:

```
"로그인"
"필수 항목입니다."
```

### 7.2 순수 텍스트 노드 판정 기준 (MUST)

다음 조건을 모두 만족하면 "순수 텍스트 노드"로 간주한다.

1. role이 텍스트 전용 역할로 분류되거나(예: text, staticText 등), 혹은 구현 모델에서 "텍스트 노드"로 식별된다. (MUST)
2. 상호작용/상태/관계/라이브리전/드래그드롭 등 추가 의미 있는 속성 그룹이 비어있다. (MUST)
3. 출력해야 할 핵심 정보가 name(텍스트) 외에 없다. (MUST)

의도:
텍스트 노드는 접근성 트리에서 수가 많고, role/속성을 붙이면 노이즈가 급증한다.
사람이 UI 문맥을 읽는 데 필요한 것은 텍스트 자체이므로 "name"만 남겨 가독성을 극대화한다.

### 7.3 예외: 텍스트처럼 보이지만 의미가 있는 노드 (SHOULD)

다음 중 하나라도 해당하면 순수 텍스트 노드로 처리하지 말고 일반 노드 규칙(헤더 role: "name" + 그룹)을 적용한다. (SHOULD)

1. live region 정책을 가진다
2. 관계 속성(labelledby/controls 등)을 가진다
3. 상태(disabled/selected 등)를 가진다

의도:
"텍스트처럼 보이지만 사실상 의미/상태/관계를 가진 노드"는 디버깅 포인트가 될 수 있어 정보를 숨기면 안 된다.

예:

```
generic: "업데이트 알림"
  - live-region: [live="polite"] [atomic=true]
```

## 8. 상세 섹션(그룹) 출력 규칙
### 8.1 그룹 출력의 기본 구조 (MUST)

헤더 다음 줄부터 필요한 경우에만 그룹을 출력한다.
그룹은 2가지 형태를 허용한다.

그룹 구조:

```
  - <GroupName>: [<key>=<value>] ... 
```

```
  - <GroupName>:
    <key>: <value>
    <key>: <value>
```

- 상세블록은 `- <block>:` 형태로 구분한다 (MUST)
- 들여쓰기:
    - 그룹 헤더는 2칸, 항목은 인라인 (MUST)
    - 그룹 헤더는 2칸, 항목은 4칸 (MUST)
- 값 표기: 불리언/수치/문자열/배열을 명확히 구분 (MUST)


### 8.2 그룹 출력 순서 (MUST)

그룹은 반드시 아래 순서대로 출력한다.

1. `states`: “현재 사용자 경험”을 즉시 결정한다(지금 누를 수 있는가? 펼쳐졌는가?).
2. `properties`: 지켜야 할 지속적 속성을 보강
3. `relations`: name/description이 왜 그렇게 계산되는지, 컨트롤-대상 연결이 맞는지의 핵심 근거가 된다.
4. `live-region`: “알림 정책”으로, 동작은 중요하지만 특정 컴포넌트에서만 등장하므로 후순위로 둔다.
5. `drag-and-drop`: 레거시/희소성이 높아 후순위로 둔다.
6. `others`: 엔진/플랫폼 덤프 등에서 필요한 기타 정보가 있다면 최후에 둔다.


의도:

states는 "현재 상태" 성격의 속성들을 표현한다. (예: disabled, expanded, checked 등)
ARIA는 state와 property를 구분하되, state는 사용자 상호작용으로 더 자주 바뀌는 경향이 있다는 점을 명시한다. 
따라서 직렬화에서도 state는 "변화/디버깅 빈도"가 높으니 앞쪽에 두었다.

그 다음이 property(특성)입니다(예: haspopup, orientation, multiselectable, range 속성 등).
state/property 경계가 절대적 규칙은 아니지만, "디버그 시점에서 상태보다 덜 휘발적인 정보"가 여기로 모이면 읽기  편하다.
라벨/설명 참조, 컨트롤 관계 등은 보통 문제의 원인(이름이 이상함, 읽는 순서가 이상함, 컨트롤-패널 매핑이 끊김)에 직결되므로 states/properties 다음으로 고정한다.

aria-live, aria-atomic, aria-relevant, aria-busy는 알림/발화에 영향을 주는 정책이라 별도 그룹이 유리하다. WAI‑ARIA taxonomy도 Live Region Attributes를 독립 범주로 둔다.
Drage-And-Drop도 동일.

### 8.3 모드와 그룹 표기

- Compact 모드에서는 비어있는 그룹은 출력하지 않는다. (MUST)
- Verbose 모드에서는 필요 시 비어있는 그룹을 출력할 수 있다. (MAY)
  단, 과도한 노이즈를 방지하기 위해 기본값은 “비어있으면 생략”을 권장한다. (SHOULD)


## 9. 그룹별 키/값 및 정렬 규칙

### 9.1 States 그룹

의도: "지금 어떤 상태인가"는 접근성 버그의 1차 원인이므로 상위에 배치한다.
권장 state 우선순위(존재하는 경우 이 순서로 출력) (SHOULD)

1. visibility/availability:: hidden, disabled
2. interaction:: focusable, focused, modal
3. toggle/selection: expanded, pressed, checked, selected, current
4. validation: invalid, required, readonly
5. busy: busy

나머지 state:
사전식 정렬로 뒤에 출력 (MUST)

형태는 `[레이블=값]`인 한 줄로 처리하며, 값은 boolean/enum을 사용한다. (SHOULD)

```
button: "저장"
  - states: [hidden=true] [expaned="true"] [invalid="true"]
```

### 9.2 Properties 그룹

의도: 위젯의 구성 파라미터(예: 범위, 방향, 팝업 유무)를 확인한다.
예: haspopup, orientation, multiselectable, valuemin/valuemax/valuenow, autocomplete 등

정렬: 사전식 정렬 (MUST)

구현체는 위젯별 중요 키를 상단에 고정하는 "프로파일"을 둘 수 있다. (MAY)

형태는 한줄로 처리하고, state와 같이 `[레이블=값]` 형태 (SHOULD)

### 9.3 Relationships 그룹

의도: name/description의 근거, 컨트롤-대상 연결, 탐색 흐름을 분석한다.

표현 규칙
- 관계 값은 여러줄로 출력한다.  (MUST)
- 출력 값는 가능하다면 resolved된 형태를 사용하며 참조 키를 `(<참조>)`로 표시한다. (SHOULD)

예:
```
button:
  - relations:
    controls: "Settings Panel" (#panel)
```

정렬:

키: 사전식 정렬 (MUST)

### 9.4 Live Region 그룹

의도: 동적 업데이트가 AT에 어떻게 공지되는지(또는 억제되는지)를 파악한다.

권장 키:

1. live ("off" | "polite" | "assertive")
2. atomic (boolean)
3. relevant (string 또는 배열)
4. busy (boolean)

정렬:

권장 우선순위: live → atomic → relevant → busy (SHOULD)

그 외는 사전식 정렬 (MUST)

### 9.5 Drag-and-Drop 그룹

의도: 레거시/희소 속성은 제공하되 기본 가독성을 해치지 않게 후순위에 둔다.

권장 키:

1. grabbed
2. dropeffect


Deprecated 표기 (SHOULD)
구현 환경에서 deprecated로 판단되면 각 항목 또는 그룹에 deprecated 표기를 포함해야 한다.


예:
```
button: "드래그 앤 드롭 버튼"
  - drag-and-drop:
    grabbed: null (deprecated)
```

정렬:
- 사전식 정렬 (MUST)

### 9.6 Other 그룹

의도: 엔진/플랫폼 특화 메타정보를 덤프하되, 핵심 분석 흐름을 방해하지 않도록 마지막에 둔다.

예:
```
button: "메타데이터 버튼"
  - others:
    domNode: "button#save"
    backendNodeId: 12345
    computedRole: "button"
```

정렬:
- 사전식 정렬 (MUST)

## 11. 전체 출력 예시

### 11.1 일반 노드(버튼)

```
button: "저장" [description="설정을 저장합니다"]
  - states: [disabled=false] [pressed=false]
  - relations
    controls: "저장 설정" (#saveDialog)
  - others
    domNode: "button#save"
```

### 11.2 라이브 리전 포함 노드

```
status: "업데이트 알림" [description="백그라운드 작업 진행"]
  -live-region: [live="polite"] [atomic=true] [relevant="text"]
```

### 11.3 순수 텍스트 노드

"필수 입력 항목입니다."

### 11.4 텍스트처럼 보이지만 의미가 있는 노드(순수 텍스트로 처리 금지 예)

```
generic: "오류" [description="검증 실패"]
  - live-region: [live="assertive"]
```

## 12. 적합성(Conformance)

구현체는 아래 조건을 모두 만족해야 본 스펙 준수로 간주한다.

1. 비-텍스트 노드의 헤더는 반드시 role: "name" 1줄로 출력한다. (섹션 6)
2. description/value는 존재 시 헤더 1줄 내 suffix로 통합한다. (섹션 6.2)
3. 순수 텍스트 노드는 반드시 "name" 단독 형태로만 출력한다. (섹션 7)
4. 그룹이 출력되는 경우, 그룹 순서를 준수한다. (섹션 8.2)
5. 속성 정렬은 결정적이어야 하며, 최소 사전식 정렬 규칙을 준수한다. (섹션 9)