import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function OfficerCountPage() {
  await dbConnect();
  const count = await User.countDocuments({ role: "rmo" });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Total Officers: {count}</h1>
    </div>
  );
}
