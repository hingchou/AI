export function getIsoTimestr(): string {
  return new Date().toISOString();
}

export const getTimestamp = () => {
  let time = Date.parse(new Date().toUTCString());

  return time / 1000;
};

export const getMillisecond = () => {
  let time = new Date().getTime();

  return time;
};

export function getOneYearLaterTimestr(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
}
