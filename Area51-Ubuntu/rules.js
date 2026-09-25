/* State and rules are independent of the renderer and media playback. */
(function (root) {
  'use strict';
  const initial = () => ({ lights: false, raised: false, doors: false, loaded: false, tank: true });
  function plan(state, command) {
    const target = { ...state };
    let clip, outcome = null;
    switch (command) {
      case 'lights': target.lights = !state.lights; clip = target.lights ? 'lights-on' : 'lights-off'; break;
      case 'ship': target.raised = !state.raised; clip = target.raised ? 'raise' : 'lower'; break;
      case 'doors': target.doors = !state.doors; clip = target.doors ? 'doors-open' : 'doors-close'; break;
      case 'tank': target.tank = !state.tank; clip = target.tank ? 'fill' : 'drain'; break;
      case 'load':
        if (!state.raised) { clip = 'load-fail'; outcome = 'load'; }
        else { clip = 'load'; target.loaded = true; }
        break;
      case 'launch':
        // The unseen launch-with-lift-down case is a safe, local refusal.
        // It has no invented presidential report or animation.
        if (!state.raised) return { refusal: 'Das Schiff steht noch unter dem Hangarboden. RAISE SHIP hebt es an.' };
        if (!state.lights) { outcome = 'dark'; clip = state.doors ? 'launch-dark' : 'launch-closed'; }
        else if (!state.doors) { outcome = 'door'; clip = 'launch-closed'; }
        else if (!state.loaded) { outcome = 'ammo'; clip = 'launch-open'; }
        else { outcome = 'success'; clip = 'launch-open'; }
        break;
      default: return null;
    }
    return { command, clip, target, outcome };
  }
  const api = Object.freeze({ initial, plan });
  root.Area51Rules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
