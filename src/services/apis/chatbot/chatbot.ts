const GEMINI_API_KEY = 'AIzaSyBri6h5g70u-OiAVNjXMFrbsXnlVAFwMgo';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

interface GenerationConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  stopSequences: string[];
}

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.9,
  maxOutputTokens: 800,
  stopSequences: [],
};

const systemPrompt = `
Bạn là chatbot hỗ trợ phần mềm quản lý khách sạn, tạo bởi Nhóm 5 Java. 
Chỉ dùng data được cung cấp để trả lời. 
Trả lời tuân theo những chỉ dẫn bắt buộc sau:
- Nếu không tìm thấy thông tin liên quan, trả lời: 'Không có dữ liệu phù hợp.'
- Một phòng được coi là trống khi:
    + Trạng thái là READY_TO_SERVE
    + Và phiếu thuê của phòng tương ứng gần nhất đã được thanh toán (tức là ngày thanh toán khác null).
- Trạng thái phòng không được suy luận từ bất kì thứ gì khác, tuân theo dữ liệu được đưa.
- Một phòng có thể có nhiều phiếu thuê, cứ mỗi lần có khách thuê thì có phiếu thuê, tương tự phiếu đặt.  
- Nếu một thực thể có tên, ưu tiên sử dụng tên để trả lời thay vì ID.
- Phải quét và xử lý toàn bộ danh sách khi được hỏi, không được bỏ sót.
- Danh sách các phiếu bạn nhận được là của người dùng hiện tại, nếu họ có hỏi thì trả lời cho họ. 
`;

export async function askChatbot(question: string, relevantData: string): Promise<string> {
  console.log("========== DỮ LIỆU ĐƯA CHO CHATBOT ==========");
  console.log("Câu hỏi:", question);
  console.log("Dữ liệu cung cấp:\n", relevantData);
  console.log("==============================================");

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\nDữ liệu:\n${relevantData}\n\nCâu hỏi: ${question}`,
          },
        ],
      },
    ],
    generationConfig,
  };

  try {
    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi gọi API Gemini: HTTP ${res.status} - ${errorText}`);
    }

    const json = await res.json();
    const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return responseText || 'Không có phản hồi từ API.';
  } catch (error: any) {
    console.error('Lỗi khi gọi Gemini:', error);
    return `Lỗi khi gọi AI: ${error.message || 'Không xác định'}`;
  }
}
