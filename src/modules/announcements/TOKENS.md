# Walkthrough reference tokens

These values were sampled from the eleven saved Pickup Times and Discounts exports. Repeated flat-fill pixels were used for colors; anti-aliased edge pixels were excluded.

| Token                  | Value                                                           | Use                                |
| ---------------------- | --------------------------------------------------------------- | ---------------------------------- |
| `surface`              | `#1A1919`                                                       | Coachmark and announcement surface |
| `divider`              | `#312623`                                                       | Header divider (`core-900`)        |
| `close`                | `#866F6E`                                                       | Close icon (`core-600`)            |
| `title`                | `#FFFFFF`                                                       | Header title                       |
| `body`                 | `#CCC8C8`                                                       | Body copy (`core-300`)             |
| `step`                 | `#9D8C8C`                                                       | Step counter (`core-500`)          |
| `back`                 | `#E5E4E4`                                                       | Back action (`core-200`)           |
| `action`               | `#BB5A02`                                                       | Next/Done (`primary-500`)          |
| `highlight`            | `#F9B324`                                                       | Circular/outline accent            |
| `overlay`              | `rgba(20, 17, 14, 0.62)`                                        | Four-panel dim layer               |
| `announcement-overlay` | `rgba(0, 0, 0, 0.55)`                                           | What’s New backdrop                |
| `shadow`               | `0 18px 42px rgba(20,17,14,.24), 0 4px 12px rgba(20,17,14,.18)` | Coachmark elevation                |
| `card-radius`          | `12px`                                                          | Coachmark corners                  |
| `card-width`           | `380px`                                                         | Desktop width, viewport-clamped    |
| `card-gap`             | `14px`                                                          | Target-to-card gap                 |
| `viewport-margin`      | `16px`                                                          | Minimum viewport inset             |
| `header-height`        | `48px` minimum                                                  | Separate header row                |
| `body-leading`         | `24px`                                                          | Coachmark copy line height         |
| `art-surface`          | `#14110E`                                                       | Illustration field                 |
| `art-shadow`           | `0 18px 20px rgba(0,0,0,.2)`                                    | Illustration depth shadow          |
| `glow-center`          | `rgba(218, 83, 26, 0.54)` at `0%`                               | Medium-strength radial glow        |
| `glow-mid`             | `rgba(169, 62, 20, 0.38)` at `34%`                              | Orange-brown glow body             |
| `glow-edge`            | `rgba(107, 42, 15, 0.22)` at `58%`                              | Glow transition                    |
| `glow-end`             | transparent at `78%`                                            | Radial glow end                    |
| `glow-blur`            | `26px`                                                          | Responsive glow blur               |
| `glow-opacity`         | `0.82`                                                          | Overall glow prominence            |

The PNG illustrations are transparent foreground cutouts from the saved 3× exports. Their glow is CSS, not baked into the assets.
