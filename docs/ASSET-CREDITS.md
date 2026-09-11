# Interface asset credits

Assets are bundled under `assets/` and served from the same origin. The installed offline cache removes repeat network dependence after the first complete load. No asset CDN is used.

## Icons

[Google Material Symbols Outlined](https://developers.google.com/fonts/docs/material_symbols), under [Apache License 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE). The 42 selected 24 px SVGs and complete license are vendored in `app/assets/material-symbols/`. Downloaded from Google's official repository on 9 September 2026; exact source URLs and SHA-256 hashes are recorded in `sources.json`. `app/icons.mjs` preserves the original paths and viewBoxes and maps the application's semantic names to Google names. Both `spark` and `assistant` resolve to **auto_awesome**; rewind uses **replay_10**.

The license is included with the local icon assets. Icons use local SVG paths, not a font or CDN, so no network or font-loading flash is required. The HSBC logo remains separate. Previously vendored Lucide assets are retained for historical reference and are no longer used in current builds.

## Fictional adviser portraits

The photographs represent fictional prototype characters, not identified HSBC staff or endorsements by the photographed people.

| Demo character | Photographer | Original photograph | Local asset |
| --- | --- | --- | --- |
| Priya, Relationship Manager | Christina @ wocintechchat.com | [Unsplash SJvDxw0azqw](https://unsplash.com/photos/SJvDxw0azqw) | `app/assets/portraits/priya.jpg` |
| Maya, financial adviser | Michael Dam | [Unsplash mEZ3PoFGs_k](https://unsplash.com/photos/mEZ3PoFGs_k) | `app/assets/portraits/maya.jpg` |

Used under the [Unsplash license](https://unsplash.com/license), downloaded 9 September 2026 and cropped to 256 × 256 for profile use. Attribution is retained here. The portraits do not imply that the pictured people supplied the fictional messages.

## Bank identity avatars

Bank-owned identity assets, retrieved from their public official websites on 9 September 2026. Logos identify institutions in a local fictional prototype; they are trademarks of their respective owners, not generic open-source icons. Original bytes are preserved in `app/assets/bank-logos/`; source URLs, formats and SHA-256 hashes are recorded in `sources.json`. All four are served as local asset files, with no runtime logo-service dependency.

| Bank | Public source | Local asset |
| --- | --- | --- |
| HSBC | [HSBC UK](https://www.hsbc.co.uk/) — official Apple touch icon | `hsbc.png` |
| Monzo | [Monzo press site](https://monzo.com/press) — official SVG favicon | `monzo.svg` |
| Starling | [Starling website](https://www.starlingbank.com/media/) — official favicon, checked against the [current brand update](https://www.starlingbank.com/about/branding-update/) | `starling.ico` |
| NatWest | [NatWest](https://www.natwest.com/) — official app/touch icon | `natwest.png` |

Account avatars preserve each mark’s original colours and proportions on a consistent white tile in both Vanilla and Premier. Adjacent bank names provide the accessible label; the logo images are decorative. Pots retain purpose icons because they are savings/planning containers rather than separately connected institutions.


## Fictional household portraits

Public Pexels photos, downloaded 9 September 2026 under the [Pexels license](https://www.pexels.com/license/). The names and financial stories are fictional; these images do not imply that the people pictured are HSBC customers, household members or endorsers. Images are local files, loaded from the same origin and cropped in CSS for circular avatars.

| Demo identity | Photographer | Source | Local file |
| --- | --- | --- | --- |
| Elena | Alimi Sandrine | [Portrait 29405854](https://www.pexels.com/photo/professional-portrait-of-smiling-middle-aged-woman-29405854/) | `app/assets/portraits/elena.jpg` |
| Aisha | Alimurat Üral | [Portrait 15026471](https://www.pexels.com/photo/portrait-of-a-woman-smiling-15026471/) | `app/assets/portraits/aisha.jpg` |
| Leo | RAHUL SINGH | [Portrait 34154570](https://www.pexels.com/photo/black-and-white-portrait-of-a-smiling-boy-34154570/) | `app/assets/portraits/leo.jpg` |

Source downloads: `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=400`. Photographs were visually inspected before use. New demo invitees retain initials rather than borrowing another participant’s face.

## Added household avatars · 10 September 2026

| Demo identity | Photographer | Public source | Local file |
| --- | --- | --- | --- |
| Ben, Jordan’s flatmate | Italo Melo | [Pexels 2379004](https://www.pexels.com/photo/portrait-photo-of-smiling-man-with-his-arms-crossed-standing-in-front-of-a-wall-2379004/) | `app/assets/portraits/ben.jpg` |
| Riley, Sam’s partner | nappy | [Pexels 2362887](https://www.pexels.com/photo/portrait-photo-of-woman-smiling-2362887/) | `app/assets/portraits/riley.jpg` |

Used under the [Pexels license](https://www.pexels.com/license/), checked 10 September. These fictional roles do not identify the photographed people or imply an endorsement. Images were visually inspected, embedded locally and framed with CSS. Jordan, Sam and Nia retain initials; the shared Number cards show no repeated names or membership sentences. Full names remain in accessible labels and the shared-pot detail.

## Story still plates · 10 September 2026

Public Pexels photographs downloaded under the [Pexels license](https://www.pexels.com/license/). They illustrate the setting or idea, not the fictional customer. No endorsement is implied. Files are local compressed JPEGs; no external requests occur during playback.

| Plate | Photographer / source | Local file |
| --- | --- | --- |
| Café hands | Ketut Subiyanto · [Person using espresso machine](https://www.pexels.com/photo/person-using-espresso-machine-4349825/) | `assets/stories/coffee.jpg` |
| Horizon | Владимир Кондратьев · [Mountain ridge, Pexels 3469060](https://www.pexels.com/photo/mountain-ridge-3469060/) | `assets/stories/horizon.jpg` |

Source downloads: `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=1000`. Both were visually inspected. Still plates remain static and share a single image between the claim and choice frames.


### Additional Story spec plates · 10 September 2026

Reused at the user’s explicit request from the supplied local component assets. The original reference files remain unchanged. These are project-provided assets; photographer and external licence information were not included in the local spec and are not inferred here.

| Plate | Provided source, relative to `Shared assets/Component documentation/` | Optimised local file |
| --- | --- | --- |
| Dunes / texture | `assets/story-plate-a.jpg` | `assets/stories/dunes.jpg` |
| Cooking hands | `assets/story-plate-b.jpg` | `assets/stories/cooking.jpg` |
| Reflection | `assets/plate-glass.png` | `assets/stories/reflection.jpg` |
| Conversation / hands | `assets/plate-room.jpg` | `assets/stories/conversation.jpg` |

Resized without enlargement to a maximum width of 1,100 px and encoded as JPEG at quality 82. No identity or endorsement is implied. The reference’s `plate-ridge.jpg` was not copied because it contains a visible watermark; the attributed Pexels horizon remains in use. The café-hands asset is retained as an alternative but is not currently assigned to a Story.

## Personal Pot examples (11 September 2026)

Pot artwork reuses the existing locally bundled `stories/horizon.jpg` (Sam’s family holiday), `stories/cooking.jpg` (Sam’s Time with friends), and the user-supplied `backgrounds/elena-family.png` (Elena’s family holiday). Their existing source attribution remains applicable. The photographs illustrate fictional goals, not booked plans. A customer's replacement photo is decoded and resized locally and is not sent to a remote service.
