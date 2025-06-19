// register.ts
import type { GuestDTO, AccountDTO } from "../../types";

const BASE_URL = "http://localhost:8081/api";

export async function registerGuest(data: { guest: GuestDTO; account: AccountDTO }): Promise<void> {
  try {
    // Step 1: Create account
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
        const error = await accountResponse.json();
        if (error.message) {
          if (error.message.includes("userName")) {
            errorMessage = "Tên đăng nhập đã được sử dụng hoặc không hợp lệ!";
          } else if (error.message.includes("passWord")) {
            errorMessage = "Mật khẩu không hợp lệ!";
          } else if (error.message.includes("userRoleId")) {
            errorMessage = "Vai trò người dùng không hợp lệ!";
          } else {
            errorMessage = error.message; 
          }
        }
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    // Get the created account ID
    const accountData = await accountResponse.json();
    const accountId = accountData.id;

    // Step 2: Create guest with the account ID
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
      const error = await guestResponse.json();
      let errorMessage = "Đăng ký khách hàng thất bại!";
      if (error.message) {
        if (error.message.includes("identification number")) {
          errorMessage = "Số CCCD không hợp lệ hoặc đã được sử dụng!";
        } else if (error.message.includes("phone number")) {
          errorMessage = "Số điện thoại không hợp lệ hoặc đã được sử dụng!";
        } else if (error.message.includes("email")) {
          errorMessage = "Email không hợp lệ hoặc đã được sử dụng!";
        } else if (error.message.includes("Name")) {
          errorMessage = "Họ và tên không được để trống!";
        } else if (error.message.includes("Age")) {
          errorMessage = "Tuổi phải lớn hơn 0 và không được để trống!";
        } else if (error.message.includes("Sex")) {
          errorMessage = "Giới tính không được để trống!";
        }
      }
      await fetch(`${BASE_URL}/account/${accountId}/0/SYSTEM`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      throw new Error(errorMessage);
    }
  } catch (error) {
    throw new Error((error as Error).message || "Đăng ký thất bại!");
  }
}