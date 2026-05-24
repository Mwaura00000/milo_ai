import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if keys are active
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let realSupabaseClient: any = null;

if (isSupabaseConfigured) {
  try {
    realSupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (error) {
    console.warn("Failed to initialize active Supabase client:", error);
  }
} else {
  console.warn(
    "Milo Notice: Supabase URL and Anon Key are missing or unconfigured. Activating Local Fallback Database Engine (localStorage mocks)."
  );
}

// Resilient fallback storage mock helpers
const getLocalStorageItem = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Local storage sync error:", error);
  }
};

// Resilient Custom Mock Client API
const mockSupabaseClient = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      const mockId = "mock-user-uuid-123456";
      const session = {
        user: { id: mockId, email, user_metadata: options?.data || {} },
        access_token: "mock-access-token",
      };
      setLocalStorageItem("milo_session", session);
      
      // Seed default subjects for this new profile
      const defaultSubjects = [
        { id: "sub-1", name: "Mathematics", user_id: mockId },
        { id: "sub-2", name: "Geography", user_id: mockId },
        { id: "sub-3", name: "Physics", user_id: mockId },
      ];
      setLocalStorageItem("milo_subjects", defaultSubjects);

      // Create profile record
      const profile = {
        id: mockId,
        academic_level: options?.data?.academic_level || "university",
        university: options?.data?.university || "",
        course: options?.data?.course || "",
        year: options?.data?.year || "",
        semester: options?.data?.semester || "",
        created_at: new Date().toISOString(),
      };
      setLocalStorageItem("milo_profile", profile);

      return { data: session, error: null };
    },
    
    signInWithPassword: async ({ email, password }: any) => {
      const activeSession = getLocalStorageItem("milo_session", null);
      if (activeSession && activeSession.user.email === email) {
        return { data: activeSession, error: null };
      }
      // If none, create dummy session
      const mockId = "mock-user-uuid-123456";
      const session = {
        user: { id: mockId, email, user_metadata: { name: "Kenyan Scholar" } },
        access_token: "mock-access-token",
      };
      setLocalStorageItem("milo_session", session);
      return { data: session, error: null };
    },

    signOut: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("milo_session");
      }
      return { error: null };
    },

    getUser: async () => {
      const session = getLocalStorageItem("milo_session", null);
      return { data: { user: session?.user || null }, error: null };
    },

    onAuthStateChange: (callback: any) => {
      // Mock subscription listener
      if (typeof window !== "undefined") {
        const session = getLocalStorageItem("milo_session", null);
        callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },

  from: (table: string) => {
    return {
      select: () => ({
        eq: (field: string, value: any) => ({
          single: async () => {
            if (table === "profiles") {
              const profile = getLocalStorageItem("milo_profile", {
                id: value,
                academic_level: "university",
                university: "University of Nairobi (UoN)",
                course: "B.Sc. Computer Science",
                year: "Year 2",
                semester: "Semester 1",
              });
              return { data: profile, error: null };
            }
            return { data: null, error: null };
          },
          async then(resolve: any) {
            if (table === "subjects") {
              const list = getLocalStorageItem("milo_subjects", [
                { id: "sub-1", name: "Mathematics" },
                { id: "sub-2", name: "Geography" },
                { id: "sub-3", name: "Physics" },
                { id: "sub-4", name: "Chemistry" },
              ]);
              resolve({ data: list, error: null });
            } else if (table === "study_sessions") {
              const list = getLocalStorageItem("study_sessions", []);
              resolve({ data: list, error: null });
            } else {
              resolve({ data: [], error: null });
            }
          },
        }),
      }),
      
      insert: (records: any) => ({
        async then(resolve: any) {
          if (table === "subjects") {
            const list = getLocalStorageItem("milo_subjects", []);
            const updated = [...list, ...(Array.isArray(records) ? records : [records])];
            setLocalStorageItem("milo_subjects", updated);
            resolve({ data: records, error: null });
          } else if (table === "study_sessions") {
            const list = getLocalStorageItem("study_sessions", []);
            const updated = [...list, ...(Array.isArray(records) ? records : [records])];
            setLocalStorageItem("study_sessions", updated);
            resolve({ data: records, error: null });
          } else {
            resolve({ data: records, error: null });
          }
        },
      }),
    };
  },
};

// Export active or mock client transparently
export const supabase = isSupabaseConfigured ? realSupabaseClient : mockSupabaseClient;
export default supabase;
