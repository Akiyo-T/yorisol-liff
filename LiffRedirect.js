const FORM_MAP = {
  'email':     { url: 'https://docs.google.com/forms/d/1nlFPo63RRPjlgy5Hu3K6hCZ5y7Y_QXlA0vspAd8ylWo/viewform', entryId: '1832956698' },
  'x':         { url: 'https://docs.google.com/forms/d/15MRA2qOwpdo6OCSwOL4ggNBNctSIO9Bc3s0jMpR2zl4/viewform', entryId: '675451525' },
  'blog':      { url: 'https://docs.google.com/forms/d/1z1bbsqfqDSEARSvKMIIFN0RTRc15Vm-eRVufouWkzzs/viewform', entryId: '1945407007' },
  'note':      { url: 'https://docs.google.com/forms/d/1gTDlML2AA7JE7fv68W9rw1V74W-SXhOwN6WGf4Mvvbk/viewform', entryId: '591637871' },
  'tiktok':    { url: 'https://docs.google.com/forms/d/1pTDNzu2V0Ry_-2rpsVOo2xVten2HzuDF2m_dJxY_v2g/viewform', entryId: '254347023' },
  'threads':   { url: 'https://docs.google.com/forms/d/1QDqhdabh9NRasZ0pf5YnMoOJxhsWp-rV1Yk4aHye4y4/viewform', entryId: '977291438' },
  'line':      { url: 'https://docs.google.com/forms/d/1iVS20iLrgHYCPEpDJlneHUPdUnDBjcm3XS9F8UdoVPQ/viewform', entryId: '464209906' },
  'youtube':   { url: 'https://docs.google.com/forms/d/1kO0DYvcNimxOS_vxEj5VjHDgZSkYAL2GT3ttTWZHBdQ/viewform', entryId: '499801139' },
  'instagram': { url: 'https://docs.google.com/forms/d/18S_ZlSj9OoTpmiSYRxZ6ujysSggIzEKmmuKLkFBLDqw/viewform', entryId: '1242672662' }
};
const DEFAULT_FORM = { url: 'https://docs.google.com/forms/d/1iVS20iLrgHYCPEpDJlneHUPdUnDBjcm3XS9F8UdoVPQ/viewform', entryId: '464209906' };

function getRedirectUri_() {
  return ScriptApp.getService().getUrl();
}

function buildRedirectPage_(msg, url) {
  var out = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head>'
    + '<meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">'
    + '<style>html,body{margin:0;padding:0;width:100%;}</style>'
    + '</head><body>'
    + '<p style="font-family:sans-serif;text-align:center;padding-top:40px;color:#555;font-size:16px;">' + msg + '</p>'
    + '<script>window.location.href="' + url + '";</script>'
    + '</body></html>'
  );
  out.addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
  return out;
}

function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const channelId = props.getProperty('LINE_LOGIN_CHANNEL_ID');
  const channelSecret = props.getProperty('LINE_LOGIN_CHANNEL_SECRET');
  const redirectUri = getRedirectUri_();

  const code = e && e.parameter && e.parameter.code ? e.parameter.code : '';
  const stateRaw = e && e.parameter && e.parameter.state ? e.parameter.state : '';

  if (code) {
    try {
      const tokenRes = UrlFetchApp.fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        payload: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: channelId,
          client_secret: channelSecret
        },
        muteHttpExceptions: true
      });
      const tokenJson = JSON.parse(tokenRes.getContentText());
      const idToken = tokenJson.id_token;

      const verifyRes = UrlFetchApp.fetch('https://api.line.me/oauth2/v2.1/verify', {
        method: 'post',
        contentType: 'application/x-www-form-urlencoded',
        payload: { id_token: idToken, client_id: channelId },
        muteHttpExceptions: true
      });
      const verifyJson = JSON.parse(verifyRes.getContentText());
      const uid = verifyJson.sub || '';

      const source = (stateRaw || '').toLowerCase();
      const formData = FORM_MAP[source] || DEFAULT_FORM;
      let formUrl = formData.url + '?usp=pp_url';
      if (uid) {
        formUrl += '&entry.' + formData.entryId + '=' + encodeURIComponent(uid);
      }
      return buildRedirectPage_('フォームに移動しています...', formUrl);
    } catch (err) {
      return HtmlService.createHtmlOutput('エラー: ' + err.message);
    }
  }

  const source = (e && e.parameter && e.parameter.source ? e.parameter.source : '').toLowerCase();
  const state = encodeURIComponent(source);
  const authUrl = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code'
    + '&client_id=' + encodeURIComponent(channelId)
    + '&redirect_uri=' + encodeURIComponent(redirectUri)
    + '&state=' + state
    + '&scope=openid%20profile';

  return buildRedirectPage_('診断ページに移動しています...', authUrl);
}