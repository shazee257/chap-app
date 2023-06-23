import axios from "axios";

export async function fetchApi({
  method,
  endPoint,
  params,
  data,
  token,
  isFormData = false,
}: any) {
  const headers: any = isFormData
    ? { "Content-Type": "multipart/form-data" }
    : { "Content-Type": "application/json" };

  // if token is present then set it in headers
  if (token) headers.token = token;

  const config = {
    method,
    url: `${process.env.NEXT_PUBLIC_BaseURL}/api/${endPoint}`,
    headers,
    params,
    data: data ? data : {},
  };

  try {
    const response = await axios(config);
    return [response.data, null];
  } catch (error) {
    console.log("error: ", error);
    return [null, error];
  }
}
