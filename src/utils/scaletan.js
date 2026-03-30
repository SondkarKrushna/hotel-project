export const scaletanSuccess = (response) => {
  return {
    success: true,
    message: response?.message || "Success",
    data: response?.data || [],
  };
};

export const scaletanError = (error) => {
  return {
    success: false,
    message:
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong",
    status: error?.response?.status || 500,
    data: null,
  };
};
