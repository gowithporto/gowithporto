import { baseLayout, colors, metaBar } from "./shared";

export interface AdminNewUserData {
  name: string;
  email: string;
}

export function adminNewUserSubject(data: AdminNewUserData) {
  return `[GoWithPorto] New user signup — ${data.name}`;
}

export function adminNewUserHtml(data: AdminNewUserData) {
  const body = `
    <tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;color:${colors.navy};font-size:24px;padding-bottom:16px;">
        New User Registered
      </td>
    </tr>
    ${metaBar([
      { label: "Name", value: data.name },
      { label: "Email", value: data.email },
    ])}
  `;
  return baseLayout(body);
}
