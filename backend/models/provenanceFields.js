// Keep source text and combined statuses exactly as supplied; never default to verified.
// Dates remain source strings, avoiding timezone conversion or invented dates.
export default {
  verification_status: String,
  source: String,
  source_url: String,
  verified_date: String,
};
