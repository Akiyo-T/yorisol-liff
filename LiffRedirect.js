const LIFF_ID = '2010456176-ykpOcZre';
const UID_ENTRY_MAP = {
  'email':     { formId: '1nlFPo63RRPjlgy5Hu3K6hCZ5y7Y_QXlA0vspAd8ylWo', entryId: '2119359665' },
  'x':         { formId: '15MRA2qOwpdo6OCSwOL4ggNBNctSIO9Bc3s0jMpR2zl4', entryId: '377649373' },
  'blog':      { formId: '1z1bbsqfqDSEARSvKMIIFN0RTRc15Vm-eRVufouWkzzs', entryId: '2025616822' },
  'note':      { formId: '1gTDlML2AA7JE7fv68W9rw1V74W-SXhOwN6WGf4Mvvbk', entryId: '1070204130' },
  'tiktok':    { formId: '1pTDNzu2V0Ry_-2rpsVOo2xVten2HzuDF2m_dJxY_v2g', entryId: '1437722140' },
  'threads':   { formId: '1QDqhdabh9NRasZ0pf5YnMoOJxhsWp-rV1Yk4aHye4y4', entryId: '1490798577' },
  'line':      { formId: '1iVS20iLrgHYCPEpDJlneHUPdUnDBjcm3XS9F8UdoVPQ', entryId: '1699231252' },
  'youtube':   { formId: '1kO0DYvcNimxOS_vxEj5VjHDgZSkYAL2GT3ttTWZHBdQ', entryId: '158103014' },
  'instagram': { formId: '18S_ZlSj9OoTpmiSYRxZ6ujysSggIzEKmmuKLkFBLDqw', entryId: '112334280' }
};
const DEFAULT_FORM = { formId: '1iVS20iLrgHYCPEpDJlneHUPdUnDBjcm3XS9F8UdoVPQ', entryId: '1699231252' };

function doGet(e) {
  const source = (e && e.parameter && e.parameter.source ? e.parameter.source : '').toLowerCase();
  const uid = e && e.parameter && e.parameter.uid ? e.parameter.uid : '';
  const formData = UID_ENTRY_MAP[source] || DEFAULT_FORM;
  
  if (uid) {
    const redirectUrl = 'https://docs.google.com/forms/d/' + formData.formId + '/viewform?usp=pp_url&entry.' + formData.entryId + '=' + encodeURIComponent(uid);
    return HtmlService.createHtmlOutput('<script>window.location.href="' + redirectUrl + '";</script>');
  }
  
  const html = HtmlService.createTemplate(getLiffHtml_(source))
    .evaluate()
    .setTitle('診断フォームへ移動中...')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getLiffHtml_(source) {
  const gasUrl = ScriptApp.getService().getUrl();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 40px; color: #555;">
  <p id="msg">読み込み中...</p>
  <script>
    var LIFF_ID = '${LIFF_ID}';
    var GAS_URL = '${gasUrl}';
    var SOURCE = '${source}';
    var s = document.createElement('script');
    s.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    s.onload = function() {
      liff.init({ liffId: LIFF_ID })
        .then(function() {
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          return liff.getProfile();
        })
        .then(function(profile) {
          var uid = profile && profile.userId ? profile.userId : '';
          document.getElementById('msg').textContent = 'フォームへ移動中...';
          window.location.href = GAS_URL + '?uid=' + encodeURIComponent(uid) + '&source=' + SOURCE;
        })
        .catch(function(err) {
          document.getElementById('msg').textContent = 'エラー: ' + JSON.stringify(err);
        });
    };
    document.head.appendChild(s);
  <\/script>
</body>
</html>`;
}