import { getServerSession } from "next-auth";

import prismadb from '@/lib/prismadb';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

const serverAuth = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not signed in');
  }

  const currentUser = await prismadb.user.findUnique({
    where: {
      id: session.user.id,
    }
  });
  
  if (!currentUser) {
    throw new Error('Not signed in');
  }

  return { currentUser };
}

export default serverAuth;
