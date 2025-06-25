import type {
    LoginDTO,
    ResponseLoginDTO,
    RefreshTokenDTO,
    RefreshResultDTO,
    ForgotPasswordDTO,
} from '../../types';

const BASE_URL = 'http://localhost:8081/api/authentication';

export async function login(data: LoginDTO): Promise<ResponseLoginDTO> {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Login failed: ' + error);
    }

    return await response.json();
}

export async function refreshToken(data: RefreshTokenDTO): Promise<RefreshResultDTO> {
    const response = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error('Refresh token failed: ' + error);
    }

    return await response.json();
}

export async function forgotPassword(data: ForgotPasswordDTO): Promise<void> {
  const response = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to send reset code');
  }
}
