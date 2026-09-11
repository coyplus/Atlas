# Morning review

The migrated app is in **`atlas-app/`**. The original prototype has been preserved.

## Open it

- On this Mac: **http://localhost:4174/?p=jordan&theme=vanilla**
- On a phone on the same Wi-Fi: **http://192.168.87.133:4174/?p=jordan&theme=vanilla**
- Component workbench: **http://localhost:4174/workbench.html**
- Support blueprint: **http://localhost:4174/support-blueprint.html**

The preview server is running. If it stops, double-click `Start Atlas.command` in the app folder, or run `npm run preview -- --port 4174` after building. The Mac must stay awake and reachable for the local phone URL to work. This is a local QR, not a published stakeholder link; the IP may change with the network.

![Local phone preview QR](phone-preview-qr.png)

Tap the **HSBC logo** to switch personas on a phone. Reload now retains saved changes; use **Reset this scenario** to return to the starting story. Edits are stored independently for each persona on this device.

## Suggested review route

1. **Jordan / Now:** inspect Safe to spend and the budget cards. The progress bars use the full card width and align at the bottom. Open Grocery budget → How it works. Review the benefit change, make the £100 manual contribution, and confirm that September remains at 0% while the October recovery becomes ready. Open AI to check the explanation and options.
2. **Sam:** play the recap, switch tabs and enter a pot while it continues. Review family groceries, family holiday and the emergency fund; check photos/initials and personalised benefits. Pause automation in a savings condition and inspect the manual contribution option.
3. **Elena:** check Premier contrast, floating AI shadow and human identity. Open Priya's note, shared pots, connected accounts and the investment condition.
4. **Alex:** enter the quiz from AI, ask for help on a question, return to the same step, finish and inspect points. Add and resize a Number.
5. **Shared interactions:** customise Now More and pot More; browse all accounts/products; try browser Back and Forward; reload after a saved change; inspect the workbench and blueprint.

## What still needs our devices

- Real iPhone/Android keyboard and safe-area behaviour.
- Installed HTTPS PWA launch and offline relaunch, especially Safari.
- Back gestures and audio interruptions from calls, lock screen or other apps.
- Hardware haptics. The current web enhancement is optional and browser-dependent.

A hosted HTTPS destination has not been selected or published. The deployment configuration and QR command are ready for that next step. See [verification](MIGRATION-REVIEW.md) and [architecture](ARCHITECTURE.md) for the exact migration scope and compatibility boundary.
