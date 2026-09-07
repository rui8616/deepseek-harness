# Agent Note: Conversation window rebuild after incremental assembly failure

Status: implemented

English | [中文](2026-09-07-conversation-window-rebuild-on-assembly-failure.zh.md)

## Problem

The Session event feed isolates its subscribers: `notifySubscribers` logs a subscriber failure and continues. The per-Session Conversation binding subscribed to that feed adopted each published revision before assembling the change it carried. When incremental assembly threw, the feed swallowed the failure, the binding had already advanced its revision, and every later window still arrived contiguous — so the non-contiguous branch that rebuilds from the whole window never ran again.

The view then stayed frozen at the failing revision for the rest of the page lifetime while the feed, the Session snapshot, and Host projections kept updating. A running Turn still advanced the Step counts and timings that ride the `sessionStats` projection, and the composer still returned to its idle control at `turn/end`, so the transcript stopped at an early Step while every other surface reported a Turn that ran to completion.

## Decision

The binding adopts a revision only after assembly for that revision succeeded. `accept` applies prepend, append, and settle-assistant changes through one `applyChange` step; a throw is logged and routed into a whole-window rebuild, which discards the partially applied change and resumes the live tail. `replace` likewise builds the replacement window before recording its revision, so a failed rebuild leaves the binding behind the feed, the next window is non-contiguous, and that window routes into another rebuild instead of extending broken state.

Recovery is the binding's own responsibility because the feed cannot report the failure back: its publication is a synchronous fan-out with no result.

## Alternatives considered

**Let the failure propagate out of the subscriber.** Not adopted: the feed isolates subscribers by contract, and one Conversation binding's failure must not stop the Session snapshot, the queue mirror, or other bindings from observing the same publication.

**Reset only the Context that threw.** Not adopted: the assembler owns cross-Context dependencies and a location index, so a partially applied change can leave state that no single Context owns. `replaceWindow` already clears and rebuilds every Context from the window.

**Record a broken flag and stop publishing.** Not adopted: that makes the frozen transcript permanent by design, which is the defect this note fixes.

## Testing

`conversation-registry.client.spec.ts` appends three events where assembly throws once on the middle one, then asserts the rebuilt window represents both updates. Without this change the spec fails with the feed's own `event feed subscriber failed` message — the same line observed in the browser console when a transcript froze.

## Consequences

A transient assembly failure costs one whole-window rebuild instead of freezing the transcript for the rest of the page lifetime. The rebuild is proportional to the window and runs only on the failing publication. The underlying throw stays visible in the console and still needs its own fix; this decision covers the recovery path alone.
