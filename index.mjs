import fetch from 'node-fetch';

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const message = body.message || 'Hello from Lambda!';

  return {
    statusCode: 200,
    body: JSON.stringify({ reply: `You said: ${message}` }),
  };
};

