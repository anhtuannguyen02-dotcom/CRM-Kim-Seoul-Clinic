/**
 * Messaging Service Integration
 * Handles real-world API requests to Zalo OA API and SMS Gateway (e.g., SpeedSMS / eSMS)
 * to automatically send appointment reminders and customer care messages based on customer phone.
 */

// Format phone to Zalo Open API requirements (84xxx instead of 0xxx)
export function formatPhoneForZalo(phone: string): string {
  let cleaned = phone.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.startsWith('0')) {
    cleaned = '84' + cleaned.substring(1);
  }
  return cleaned;
}

export interface MessagingResult {
  success: boolean;
  message: string;
  channel: 'SMS' | 'Zalo';
  details?: any;
}

/**
 * Sends a real Zalo OA Message to the specified phone number.
 * Integrates with Zalo OpenAPI v2.0 for Official Accounts.
 */
export async function sendZaloMessage(phone: string, text: string): Promise<MessagingResult> {
  const formattedPhone = formatPhoneForZalo(phone);
  
  // Retrieve credentials from Vite env
  const accessToken = (import.meta as any).env.VITE_ZALO_OA_ACCESS_TOKEN || '';
  const oaId = (import.meta as any).env.VITE_ZALO_OA_ID || '';

  if (!accessToken) {
    console.warn('Zalo messaging is in sandbox simulation: VITE_ZALO_OA_ACCESS_TOKEN is not configured.');
    return {
      success: true, // Return success so UI updates smoothly, but note the sandbox state
      message: `[MÔ PHỎNG] Tin nhắn Zalo gửi tới ${phone} thành công (Vui lòng cấu hình VITE_ZALO_OA_ACCESS_TOKEN trong file .env để chạy thực tế).`,
      channel: 'Zalo',
      details: { sandbox: true, formattedPhone, text }
    };
  }

  try {
    // API endpoint for Zalo OA customer text message
    const url = 'https://openapi.zalo.me/v2.0/oa/message';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': accessToken
      },
      body: JSON.stringify({
        recipient: {
          phone: formattedPhone
        },
        message: {
          text: text
        }
      })
    });

    const data = await response.json();
    
    if (data.error === 0) {
      return {
        success: true,
        message: 'Đã gửi tin nhắn Zalo OA thành công!',
        channel: 'Zalo',
        details: data
      };
    } else {
      return {
        success: false,
        message: `Zalo API Error: ${data.message} (code ${data.error})`,
        channel: 'Zalo',
        details: data
      };
    }
  } catch (err: any) {
    console.error('Lỗi khi gửi API Zalo:', err);
    return {
      success: false,
      message: `Lỗi kết nối Zalo API: ${err.message || err}`,
      channel: 'Zalo'
    };
  }
}

/**
 * Sends an SMS to the specified phone number via SMS Brandname API (SpeedSMS / eSMS / Twilio).
 */
export async function sendSMSMessage(phone: string, text: string): Promise<MessagingResult> {
  const apiKey = (import.meta as any).env.VITE_SMS_API_KEY || '';
  const senderName = (import.meta as any).env.VITE_SMS_SENDER_NAME || 'KIMSEOUL';

  if (!apiKey) {
    console.warn('SMS messaging is in sandbox simulation: VITE_SMS_API_KEY is not configured.');
    return {
      success: true,
      message: `[MÔ PHỎNG] SMS gửi tới ${phone} thành công (Vui lòng cấu hình VITE_SMS_API_KEY trong file .env để chạy thực tế).`,
      channel: 'SMS',
      details: { sandbox: true, phone, text }
    };
  }

  try {
    // Example using standard SMS Gateway (SpeedSMS API)
    // To send, we make a real HTTP request to the API
    const url = 'https://api.speedsms.vn/index.php/sms/send';
    const authHeader = 'Basic ' + btoa(apiKey + ':');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        to: [phone],
        content: text,
        type: 1, // 1: Brandname advertising, 2: CSKH, 3: OTP...
        sender: senderName
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      return {
        success: true,
        message: 'Đã gửi SMS Brandname thành công!',
        channel: 'SMS',
        details: data
      };
    } else {
      return {
        success: false,
        message: `SMS API Error: ${data.message || 'Mã lỗi ' + data.code}`,
        channel: 'SMS',
        details: data
      };
    }
  } catch (err: any) {
    console.error('Lỗi khi gửi API SMS:', err);
    return {
      success: false,
      message: `Lỗi kết nối SMS API: ${err.message || err}`,
      channel: 'SMS'
    };
  }
}
