export const getUserInitials = (firstName, lastName) => {
  const firstNameInitial = firstName ? firstName[0].toUpperCase() : "";
  const lastNameInitial = lastName ? lastName[0].toUpperCase() : "";

  return firstNameInitial + lastNameInitial;
};