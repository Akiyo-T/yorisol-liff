const LIFF_ID = '2010456176-ykpOcZre';
const FORM_BASE_URL = 'https://docs.google.com/forms/d/1iVS20iLrgHYCPEpDJlneHUPdUnDBjcm3XS9F8UdoVPQ/viewform';
const UID_ENTRY_ID = '1564487558';

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
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 40px; color: #555;">
  <p id="msg">読み込み中...</p>
  <script>
    document.getElementById('msg').textContent = 'Step1: HTML読み込み完了';

    var s = document.createElement('script');
    s.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    s.onload = function() {
      document.getElementById('msg').textContent = 'Step2: LIFF SDK読み込み完了。初期化中...';
      liff.init({ liffId: '${LIFF_ID}' })
        .then(function() {
          document.getElementById('msg').textContent = 'Step3: 初期化OK。ログイン確認中...';
          if (!liff.isLoggedIn()) {
            document.getElementById('msg').textContent = 'Step4: 未ログイン。ログイン処理中...';
            liff.login();
            return;
          }
          document.getElementById('msg').textContent = 'Step4: ログイン済み。UID取得中...';
          return liff.getProfile();
        })
        .then(function(profile) {
          if (profile && profile.userId) {
            document.getElementById('msg').textContent = 'Step5: UID取得成功。フォームへ移動...';
            var url = '${FORM_BASE_URL}?usp=pp_url&entry.${UID_ENTRY_ID}=' + encodeURIComponent(profile.userId);
            window.location.href = url;
          } else {
            document.getElementById('msg').textContent = 'Step5: UIDなし。フォームへ移動...';
            window.location.href = '${FORM_BASE_URL}';
          }
        })
        .catch(function(err) {
          document.getElementById('msg').textContent = 'エラー: ' + JSON.stringify(err);
        });
    };
    s.onerror = function() {
      document.getElementById('msg').textContent = 'エラー: LIFF SDKの読み込みに失敗しました';
    };
    document.head.appendChild(s);
  <\/script>
</body>
</html>
`;
}