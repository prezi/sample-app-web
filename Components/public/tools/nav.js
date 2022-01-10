
/* eslint-disable no-undef */
window.addEventListener('DOMContentLoaded', function(event) {
  console.log('DOM fully loaded and parsed');
  websdkready();
});

function websdkready() {
  var testTool = window.testTool;
  if (testTool.isMobileDevice()) {
    // eslint-disable-next-line no-undef
    var vConsole = new VConsole();
  }
  console.log("checkSystemRequirements");
  // console.log(JSON.stringify(ZoomMtgEmbedded.checkSystemRequirements()));

  var API_KEY = "WXAK2vDQSq6b55j9Y5QLgA";

  /**
   * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
   * The below generateSignature should be done server side as not to expose your api secret in public
   * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature
   */
  var API_SECRET = "vhueopJKVC9pRsnzx6uQkCFysIHe4XM7Gpgz";
  // some help code, remember mn, pwd, lang to cookie, and autofill.

  // click join meeting button
  document
      .getElementById("join_meeting")
      .addEventListener("click", function (e) {
        e.preventDefault();
        var meetingConfig = testTool.getMeetingConfig();
        if (!meetingConfig.mn || !meetingConfig.name) {
          alert("Meeting number or username is empty");
          return false;
        }


        testTool.setCookie("meeting_number", meetingConfig.mn);
        testTool.setCookie("meeting_pwd", meetingConfig.pwd);

        // generateSignature define in token-tool.js
        var signature = generateSignature({
          meetingNumber: meetingConfig.mn,
          apiKey: API_KEY,
          apiSecret: API_SECRET,
          role: meetingConfig.role,
          success: function (res) {
            console.log(res);
            meetingConfig.signature = res;
            meetingConfig.apiKey = API_KEY;
            if (document.getElementById('demoType').value === 'cdn') {
              var joinUrl = "/cdn.html?" + testTool.serialize(meetingConfig);
              console.log(joinUrl);
              window.open(joinUrl, "_blank");
            } else {
              var joinUrl = "/index.html?" + testTool.serialize(meetingConfig);
              console.log(joinUrl);
              window.open(joinUrl, "_blank");
            }
          },
        });
      });
}
