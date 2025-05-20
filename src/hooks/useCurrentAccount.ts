import { useTypedSelector } from "@/stores";

const useCurrentAccount = () => {
  const currentSuiAccount = useTypedSelector(
    (state) => state.user.currentAccount
  );

  return currentSuiAccount;
};

export default useCurrentAccount;
