export type TestUser = {
  id: number;
  userId: string;
  username: string;
  password: string;
};

export type TestToken = {
  id: number;
  userId: number;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
};

export type TestDbState = {
  users: TestUser[];
  tokens: TestToken[];
  nextUserId: number;
  nextTokenId: number;
};

export function createEmptyDbState(): TestDbState {
  return {
    users: [],
    tokens: [],
    nextUserId: 1,
    nextTokenId: 1,
  };
}

export function resetDbState(state: TestDbState): void {
  state.users.length = 0;
  state.tokens.length = 0;
  state.nextUserId = 1;
  state.nextTokenId = 1;
}
