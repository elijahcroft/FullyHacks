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
    async signIn({ user }) {
      const { id, name } = user;
  
      
      const { data, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
  
      if (selectError && selectError.code !== "PGRST116") {
        console.error("DB check failed:", selectError);
        return false;
      }
  
      // If not found, insert them
      if (!data) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id, name });
  
        if (insertError) {
          console.error("Insert failed:", insertError);
          return false;
        }
      }
  
      // Optional: attach their data to session somehow
  
      return true;
    },
  }
  
  
    
});