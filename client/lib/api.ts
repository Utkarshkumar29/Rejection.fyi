const fetchApi = async (url:string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/${url}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export default fetchApi;