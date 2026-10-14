export function nameProblem(name) {
  if (name.length < 2 || name.length > 60)
    return "Enter a name between 2 and 60 characters";
  return null;
}
