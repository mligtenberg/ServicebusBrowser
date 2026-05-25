# Hard-cancel active receivers on Workspace switch

When the user switches the active Workspace, all in-flight Service Bus / Event
Hub receivers, peek loops, and continuation-token reads belonging to the
previous Workspace are torn down. If anything is mid-load at the moment of
switch, the user is shown an explicit confirmation first; cancelling the
confirmation reverts the switcher to the previously active Workspace.

The rejected alternative was to keep receivers running in the background so
that a user could switch back later and find pages further along. That sounds
user-friendly but has real costs in this domain: Service Bus receivers hold
server-side state and message locks that expire on a timer, so a "backgrounded"
receiver in an unwatched Workspace can silently let locks lapse and
redeliver — surprising behaviour for a tool whose entire job is making message
state legible. It also creates ambiguous resource accounting (how many live
receivers does the app have? where?) and complicates the UI ("loading…" in a
Workspace the user can't see).

Hard-cancel keeps the invariant that the active Workspace is the **only**
place with live brokers, which makes the rest of the system simpler: inactive
Workspaces are pure persisted state, and the [continuation-token
behavior](../messages-reader-continuation-token-behavior.md) already provides
clean stopping points.
