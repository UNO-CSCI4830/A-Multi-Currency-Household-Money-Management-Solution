export const mockInsert = jest.fn();
export const mockFrom = jest.fn(() => ({
  insert: mockInsert,
}));

export const supabase = {
  from: mockFrom,
  // auth: {
  //   getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) // Simulate logged-in user
  // }
};