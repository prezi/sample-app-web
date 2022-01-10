function monkeyPatchMediaDevices() {
  console.log('monkeyPatchMediaDevices');
  const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices;
  const getUserMediaFn = MediaDevices.prototype.getUserMedia;

  MediaDevices.prototype.enumerateDevices = async function () {
    const res = await enumerateDevicesFn.call(navigator.mediaDevices);
    // We could add "Virtual VHS" or "Virtual Median Filter" and map devices with filters.
    res.push({
      deviceId: "virtual",
      groupId: "uh",
      kind: "videoinput",
      label: "Virtual Infogram Webcam",
      toJSON: () => {
        return JSON.stringify({
          deviceId: "virtual",
          groupId: "uh",
          kind: "videoinput",
          label: "Virtual Infogram Webcam"
        });
      }
    });
    return res;
  };

  MediaDevices.prototype.getUserMedia = async function (...args) {
    const deviceId = args?.[0]?.video && typeof args?.[0]?.video !== 'boolean' && args?.[0]?.video.deviceId;

    if (deviceId)  {
      if (
          deviceId === "virtual" ||
          (typeof deviceId !== "string" && !Array.isArray( deviceId) && deviceId.exact === 'virtual')
      ) {
        // This constraints could mimick closely the request.
        // Also, there could be a preferred webcam on the options.
        // Right now it defaults to the predefined input.
        // @ts-ignore
        return await navigator.mediaDevices.getDisplayMedia({
          video: true,
          preferCurrentTab: true
        });
      }
    }
    const res = await getUserMediaFn.call(navigator.mediaDevices, ...args);
    return res;
  };

  console.log('VIRTUAL WEBCAM INSTALLED.')
}

monkeyPatchMediaDevices();

/* eslint-disable no-undef */
window.addEventListener('DOMContentLoaded', function (event) {
  console.log('DOM fully loaded and parsed');
  websdkready();
});

function websdkready() {
  var testTool = window.testTool;
  // get meeting args from url
  var tmpArgs = testTool.parseQuery();
  var meetingConfig = {
    apiKey: tmpArgs.apiKey,
    meetingNumber: tmpArgs.mn,
    userName: (function () {
      if (tmpArgs.name) {
        try {
          return testTool.b64DecodeUnicode(tmpArgs.name);
        } catch (e) {
          return tmpArgs.name;
        }
      }
      return (
          "CDN#" +
          tmpArgs.version +
          "#" +
          testTool.detectOS() +
          "#" +
          testTool.getBrowserInfo()
      );
    })(),
    passWord: tmpArgs.pwd,
    leaveUrl: "/index.html",
    role: parseInt(tmpArgs.role, 10),
    userEmail: (function () {
      try {
        return testTool.b64DecodeUnicode(tmpArgs.email);
      } catch (e) {
        return tmpArgs.email;
      }
    })(),
    lang: tmpArgs.lang,
    signature: tmpArgs.signature || "",
    china: tmpArgs.china === "1",
  };

  // a tool use debug mobile device
  if (testTool.isMobileDevice()) {
    vConsole = new VConsole();
  }

  if (!meetingConfig.signature) {
    window.location.href = "./nav.html";
  }
  // WebSDK Embedded init
  var rootElement = document.getElementById('ZoomEmbeddedApp');
  var zmClient = ZoomMtgEmbedded.createClient();

  zmClient.init({
    debug: true,
    zoomAppRoot: rootElement,
    // assetPath: 'https://websdk.zoomdev.us/2.0.0/lib/av', //default
    webEndpoint: meetingConfig.webEndpoint,
    language: meetingConfig.lang,
    customize: {
      meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
      toolbar: {
        buttons: [
          {
            text: 'CustomizeButton',
            className: 'CustomizeButton',
            onClick: () => {
              console.log('click Customer Button');
            }
          }
        ]
      }
    }
  }).then((e) => {
    console.log('success', e);
  }).catch((e) => {
    console.log('error', e);
  });

  // WebSDK Embedded join 
  zmClient.join({
    apiKey: meetingConfig.apiKey,
    signature: meetingConfig.signature,
    meetingNumber: meetingConfig.meetingNumber,
    userName: meetingConfig.userName,
    password: meetingConfig.passWord,
    userEmail: meetingConfig.userEmail,
  }).then((e) => {
    console.log('success', e);
  }).catch((e) => {
    console.log('error', e);
  });
};

