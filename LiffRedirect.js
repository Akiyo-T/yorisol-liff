// LIFF ID
const LIFF_ID = '2010456176-ykpOcZre';

// Google FormのベースURL
const FORM_BASE_URL = 'https://docs.google.com/forms/d/1iVS20iLrgHYCPEpDJlneHUPdUnDBjcm3XS9F8UdoVPQ/viewform';

// UID格納用のentry ID
const UID_ENTRY_ID = '1311471386';

function doGet(e) {
  const html = HtmlService.createTemplate(getLiffRedirectHtml_())
    .evaluate()
    .setTitle('診断フォームへ移動中...')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

function getLiffRedirectHtml_() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script charset="utf-8" src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 40px; color: #555;">
  <p id="msg">フォームに移動しています...</p>

  <script>
    const LIFF_ID = '${LIFF_ID}';
    const FORM_BASE_URL = '${FORM_BASE_URL}';
    const UID_ENTRY_ID = '${UID_ENTRY_ID}';

    function showError(text) {
      document.getElementById('msg').textContent = text;
    }

    function redirectToForm(uid) {
      let url = FORM_BASE_URL + '?usp=pp_url';
      if (uid) {
        url += '&entry.' + UID_ENTRY_ID + '=' + encodeURIComponent(uid);
      }
      window.location.href = url;
    }

    let resolved = false;
    setTimeout(function() {
      if (!resolved) {
        showError('タイムアウト：liff.init()が10秒以内に応答しませんでした。');
      }
    }, 10000);

    if (typeof liff === 'undefined') {
      showError('エラー：LIFF SDKの読み込みに失敗しました。');
    } else {
      liff.init({ liffId: LIFF_ID })
        .then(() => {
          resolved = true;
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          return liff.getProfile();
        })
        .then((profile) => {
          resolved = true;
          if (profile && profile.userId) {
            redirectToForm(profile.userId);
          } else {
            redirectToForm(null);
          }
        })
        .catch((err) => {
          resolved = true;
          showError('エラー発生: ' + (err && err.message ? err.message : JSON.stringify(err)));
          const btn = document.createElement('button');
          btn.textContent = 'フォームへ進む（UIDなし）';
          btn.style.marginTop = '20px';
          btn.style.padding = '10px 20px';
          btn.onclick = function() { redirectToForm(null); };
          document.body.appendChild(btn);
        });
    }
  <\/script>
</body>
</html>
`;
}