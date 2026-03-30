// doctor.validation.js
export const validateDoctor = (data) => {
  const errors = {};

  if (!data.name) errors.name = "Name is required";
  if (!data.email) errors.email = "Email is required";
  if (!data.contact) errors.contact = "Contact is required";
  if (!data.specialization) errors.specialization = "Specialization is required";
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!data.gender) errors.gender = "Gender is required";
  if (!data.education) errors.education = "Education is required";
  if (!data.experience || data.experience < 0) errors.experience = "Experience must be valid";
  if (!data.password || data.password.length < 6)
    errors.password = "Password must be at least 6 characters";

  return errors;
};
