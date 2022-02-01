export const fromUnixDate = (unixDate) => {
  const date = new Date(+unixDate);

  return date.toISOString().split("").splice(0, 10).join("");
};

export const toUnixDate = (date) => {
  let toUnixDate = new Date(date).getTime().toString();

  return toUnixDate;
};
