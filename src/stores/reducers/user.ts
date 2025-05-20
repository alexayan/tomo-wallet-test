import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  currentAccount: {
    address: string;
  } | null;
};

const slice = createSlice({
  name: "user",
  initialState: {
    currentAccount: null,
  } as UserState,
  reducers: {
    setCurrentAccount(
      state,
      action: PayloadAction<UserState["currentAccount"]>
    ) {
      state.currentAccount = action.payload;
    },
  },
});

export const actions = {
  ...slice.actions,
};

export default slice.reducer;
