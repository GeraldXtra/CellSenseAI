// reviewService: stores reviews and asks the model for the sentiment and the summary. Owner: Gerald.
export function sentimentFromRating(rating) {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

export function summaryFromRatings(ratings) {
  if (!ratings.length) {
    return {
      summary: "No reviews yet. Be the first to write one.",
      sentiment: "neutral",
    };
  }
  const average =
    ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  const label = ratings.length === 1 ? "review" : "reviews";
  return {
    summary: `${ratings.length} ${label} with an average of ${average.toFixed(1)} out of 5.`,
    sentiment: sentimentFromRating(Math.round(average)),
  };
}
