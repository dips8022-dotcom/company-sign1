
const Anthropic = require('@anthropic-ai/sdk');

// 1. API 키 설정
// Anthropic 콘솔에서 API 키를 발급받아 아래 'YOUR_ANTHROPIC_API_KEY' 부분에 붙여넣으세요.
// 보안을 위해 실제 프로젝트에서는 환경 변수 사용을 권장합니다.
const anthropic = new Anthropic({
  apiKey: 'YOUR_ANTHROPIC_API_KEY',
});

async function main() {
  if (process.argv.length < 3) {
    console.log("사용법: node claude.js \"당신의 메시지\"");
    return;
  }
  
  // 2. 터미널에서 전달된 메시지 가져오기
  const userMessage = process.argv.slice(2).join(' ');

  try {
    console.log(`보내는 메시지: ${userMessage}`);
    console.log('Claude의 답변을 기다리는 중...');

    // 3. Claude에게 메시지 보내기
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ role: 'user', content: userMessage }],
      model: 'claude-3-opus-20240229', // 또는 'claude-3-sonnet-20240229' 등
    });

    // 4. 답변 출력
    console.log('\n--- Claude의 답변 ---');
    console.log(message.content[0].text);
    console.log('--------------------');

  } catch (error) {
    console.error('Claude API 호출 중 오류가 발생했습니다:', error);
  }
}

main();
