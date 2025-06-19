import type { GuestDTO, AccountDTO } from "../../types";

const BASE_URL = "http://localhost:8081/api";

interface RegisterGuestDTO {
  name: string;
  sex: string;
  age: number;
  identificationNumber: string;
  phoneNumber: string;
  email: string;
  accountId: number | null; 
  username: string; 
  password: string;
  userRoleId: number;
}

export async function registerGuest(data: RegisterGuestDTO): Promise<void> {
  const response = await fetch(`${BASE_URL}/guest/0/SYSTEM`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      sex: data.sex,
      age: data.age,
      identificationNumber: data.identificationNumber,
      phoneNumber: data.phoneNumber,
      email: data.email,
      accountId: null, 
      username: data.username,
      password: data.password,
      userRoleId: data.userRoleId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    let errorMessage = "Đăng ký thất bại!";
    if (error.message) {
      if (error.message.includes("username")) {
        errorMessage = "Tên đăng nhập đã được sử dụng!";
      } else if (error.message.includes("identification number")) {
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
    throw new Error(errorMessage);
  }
}