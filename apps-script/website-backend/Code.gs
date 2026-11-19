/**
 * Alumni Meetup Website Backend (READ-ONLY)
 *
 * Bind this Apps Script project to the Google Sheet using Extensions > Apps Script.
 * The public website can only read approved, explicitly whitelisted fields.
 * There is intentionally no doPost() and no public write endpoint.
 */
function getBook() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

var PUBLIC_FIELDS = {
  profiles: ['timestamp', 'name', 'year', 'branch', 'role', 'want', 'experience', 'guide', 'linkedin', 'photo'],
  updates: ['timestamp', 'title', 'body'],
  guests: ['name', 'note', 'sortOrder', 'photo'],
  students: ['name', 'role', 'linkedin', 'sortOrder', 'photo']
};

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'all';
    if (action !== 'all') return jsonOut({ ok: false, error: 'Unknown action' });

    var result = { ok: true };
    Object.keys(PUBLIC_FIELDS).forEach(function (tabName) {
      result[tabName] = readPublicTab(tabName);
    });
    return jsonOut(result);
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

/** Return only approved rows and only fields explicitly listed above. */
function readPublicTab(tabName) {
  var sheet = getBook().getSheetByName(tabName);
  if (!sheet) return [];

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var source = {};
    headers.forEach(function (header, c) {
      var value = values[i][c];
      source[header] = value instanceof Date ? value.toISOString() : String(value == null ? '' : value).trim();
    });

    if (String(source.status || '').toLowerCase() !== 'approved') continue;
    if (!source.name && !source.title) continue;

    var publicRow = {};
    PUBLIC_FIELDS[tabName].forEach(function (field) {
      publicRow[field] = source[field] || '';
    });
    publicRow._row = i + 1;
    rows.push(publicRow);
  }

  if (tabName === 'guests' || tabName === 'students') {
    rows.sort(function (a, b) {
      var ax = a.sortOrder === '' ? a._row : Number(a.sortOrder);
      var bx = b.sortOrder === '' ? b._row : Number(b.sortOrder);
      return ax - bx;
    });
  }
  return rows;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
