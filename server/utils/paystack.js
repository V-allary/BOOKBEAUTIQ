const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackRequest = async (endpoint, method = "GET", body = null) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || "Paystack request failed.");
  }

  return data.data;
};

export default paystackRequest;
