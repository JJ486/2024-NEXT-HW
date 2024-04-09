import sha256 from "../utils/sha256";

describe("sha256 function", () => {
  it("correctly hashes input string", () => {
    const input = "testpassword";
    const expectedHash = "56F0903751EFCF9FA75F05C8FAF07CD3AA20B5368B5B7F0CB409BD2A9E6F02BC";
    const actualHash = sha256(input);
    expect(actualHash).toBe(expectedHash);
  });
});
