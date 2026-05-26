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
      
      // Seed empty subjects list for this new profile
      setLocalStorageItem("milo_subjects", []);

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
    const chain: any = {
      select: () => chain,
      eq: (field: string, value: any) => {
        chain[field] = value;
        return chain;
      },
      single: async () => {
        if (table === "profiles") {
          const profile = getLocalStorageItem("milo_profile", {
            id: chain.id || "mock-user-uuid-123456",
            academic_level: "university",
            university: "University of Nairobi (UoN)",
            course: "B.Sc. Computer Science",
            year: "Year 2",
            semester: "Semester 1",
            focus_capacity: "",
            energy_rhythm: "",
            processing_style: "",
            friction_type: "",
          });
          return { data: profile, error: null };
        }
        return { data: null, error: null };
      },
      then: async (resolve: any) => {
        if (table === "university_matrix") {
          const uName = (chain.university_name || "").toLowerCase();
          const dName = (chain.degree_name || "").toLowerCase();
          
          if (uName.includes("nairobi") && dName.includes("nursing")) {
            resolve({
              data: [{
                id: "matrix-1",
                university_name: "University of Nairobi",
                degree_name: "B.Sc. Nursing",
                year: "Year 1",
                semester: "Semester 1",
                default_units: ["Fundamentals of Nursing", "Human Anatomy I", "Medical Physiology I", "Communication Skills"]
              }],
              error: null
            });
            return;
          }
          if (uName.includes("kabarak") && dName.includes("law")) {
            resolve({
              data: [{
                id: "matrix-2",
                university_name: "Kabarak University",
                degree_name: "IT and Law",
                year: "Year 1",
                semester: "Semester 1",
                default_units: ["Introduction to Computer Systems", "Law of Torts", "Constitutional Law", "Programming Methodology"]
              }],
              error: null
            });
            return;
          }
          resolve({ data: [], error: null });
        } else if (table === "subjects") {
          const list = getLocalStorageItem("milo_subjects", []);
          resolve({ data: list, error: null });
        } else if (table === "study_sessions") {
          const list = getLocalStorageItem("study_sessions", []);
          resolve({ data: list, error: null });
        } else {
          resolve({ data: [], error: null });
        }
      },
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
      update: (fields: any) => ({
        eq: (field: string, value: any) => ({
          async then(resolve: any) {
            if (table === "profiles") {
              const current = getLocalStorageItem("milo_profile", {
                id: value,
                academic_level: "university",
                university: "University of Nairobi (UoN)",
                course: "B.Sc. Computer Science",
                year: "Year 2",
                semester: "Semester 1",
              });
              const updated = { ...current, ...fields };
              setLocalStorageItem("milo_profile", updated);
              
              if (fields.focus_capacity) localStorage.setItem("milo_focus_capacity", fields.focus_capacity);
              if (fields.energy_rhythm) localStorage.setItem("milo_energy_rhythm", fields.energy_rhythm);
              if (fields.processing_style) localStorage.setItem("milo_processing_style", fields.processing_style);
              if (fields.friction_type) localStorage.setItem("milo_friction_type", fields.friction_type);
              
              resolve({ data: updated, error: null });
            } else {
              resolve({ data: fields, error: null });
            }
          }
        })
      }),
    };
    return chain;
  },
};

// Export active or mock client transparently
export const supabase = isSupabaseConfigured ? realSupabaseClient : mockSupabaseClient;
export default supabase;
