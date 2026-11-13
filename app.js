// GIRBY sign-in and consent page (GIRBY brain design, approved 2026-11-12 15:15 ET; step 2).
// Supabase Auth's OAuth 2.1 server sends an AI client here with ?authorization_id=... The person signs in with
// their Gerber Microsoft work account (the girby project allows Microsoft only, Gerber's tenant only, no open
// sign-up), sees which app is asking, and allows or denies. Nothing is stored here but the sign-in session
// supabase-js keeps in this browser. All text from the server is set as text, never as HTML.
(function () {
  "use strict";
  var SUPABASE_URL = "https://xzzpqmegmpyvhjemldit.supabase.co";
  // The girby project's publishable key: public by design (it opens nothing in the brain; the brain's own rules decide).
  var PUBLISHABLE_KEY = "sb_publishable_i3wvezSTV2TtZUt3hECCBg_C3rLhfwF";

  var app = document.getElementById("app");
  var sb = window.supabase.createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  });
  var authorizationId = new URLSearchParams(window.location.search).get("authorization_id");

  function node(tag, props, kids) {
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "onclick") el.addEventListener("click", props[k]);
      else if (k === "className") el.className = props[k];
      else el.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (c) { el.append(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function render() { app.replaceChildren.apply(app, arguments); }
  function say(text, extra) { render(node("p", {}, [text]), node("p", { className: "muted" }, [extra || "Start again from your AI app."])); }
  function busy(on) { app.querySelectorAll("button").forEach(function (b) { b.disabled = on; }); }

  function backHere() {
    return window.location.origin + window.location.pathname + "?authorization_id=" + encodeURIComponent(authorizationId);
  }

  async function signIn() {
    busy(true);
    var r = await sb.auth.signInWithOAuth({ provider: "azure", options: { scopes: "email", redirectTo: backHere() } });
    if (r.error) say(r.error.message);
  }

  async function signOut() {
    busy(true);
    await sb.auth.signOut();
    showSignIn();
  }

  function showSignIn() {
    render(
      node("h1", {}, ["Sign in to GIRBY's brain"]),
      node("p", {}, ["Use your Gerber Microsoft work account."]),
      node("div", { className: "row" }, [node("button", { className: "primary", type: "button", onclick: signIn }, ["Sign in with Microsoft"])]),
    );
  }

  async function decide(allow) {
    busy(true);
    var opts = { skipBrowserRedirect: true };
    var r = allow
      ? await sb.auth.oauth.approveAuthorization(authorizationId, opts)
      : await sb.auth.oauth.denyAuthorization(authorizationId, opts);
    if (r.error || !r.data || typeof r.data.redirect_url !== "string") {
      say(r.error ? r.error.message : "The sign-in server gave no address to go back to.");
      return;
    }
    window.location.assign(r.data.redirect_url);
  }

  async function main() {
    if (!authorizationId) { say("This sign-in link is incomplete."); return; }
    var s = await sb.auth.getSession();
    var session = s.data && s.data.session;
    if (!session) { showSignIn(); return; }
    // Drop the one-time sign-in code from the address bar; keep the authorization id.
    window.history.replaceState(null, "", backHere());
    var d = await sb.auth.oauth.getAuthorizationDetails(authorizationId);
    if (d.error) { say(d.error.message); return; }
    var data = d.data || {};
    if (typeof data.redirect_url === "string" && !data.authorization_id) { window.location.assign(data.redirect_url); return; }
    var client = (data.client && (data.client.name || data.client.client_name)) || "This app";
    var email = (data.user && data.user.email) || (session.user && session.user.email) || "";
    render(
      node("h1", {}, ["Allow " + client + " to use GIRBY's brain?"]),
      node("p", { className: "muted" }, ["Signed in as " + email]),
      node("p", {}, [client + " will read and write GIRBY's memory as you: facts, decisions, procedures, tasks and handoffs. " +
        "It cannot see or change the Hub through this door. Every call is logged."]),
      node("div", { className: "row" }, [
        node("button", { type: "button", onclick: function () { decide(false); } }, ["Deny"]),
        node("button", { className: "primary", type: "button", onclick: function () { decide(true); } }, ["Allow"]),
      ]),
      node("button", { className: "link", type: "button", onclick: signOut }, ["Not you? Sign out"]),
    );
  }

  main().catch(function () { say("Something went wrong."); });
})();
