import { baseLayout, colors, metaBar } from "./shared";

export interface ContactMessageData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export function contactMessageSubject(data: ContactMessageData) {
  return `[Contact] ${data.topic} — ${data.name}`;
}

export function contactMessageHtml(data: ContactMessageData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:24px;padding-bottom:16px;">
        New Contact Form Message
      </td>
    </tr>
    ${metaBar([
      { label: "From", value: data.name },
      { label: "Email", value: data.email },
      { label: "Topic", value: data.topic },
    ])}
    <tr><td style="height:20px;"></td></tr>
    <tr>
      <td style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:12px;padding:20px;color:${colors.navy};font-size:14px;line-height:22px;white-space:pre-wrap;">
        ${data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
      </td>
    </tr>
  `;
  return baseLayout(body);
}
