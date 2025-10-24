// returns true if [a1,a2] overlaps [b1,b2]
export function overlaps(a1, a2, b1, b2) {
  const A1 = new Date(a1), A2 = new Date(a2), B1 = new Date(b1), B2 = new Date(b2);
  return A1 <= B2 && B1 <= A2;
}
