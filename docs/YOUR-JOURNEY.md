# Your journey with us

A separate You module presents the three most recent recorded milestones. Each opens a bottom sheet; Explore your journey opens the complete history, newest first. Alex has two first steps, Jordan five milestones, Sam six and Elena six.

Milestones are edited around customer meaning: goals, everyday progress, important people and the relationship. Original event text remains in scenario data; the `story` object adds editorial copy, icon, optional historical figure and a link to the relevant current screen. Only recorded past events appear. Future appointments are not displayed as completed achievements. Dates retain their source precision, and events with partial dates keep their recorded order within the same period.

Historical numbers are dated and labelled. A historical Premier milestone opens current membership rather than setting the customer to an old tier. Pot links similarly open current details. Browsing the journey changes no financial or rewards state. The timeline is distinct from Points activity and challenge awards; this iteration uses the existing recorded milestone history rather than manufacturing events from every app action.

Implementation: src/features/journey contains the model, templates and styles. The command handler is src/features/commands/journey.mjs. Navigation uses the existing Level 2 header, secondary sheets and parent restoration.

Validation: 119 domain/interface tests, 177 data checks, and 24 Chromium/WebKit browser checks across Journey and Points passed. Checks include all four scenario histories, partial-date ordering, future-event exclusion, narrow layout, linked pot/member screens and back navigation.
