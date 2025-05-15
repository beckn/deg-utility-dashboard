// app/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignIn from "@/components/signin";
import SignUp from "@/components/signout";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-white flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          DEG Energy Dashboard
        </h1>
        <div className="grid grid-cols-1">
          <Tabs defaultValue="create" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="create">Create Account</TabsTrigger>
              <TabsTrigger value="login">Login Back</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <SignUp />
            </TabsContent>
            <TabsContent value="login">
              <SignIn />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
