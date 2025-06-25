import React, { useState, useEffect } from 'react';
import { getGuestByAccountId } from '../services/apis/guest';
import { changePassword } from '../services/apis/auth';
import { useAuth } from '../contexts/AuthContext';
import type { GuestDTO, Sex } from '../types';

interface GuestFormData extends Omit<GuestDTO, 'accountId'> {}
interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Errors {
  name?: string;
  sex?: string;
  age?: string;
  identificationNumber?: string;
  phoneNumber?: string;
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const Profile: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [guest, setGuest] = useState<GuestFormData>({
    name: '',
    sex: 'MALE',
    age: 18,
    identificationNumber: '',
    phoneNumber: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy thông tin guest khi component mount
  useEffect(() => {
    if (!user?.id || !accessToken) {
      alert('Vui lòng đăng nhập để xem hồ sơ.');
      return;
    }
    const fetchGuest = async () => {
      try {
        setLoading(true);
        const guestData = await getGuestByAccountId(user.id);
        setGuest({
          name: guestData.name,
          sex: guestData.sex,
          age: guestData.age,
          identificationNumber: guestData.identificationNumber,
          phoneNumber: guestData.phoneNumber,
          email: guestData.email,
        });
      } catch (error) {
        alert('Không thể tải thông tin hồ sơ: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuest();
  }, [user?.id, accessToken]);

  const validateGuestInfo = (): boolean => {
    const newErrors: Errors = {};

    if (!guest.name.trim()) {
      newErrors.name = 'Họ và tên không được để trống!';
    }
    if (!/^[0-9]{12}$/.test(guest.identificationNumber)) {
      newErrors.identificationNumber = 'Số CCCD phải là 12 chữ số!';
    }
    if (!/^\d{10,11}$/.test(guest.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải có 10 hoặc 11 chữ số!';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      newErrors.email = 'Email không hợp lệ!';
    }
    if (guest.age < 18) {
      newErrors.age = 'Tuổi phải lớn hơn hoặc bằng 18!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordInfo = (): boolean => {
    const newErrors: Errors = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'Mật khẩu cũ không được để trống!';
    }
    if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự!';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuestInputChange = (field: keyof GuestFormData, value: string | number | Sex) => {
    setGuest({ ...guest, [field]: value });
    const newErrors = { ...errors };
    switch (field) {
      case 'name':
        if (!String(value).trim()) newErrors.name = 'Họ và tên không được để trống!';
        else delete newErrors.name;
        break;
      case 'identificationNumber':
        if (!/^[0-9]{12}$/.test(String(value))) {
          newErrors.identificationNumber = 'Số CCCD phải là 12 chữ số!';
        } else delete newErrors.identificationNumber;
        break;
      case 'phoneNumber':
        if (!/^\d{10,11}$/.test(String(value))) {
          newErrors.phoneNumber = 'Số điện thoại phải có 10 hoặc 11 chữ số!';
        } else delete newErrors.phoneNumber;
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          newErrors.email = 'Email không hợp lệ!';
        } else delete newErrors.email;
        break;
      case 'age':
        if (Number(value) < 18) {
          newErrors.age = 'Tuổi phải lớn hơn hoặc bằng 18!';
        } else delete newErrors.age;
        break;
    }
    setErrors(newErrors);
  };

  const handlePasswordInputChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });
    const newErrors = { ...errors };
    switch (field) {
      case 'oldPassword':
        if (!value) newErrors.oldPassword = 'Mật khẩu cũ không được để trống!';
        else delete newErrors.oldPassword;
        break;
      case 'newPassword':
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)) {
          newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự, chứa chữ hoa, chữ thường và số!';
        } else delete newErrors.newPassword;
        break;
      case 'confirmPassword':
        if (value !== passwordData.newPassword) {
          newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
        } else delete newErrors.confirmPassword;
        break;
    }
    setErrors(newErrors);
  };

  const handleGuestInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGuestInfo() || !user?.id || !accessToken) {
      alert('Vui lòng kiểm tra thông tin hoặc đăng nhập lại.');
      return;
    }
    try {
      setLoading(true);
      const updatedGuest: GuestDTO = {
        ...guest,
        accountId: user.id,
      };
      const response = await fetch(`http://localhost:8081/api/guest/${user.id}/${user.id}/GUEST`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedGuest),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      alert('Cập nhật thông tin thất bại: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordInfo() || !accessToken) {
      alert('Vui lòng kiểm tra thông tin hoặc đăng nhập lại.');
      return;
    }
    try {
      setLoading(true);
      await changePassword(passwordData, accessToken);
      alert('Thay đổi mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Thay đổi mật khẩu thất bại: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden pt-30 pb-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-64 h-64 bg-indigo-200 opacity-20 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
        <div className="absolute w-80 h-80 bg-pink-200 opacity-20 rounded-full blur-3xl animate-pulse bottom-20 right-20"></div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl z-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Hồ Sơ Cá Nhân</h2>

        {/* Form thông tin cá nhân */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Thông Tin Cá Nhân</h3>
          <form onSubmit={handleGuestInfoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guest.name}
                  onChange={(e) => handleGuestInputChange('name', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Họ và tên"
                  aria-label="Họ và tên"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </span>
                <select
                  value={guest.sex}
                  onChange={(e) => handleGuestInputChange('sex', e.target.value as Sex)}
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300"
                  aria-label="Giới tính"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tuổi</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="number"
                  value={guest.age}
                  onChange={(e) => handleGuestInputChange('age', parseInt(e.target.value))}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.age ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Tuổi"
                  min="18"
                  aria-label="Tuổi"
                />
              </div>
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">CCCD</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guest.identificationNumber}
                  onChange={(e) => handleGuestInputChange('identificationNumber', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.identificationNumber} ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Số CCCD"
                  aria-label="Số CCCD"
                />
              </div>
              {errors.identificationNumber && <p className="text-red-500 text-sm mt-1">{errors.identificationNumber}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.616l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  value={guest.phoneNumber}
                  onChange={(e) => handleGuestInputChange('phoneNumber', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Số điện thoại"
                  aria-label="Số điện thoại"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => handleGuestInputChange('email', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Email"
                  aria-label="Email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </button>
            </div>
          </form>
        </div>

        {/* Form thay đổi mật khẩu */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Thay Đổi Mật Khẩu</h3>
          <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu cũ</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" d="M12 11c0-1-0.896-2-2-2s-2 0.896-2 2m0-4c0-1-1.896-2-3-2s-2 0.896-4 2m6 4c0-1-1-2-3-2"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => handlePasswordInputChange('oldPassword', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.oldPassword ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Mật khẩu cũ"
                  aria-label="Mật khẩu cũ"
                />
              </div>
              {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" d="M12 11c0-1-0.896-2-2-2s-2-0.896-2-2m0-4c0-1-0.896-2-2-2s-2-0.896-2-2m6-4c0-1-0.896-2-2-2s-2-0.896-2-2"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.newPassword ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Mật khẩu mới"
                  aria-label="Mật khẩu mới"
                />
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
              <div className="flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke="currentColor" d="M12 11c0-1-0.896-2-2-2s-2-0.896-2-2m0-4c0-1-0.896-2-2-2s-2-0.896-2-2m6-4c0-1-0.896-2-2-2s-2-0.896-2-2"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-4 py-3 w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all duration-300`}
                  placeholder="Xác nhận mật khẩu"
                  aria-label="Xác nhận mật khẩu"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
              >
                {loading ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;