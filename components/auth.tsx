"use client"

import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
	const router = useRouter();
	const { data: authData, isPending } = useAuth();

	const redirect = (path: string) => {
		console.log("Not Authorized, Redirecting");
		router.push(path);
		return null;
	};

	if (isPending) return <Loader2 className="w-3 h-3 animate-spin" />;
	const matches = pathname.match(/\/(aggregator)/);
	if (matches) {

        console.log(authData);

		// if (!authData?.user) return redirect("/");

		// const path = matches[1] as "client" | "resource" | "onboarding";

		// if (authData.user.type === "unknown" && path !== "onboarding")
		// 	return redirect("/onboarding");

		// if (authData.user.type === "client" && path !== "client")
		// 	return redirect("/client");

		// if (authData.user.type === "resource" && path !== "resource")
		// 	return redirect("/resource");
	}

	return <>{children}</>;
}