const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

import toast from "react-hot-toast";
export async function logout(router: any) {
  try {
    const data = await fetch(`${backendUrl}/api/authv1/logout`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const res = await data.json();

    if (res.success) {
      toast.success(res.message);
      router.push("/login");
    } else {
      toast.error(res.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    }
  }
}

export async function getnewbooks() {
  const response = await fetch(`${backendUrl}/api/book/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch new books");
  }

  const data = await response.json();
  console.log("data from latest book", data);
  let result = data.data;
  return result;
}
export const readBookService = async (bookId: string) => {
  const response = await fetch(`${backendUrl}/api/book/read/${bookId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  console.log("API RESPONSE:", data);

  if (!response.ok) {
    throw data;
  }

  return data.data;
};

export const bookHistory = async (search?: string) => {
  const response = await fetch(
    `${backendUrl}/api/book/history${search ? `?search=${search}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  const data = await response.json();

  return data.data;
};
export const getAllBooks = async (search?: string) => {
  const response = await fetch(
    `${backendUrl}/api/book/all${search ? `?search=${search}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.data;
};
export const getFeaturedBook = async () => {
  const response = await fetch(`${backendUrl}/api/book/feature`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch featured book");
  }

  const data = await response.json();

  return data.data;
};
export const depositService = async (amount: number) => {
  const response = await fetch(`${backendUrl}/api/book/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};

export const getUserPoints = async () => {
  const response = await fetch(`${backendUrl}/api/book/point`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data.data;
};
export const uploadBookService = async (formData: FormData) => {
  const response = await fetch(`${backendUrl}/api/admin/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};
