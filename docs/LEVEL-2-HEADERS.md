# Level 2 header system

All modal headers now pass through `src/design-system/screen-header.mjs`. Vanilla uses one geometry for navigated detail and journey screens: 58px header, 44px tap targets, 24px back glyph, 18px medium title, 12px gap, and shared page gutters. Titles align left and can use two lines. The standard feathered glass remains above scrolling content. Light and Premier use the same tokens and dimensions.

## Deliberate variations

| Surface | Leading control | Title | Trailing control | Reason |
| --- | --- | --- | --- | --- |
| Detail | Back | Screen name | None when the AI card is already present | Avoid duplicate AI entry points |
| Journey | Back | Stable task name | Contextual AI help | No AI card interrupts a task |
| Money check-in | Back to prior step; Back exits at the first/saved step | Money check-in | None | Reflection is offered within the task; a second AI entry point adds noise |
| Story | None | Story name | Playback, AI, Close | Playback is an immersive media experience |
| Conversation | Conversation identity | Accessible screen name | Close | Preserve the human/AI identity and return to the originating screen |
| Bottom sheet / Story evidence | Back only for nested content | Sheet name; optional context | Close | Dismiss an overlay while keeping the underlying screen |

Bottom-sheet titles and controls now share the same 18px/44px scale. Story media controls and conversation identity retain their purpose-specific layouts. Alternative Metro/Bento concepts keep their existing styling.

## Review coverage

Reviewed the common modal route used by accounts/pots, account information, activities, agreements/recovery follow-ups, rules, settings, number gallery and detail, payments/transfers, quiz, portraits, check-in, planning and reviews. Removed the journey-specific 17px and check-in-specific 13px title overrides. Check-in no longer hides its help control with CSS; its header explicitly opts out. The same options set the correct Back action for each check-in step.

Browser checks measure shared geometry across accounts, rules, settings, gallery, transfers, quiz, portrait, check-in and planning in both light and Premier. Existing Story, evidence, quiz-help, conversation and browser-navigation tests cover the intentional exceptions.

## Navigation ownership

Now / Future / You navigation is present only on the three primary screens. Shared modal ownership hides it from layout, accessibility and keyboard interaction for all detail screens, guided journeys, conversations and nested agreement sheets, across all visual directions. Closing a child preserves the parent’s ownership; returning to a primary screen restores the tabs and reading position. Detail screens extend to the bottom safe area rather than reserving a navigation-sized gap.

Standalone Companion messages use regular 16px type with room to wrap. When a secondary line is present, the headline retains its stronger weight.
