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
