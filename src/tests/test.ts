import sha256 from "../utils/sha256";

describe("sha256 function", () => {
  it("correctly hashes input string", () => {
    const input = "testpassword";
    const expectedHash = "af15c5e7b54e4b2fd3e2086d0d6c4e9c4e36b3d8a61ad75777ae4f354dfe3247";
    const actualHash = sha256(input);
    expect(actualHash).toBe(expectedHash);
  });

  it("prepends 'capybara' to input before hashing", () => {
    const input = "testpassword";
    const hashWithoutPrefix = sha256(input);
    const hashWithPrefix = sha256("capybara" + input);
    expect(hashWithoutPrefix).toBe(hashWithPrefix);
  });

  it("handles empty input", () => {
    const input = "";
    const expectedHash = "31bb4efc98f2f7239db67d660c2baf70eb2d26d08ac7f9b596e5840bbdb2f98f";
    const actualHash = sha256(input);
    expect(actualHash).toBe(expectedHash);
  });

  // Add more test cases as needed
});
