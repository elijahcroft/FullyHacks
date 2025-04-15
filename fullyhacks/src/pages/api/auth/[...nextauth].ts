import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { supabase } from "@/app/lib/supabase";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async redirect() {
      return 'http://localhost:3000/graph';
    },
    async signIn({ user }) {
      const { id, name } = user;

      try {
        const { data, error: selectError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          console.error("Database check failed:", selectError.message);
          return false;
        }

        if (!data) {
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({ id, name });

          if (insertError) {
            console.error("Failed to insert user into profiles:", insertError.message);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("Unexpected error during sign-in:", error);
        return false;
      }
    },
    async session({ session, token }) {
      session.user.id = token.sub; // Attach the user's ID to the session
      return session;
    },
  },
});