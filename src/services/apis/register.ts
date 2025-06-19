import type { GuestDTO, AccountDTO } from "../../types";

const BASE_URL = "http://localhost:9090/api";

export async function registerGuest(data: { guest: GuestDTO; account: AccountDTO }): Promise<void> {
  // Create account
  const accountResponse = await fetch(`${BASE_URL}/account/0/SYSTEM`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: data.account.username,
      password: data.account.password,
      userRoleId: data.account.userRoleId,
    }),
  });

  if (!accountResponse.ok) {
    let errorMessage = "Đăng ký tài khoản thất bại!";
    try {
      const contentType = accountResponse.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const error = await accountResponse.json();
        const msg = error?.message || "";

        if (msg.includes("userName")) {
          throw { field: "username", message: "Tên đăng nhập đã được sử dụng hoặc không hợp lệ!" };
        } else if (msg.includes("passWord")) {
          throw { field: "password", message: "Mật khẩu không hợp lệ!" };
        } else if (msg.includes("userRoleId")) {
          throw { field: "userRoleId", message: "Vai trò người dùng không hợp lệ!" };
        } else {
          throw { message: msg || errorMessage };
        }
      } else {
        const rawText = await accountResponse.text();
        throw { message: rawText || errorMessage };
      }
    } catch (e: any) {
      throw e?.message ? e : { message: errorMessage };
    }
  }

  const accountData = await accountResponse.json();
  const accountId = accountData.id;

  // Create guest
  const guestResponse = await fetch(`${BASE_URL}/guest/0/SYSTEM`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.guest.name,
      sex: data.guest.sex,
      age: data.guest.age,
      identificationNumber: data.guest.identificationNumber,
      phoneNumber: data.guest.phoneNumber,
      email: data.guest.email,
      accountId: accountId,
    }),
  });

  if (!guestResponse.ok) {
    let errorMessage = "Đăng ký khách hàng thất bại!";
    try {
      const contentType = guestResponse.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const error = await guestResponse.json();
        const msg = error?.message || "";

        if (msg.includes("identification number")) {
          throw { field: "identificationNumber", message: "Số CCCD không hợp lệ hoặc đã được sử dụng!" };
        } else if (msg.includes("phone number")) {
          throw { field: "phoneNumber", message: "Số điện thoại không hợp lệ hoặc đã được sử dụng!" };
        } else if (msg.includes("email")) {
          throw { field: "email", message: "Email không hợp lệ hoặc đã được sử dụng!" };
        } else if (msg.includes("Name")) {
          throw { field: "name", message: "Họ và tên không được để trống!" };
        } else if (msg.includes("Age")) {
          throw { field: "age", message: "Tuổi phải lớn hơn 0 và không được để trống!" };
        } else if (msg.includes("Sex")) {
          throw { field: "sex", message: "Giới tính không được để trống!" };
        } else {
          throw { message: msg || errorMessage };
        }
      } else {
        const rawText = await guestResponse.text();
        throw { message: rawText || errorMessage };
      }
    } catch (e: any) {
      await fetch(`${BASE_URL}/account/${accountId}/0/SYSTEM`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      throw e?.message ? e : { message: errorMessage };
    }
  }
}
