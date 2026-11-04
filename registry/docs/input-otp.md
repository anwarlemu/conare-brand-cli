---
name: input-otp
title: Input OTP
type: registry:ui
group: ui
description: "A one-time code in square 32px cells, Geist Mono digits, the cell being typed into edged in ink."
use_for: "Codes from a sign-in email or an authenticator app."
never:
  - "Passwords or keys"
  - "Cells that move focus on their own: it is one field"
source: "New in Conare's style: the field's hairline and ink focus (console2.css .v2-input), Geist Mono for codes"
files:
  - components/ui/InputOtp.vue
examples:
  - "Product | In the product | center"
---

One real input sits over the cells, so typing, paste, delete and the phone's code suggestion (`autocomplete="one-time-code"`) work as in any field. `length` sets the cells (6), `split` puts a gap after that many, `numeric` keeps digits only. It emits `complete` with the code once full. `invalid` edges every cell in red; say what is wrong under it. Cells are 40px on phones.
