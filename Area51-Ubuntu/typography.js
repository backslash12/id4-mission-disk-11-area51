/* Resolution-independent lettering transcribed from the supplied playthrough.
 * The scene is video-derived, but every playable label and transmission is
 * drawn as SVG text with local outline fonts, even when displayed at 4K.
 */
window.Area51Type = (() => {
  'use strict';
  const svg = document.getElementById('vector-text');
  const NS = 'http://www.w3.org/2000/svg';
  let currentKey = '', scrolling = null;
  const reports = {
    intro: {
      top: 46, bottom: 400,
      lines: [
        [13, 109, 'TO: COMMANDER, AREA 51'],
        [14, 130, 'FROM: THE PRESIDENT'],
        [13, 170, 'YOU MUST NOW SUCCESSFULLY LAUNCH THE ALIEN FIGHTER.'],
        [13, 210, 'UNFORTUNATELY I KNOW YOU ARE SHORT-HANDED THERE...'],
        [14, 250, 'PVT. JONES WILL BLINDLY FOLLOW ALL THE COMMANDS YOU CHOOSE'],
        [14, 270, 'SO CHOOSE CAREFULLY.'],
        [13, 310, 'THE WORLD IS IN YOUR HANDS, COMMANDER.']
      ]
    },
    'report-load': {
      top: 34, bottom: 438,
      lines: [
        [47, 113, 'TO: THE PRESIDENT'], [48, 133, 'FROM: LT. COL. HASTY'],
        [47, 173, 'SIR, OUR INSTRUMENTS SHOW SOME SORT OF EXPLOSION'],
        [47, 212, 'AS HAVING HAPPENED IN AREA 51.'],
        [47, 253, 'SCOUTS APPROACHING THE AREA FOUND ONE SURVIVOR WHO'],
        [47, 294, 'IS BABBLING ABOUT THE COMMANDER GOING CRAZY AND'],
        [47, 333, 'LOADING ORDNANCE WITHOUT RAISING THE SHIP...'],
        [47, 373, 'WE ARE INVESTIGATING.']
      ]
    },
    'report-door': {
      top: 17, bottom: 446,
      lines: [
        [21, 97, 'TO: THE PRESIDENT'], [22, 116, 'FROM: FORWARD OBSERVER 23A-5'],
        [21, 157, 'SIR, MY MEN ARE REPORTING A LARGE THERMONUCLEAR DETONATION'],
        [21, 196, 'IN THE VICINITY OF AREA 51.'],
        [21, 237, 'THE AREA APPEARS TO BE DESTROYED...'],
        [21, 277, 'WE CAN ONLY HOPE THAT THE FIGHTER GOT AWAY.'],
        [21, 317, "HOPEFULLY THAT INCOMPETENT COMMANDER DIDN'T FORGET TO"],
        [21, 356, 'RAISE THE OUTER DOOR AGAIN.'],
        [21, 397, 'WE ARE DOOMED IF HE DID.']
      ]
    },
    'report-ammo': {
      top: 63, bottom: 417,
      lines: [
        [164, 119, 'TO: PRESIDENT'], [164, 139, 'FROM: CAPTAIN STEVE HILLER'],
        [164, 181, 'SIR--WE HAVE DISABLED THE SHIELDS...'],
        [164, 215, 'NOW WE ARE LAUNCHING WEAPONS...'],
        [166, 339, "HEY! WHERE'S THE %@%#%#@ ORDNANCE!?!?"]
      ]
    },
    'report-success': {
      top: 63, bottom: 410,
      lines: [
        [78, 121, 'TO: COMMANDER, AREA 51'], [79, 142, 'FROM: THE PRESIDENT'],
        [78, 175, 'CONGRATULATIONS!! THE LAUNCH WAS SUCCESSFUL!!!'],
        [78, 215, 'THE ALIEN THREAT HAS BEEN ELIMINATED...'],
        [78, 262, 'YOU ARE NOW PROMOTED AND WILL REPORT FOR DUTY'],
        [78, 302, 'ON THE JOINT CHIEFS OF STAFF, MONDAY IN WASHINGTON.'],
        [78, 342, 'CONGRATULATIONS!']
      ]
    },
    'report-dark': {
      top: 25, bottom: 445,
      lines: [
        [23, 84, 'TO: THE PRESIDENT'], [23, 104, 'FROM: LT. COL. HASTY'],
        [23, 142, 'A LARGE THERMONUCLEAR EXPLOSION HAS WIPED OUT AREA 51.'],
        [23, 181, 'LAST TRANSMISSION FROM THE AREA CAME FROM A PVT. JONES'],
        [23, 220, 'AND READS AS FOLLOWS'],
        [23, 266, '...WE ARE ORDERED TO LAUNCH THE FIGHTER IN THE DARK.'],
        [23, 286, 'WE ARE COMPLYING...'],
        [23, 325, 'IT WOULD SEEM THE COMMANDER HAS LOST HIS MIND.'],
        [23, 363, 'I WOULD SUGGEST A COURT-MARTIAL, BUT SINCE WE ARE ALL'],
        [23, 403, 'DOOMED, WHY BOTHER.']
      ]
    }
  };

  function element(parent, tag, attributes = {}, content) {
    const result = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attributes)) result.setAttribute(key, String(value));
    if (content !== undefined) result.textContent = content;
    parent.append(result);
    return result;
  }
  function label(parent, content, x, y, width, size, color, klass = 'sci', anchor = 'start') {
    const attrs = { x, y, fill: color, class: klass, 'font-size': size, 'text-anchor': anchor };
    if (width) { attrs.textLength = width; attrs.lengthAdjust = 'spacingAndGlyphs'; }
    return element(parent, 'text', attrs, content);
  }
  function title(parent, text, y) {
    element(parent, 'line', { x1: 0, x2: 640, y1: y + 6, y2: y + 6, stroke: '#131313', 'stroke-width': 1.5, 'stroke-dasharray': '7 4' });
    element(parent, 'rect', { x: 224, y: y - 3, width: 192, height: 20, fill: '#fff' });
    label(parent, text, 320, y + 12, 186, 13.6, '#111', 'letter', 'middle');
  }
  function transmission(name) {
    const report = reports[name];
    scrolling = element(svg, 'g');
    title(scrolling, 'URGENT TRANSMISSION', report.top);
    const body = element(scrolling, 'g');
    report.lines.forEach(([x, y, text]) => {
      label(body, text, x, y + 13, null, 13.6, '#111', 'letter');
    });
    title(scrolling, 'END TRANSMISSION', report.bottom);
  }
  function commands(state) {
    const black = '#090708', red = '#ec312e', green = '#75f345', yellow = '#e6db40';
    const items = [
      ['RESTART', 76, 457, 91, black], ['QUIT', 76, 474, 53, black],
      ['LAUNCH SHIP', 189, 457, 123, red],
      [state.lights ? 'LIGHTS OFF' : 'LIGHTS ON', 189, 474, 112, state.lights ? green : red],
      [state.tank ? 'DRAIN TANK' : 'FILL TANK', 332, 457, 111, state.tank ? yellow : green],
      [state.raised ? 'LOWER SHIP' : 'RAISE SHIP', 332, 474, 119, state.raised ? green : yellow],
      [state.doors ? 'CLOSE DOORS' : 'OPEN DOORS', 467, 457, 132, state.doors ? green : red],
      ['LOAD ORDNANCE', 467, 474, 161, red]
    ];
    for (const [text, x, y, width, color] of items) label(svg, text, x, y, width, 10.8, color);
  }
  function retry(kind) {
    const simple = ['restart', 'success', 'ammo'].includes(kind);
    const blue = '#339df5', green = '#6cf331';
    if (simple) {
      label(svg, 'WOULD YOU LIKE', 78, 211, 475, 30, blue);
      label(svg, 'TO START AGAIN?', 78, 262, 497, 30, blue);
    } else {
      label(svg, 'WOULD YOU LIKE TO', 39, 176, 564, 30, green);
      label(svg, 'REDEEM YOURSELF', 56, 226, 534, 30, green);
      label(svg, 'AND TRY AGAIN?', 79, 277, 484, 30, green);
    }
    element(svg, 'ellipse', { cx: 151, cy: 357, rx: 40, ry: 20, fill: '#68ec16' });
    element(svg, 'ellipse', { cx: 454, cy: 358, rx: 40, ry: 20, fill: '#fa1116' });
    label(svg, 'RESTART ME', 99, 401, 119, 10.8, '#7ac5bb');
    label(svg, 'PULL THE PLUG', 383, 406, 138, 10.8, '#7ac5bb');
  }
  function cool() {
    label(svg, 'COOL!!!', 113, 146, 402, 46, '#f01817');
    label(svg, 'START', 145, 247, 357, 46, '#71ec2a');
    label(svg, 'AGAIN!!', 113, 349, 410, 46, '#71ec2a');
  }
  function banner() {
    element(svg, 'rect', { x: 186, y: 442, width: 272, height: 38, fill: '#120b0b', 'fill-opacity': .82 });
    label(svg, 'COMMANDS', 200, 471, 244, 27, '#e8e238');
  }
  function credits() {
    const lines = [
      [181, '™ & © 1996 Twentieth Century Fox Film Corporation'],
      [197, 'Made in China'],
      [216, 'Produced & Distributed by Trendmasters, Inc.'],
      [233, 'St. Louis, MO 63101'],
      [252, 'To find out more about Trendmasters, be sure to drop by our website at:'],
      [269, 'http://www.trendmasters.com'],
      [287, 'To find out more about id4 be sure to visit'],
      [303, 'http://www.id4.com']
    ];
    for (const [y, text] of lines) label(svg, text, 320, y, null, 11.2, '#e9e9e9', 'letter', 'middle');
    label(svg, 'This is mission disk 11 of 11.', 320, 400, null, 11.5, '#92f65e', 'letter', 'middle');
    label(svg, 'Be sure to collect the entire ID4 series!', 320, 417, null, 11.5, '#92f65e', 'letter', 'middle');
  }
  function render(mode, state, reportName, result, progress = 1) {
    const key = mode === 'playing'
      ? [mode, state.lights, state.raised, state.tank, state.doors].join(':')
      : mode === 'intro' || mode === 'report' ? mode + ':' + reportName
        : mode === 'retry' ? mode + ':' + result : mode;
    if (currentKey !== key) {
      svg.replaceChildren(); scrolling = null; currentKey = key;
      if (mode === 'playing') commands(state);
      else if (mode === 'intro' || mode === 'report') transmission(mode === 'intro' ? 'intro' : reportName);
      else if (mode === 'retry') retry(result);
      else if (mode === 'cool') cool();
      else if (mode === 'banner') banner();
      else if (mode === 'credits') credits();
    }
    if (scrolling) scrolling.setAttribute('transform', `translate(0 ${(1 - progress) * 480})`);
  }
  return Object.freeze({ render });
})();
