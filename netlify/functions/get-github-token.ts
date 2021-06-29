import axios from "axios";
import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID!;
  const secret = process.env.GITHUB_CLIENT_SECRET!;
  const code = event.queryStringParameters.code;

  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    null,
    {
      params: { client_id: clientId, client_secret: secret, code },
      headers: { accept: "application/json" },
    }
  );

  if (response.data.error) {
    if (response.data.error === "bad_verification_code") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: response.data.error_description }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error getting token from Github" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ token: response.data.access_token }),
  };
};

export { handler };
