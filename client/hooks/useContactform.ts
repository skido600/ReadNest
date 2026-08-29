import { CreateUserSchema } from "@/helper/validate";
import { useState } from "react";
import toast from "react-hot-toast";

type Inputs = {
  name: string;
  email: string;
  message: string;
};

function useContactform() {
  const [formdata, setFormdata] = useState<Inputs>({
    name: "",
    email: "",
    message: "",
  });
  const [loader, setLoader] = useState<boolean>(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = CreateUserSchema.validate(formdata);

    if (error) {
      toast.error(error.details[0].message as string);
      return;
    }
    postuserData();
  };

  const postuserData = async () => {
    setLoader(true);
    try {
      const postform = await fetch("/api/sendmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });

      const response = await postform.json();
      if (response.success) {
        toast.success(response.message);
        setFormdata({ name: "", email: "", message: "" });
      } else {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoader(false);
    }
  };
  return {
    loader,
    onSubmit,
    handleChange,
    formdata,
  };
}

export default useContactform;
