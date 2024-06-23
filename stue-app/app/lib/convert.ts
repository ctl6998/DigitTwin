export default function convertTimestamp(timestamp: string | number): string {
  // Convert timestamp to number if it's a string
  const timestampNumber = typeof timestamp === 'string' ? parseFloat(timestamp) : timestamp;

  // Create a Date object from the timestamp
  const date = new Date(timestampNumber * 1000);

  // Adjust the date to GMT+7
  const gmtPlus7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // Get individual components of the date and time
  const day = String(gmtPlus7Date.getUTCDate()).padStart(2, '0');
  const month = String(gmtPlus7Date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = gmtPlus7Date.getUTCFullYear();

  // Get hours, minutes, and seconds
  let hours = gmtPlus7Date.getUTCHours();
  const minutes = String(gmtPlus7Date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(gmtPlus7Date.getUTCSeconds()).padStart(2, '0');

  // Determine AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = String(hours).padStart(2, '0');

  // Format the date and time
  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}