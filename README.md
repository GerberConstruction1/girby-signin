# girby-signin

GIRBY's sign-in and consent page, served by GitHub Pages at https://girby.gerber.build.

When Evan connects an AI app (Claude) to GIRBY's brain, the brain's sign-in server sends him here: he signs in with his
Gerber Microsoft work account, sees which app is asking, and allows or denies. Static files only, no build step.

Nothing secret lives here: the page carries only the girby Supabase address and its publishable key, which are public
by design. The page sets its own content policy (scripts from this site and one pinned, hash-checked supabase-js file),
sends no referrer, and refuses to show inside another site's frame.

The source of record is the private repo GerberConstruction1/girby (folder `signin/`). Updates come from there.
