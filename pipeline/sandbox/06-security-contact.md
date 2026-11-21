fix: reject oversized or multi-line contact form names

## Goal
The contact form cannot be used to inject extra email headers or send abnormally large payloads.
## Acceptance criteria
- A name containing a newline or carriage return is rejected with a clear message
- A name over 100 characters and a message over 5000 characters are rejected
- A valid submission still works
