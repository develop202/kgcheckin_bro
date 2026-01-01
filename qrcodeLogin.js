import { close_api, delay, send, startService } from "./utils/utils.js";
import { execSync } from 'child_process'

async function qrcode() {

  // 启动服务
  const api = startService()
  await delay(2000)
  let qrcode = ""
  const userinfo = []
  const number = parseInt(process.env.NUMBER)
  try {
    for (let i = 0; i < number; i++) {
      // 二维码
      const result = await send(`/login/qr/key?timestrap=${Date.now()}`, "GET", {})
      if (result.status === 1) {
        qrcode = result.data.qrcode
        const img_base64 = result.data.qrcode_img;
        const buffer = Buffer.from(img_base64, "base64")
      } else {
        console.log("响应内容")
        console.dir(result, { depth: null })
        throw new Error("请求出错")
      }
      if (qrcode == "") {
        throw new Error("二维码异常")
      }
      console.log()
      console.log("正在等待，请扫描二维码并确定登录")
      // 登录
      for (let i = 0; i < 50; i++) {
        const timestrap = Date.now();
        const res = await send(`/login/qr/check?key=${qrcode}&timestrap=${timestrap}`, "GET", {})
        const status = res?.data?.status
        switch (status) {
          case 0:
            console.log("二维码已过期")
            break

          case 1:
            // console.log("未扫描二维码")
            break

          case 2:
            // console.log("二维码未确认，请点击确认登录")
            break
          case 4:
            console.log("登录成功！")
            console.log("第一行是token,第二行是userid")
            console.log(res.data.token)
            console.log(res.data.userid)
            userinfo.push({
              userid: res.data.userid,
              token: res.data.token
            })
            break;
          default:
            console.log("请求出错")
            console.dir(res, { depth: null })
        }
        if (status == 4) {
          break
        }
        await delay(2000)
      }
    }
    execSync("")
  } finally {
    close_api(api)
  }

  if (api.killed) {
    // 强制关闭进程
    // 必须强制关闭，不然action不会停止
    process.exit(0)
  }
}

qrcode()
