import { useState, useEffect, useCallback } from "react";
import { UserViewModel } from "../models/UserViewModel";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

export function useUser() {
  const [userViewModel, setUserViewModel] = useState<UserViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      setUserViewModel(new UserViewModel(user.userId, userAttributes.preferred_username!));
    } catch (err) {
      setError("Error fetching user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { userViewModel, error, loading };
}
